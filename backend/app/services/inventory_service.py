from typing import List, Optional
from datetime import datetime, timezone
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.models import (
    StockLevel, StockMovement, Receipt, ReceiptLine,
    Delivery, DeliveryLine, Transfer, TransferLine,
    Adjustment, Product, Location, Warehouse, User,
    OperationStatus, MovementType, Alert
)

def utc_now():
    return datetime.now(timezone.utc)

class InventoryService:
    @staticmethod
    def get_or_create_stock_level(
        db: Session,
        organization_id: int,
        product_id: int,
        warehouse_id: int,
        location_id: int
    ) -> StockLevel:
        stock = db.query(StockLevel).filter(
            StockLevel.organization_id == organization_id,
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id
        ).with_for_update().first()

        if not stock:
            stock = StockLevel(
                organization_id=organization_id,
                product_id=product_id,
                warehouse_id=warehouse_id,
                location_id=location_id,
                on_hand=0.0,
                reserved=0.0,
                available=0.0
            )
            db.add(stock)
            db.flush()
        return stock

    @classmethod
    def validate_receipt(
        cls,
        db: Session,
        receipt: Receipt,
        actor: User
    ) -> Receipt:
        if receipt.status == OperationStatus.DONE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Receipt {receipt.receipt_number} has already been validated and processed."
            )
        if receipt.status == OperationStatus.CANCELLED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot validate cancelled receipt {receipt.receipt_number}."
            )

        if not receipt.lines:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Receipt must contain at least one line item."
            )

        for line in receipt.lines:
            qty = line.quantity_expected
            if qty <= 0:
                continue

            stock = cls.get_or_create_stock_level(
                db=db,
                organization_id=receipt.organization_id,
                product_id=line.product_id,
                warehouse_id=receipt.destination_warehouse_id,
                location_id=receipt.destination_location_id
            )

            prev_qty = stock.on_hand
            new_qty = prev_qty + qty
            stock.on_hand = new_qty
            stock.available = new_qty - stock.reserved
            line.quantity_received = qty

            movement = StockMovement(
                organization_id=receipt.organization_id,
                product_id=line.product_id,
                warehouse_id=receipt.destination_warehouse_id,
                location_id=receipt.destination_location_id,
                movement_type=MovementType.RECEIPT.value,
                quantity=qty,
                previous_quantity=prev_qty,
                resulting_quantity=new_qty,
                reference_type="receipt",
                reference_id=receipt.receipt_number,
                reason=f"Received on {receipt.receipt_number}",
                actor_id=actor.id
            )
            db.add(movement)

        receipt.status = OperationStatus.DONE.value
        receipt.validated_at = utc_now()
        db.commit()
        db.refresh(receipt)
        return receipt

    @classmethod
    def validate_delivery(
        cls,
        db: Session,
        delivery: Delivery,
        actor: User
    ) -> Delivery:
        if delivery.status == OperationStatus.DONE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Delivery {delivery.delivery_number} has already been validated and dispatched."
            )
        if delivery.status == OperationStatus.CANCELLED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot validate cancelled delivery {delivery.delivery_number}."
            )

        if not delivery.lines:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery must contain at least one line item."
            )

        # Pre-check all items to ensure atomic failure with detailed error
        for line in delivery.lines:
            product = db.query(Product).filter(Product.id == line.product_id).first()
            prod_name = product.name if product else f"ID {line.product_id}"
            prod_sku = product.sku if product else "N/A"

            stock = db.query(StockLevel).filter(
                StockLevel.organization_id == delivery.organization_id,
                StockLevel.product_id == line.product_id,
                StockLevel.location_id == delivery.source_location_id
            ).with_for_update().first()

            available = stock.available if stock else 0.0
            if available < line.quantity_requested:
                loc = db.query(Location).filter(Location.id == delivery.source_location_id).first()
                loc_name = loc.name if loc else str(delivery.source_location_id)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product '{prod_name}' (SKU: {prod_sku}) at location '{loc_name}'. Available: {available}, Requested: {line.quantity_requested}."
                )

        # Process deduction and ledger
        for line in delivery.lines:
            qty = line.quantity_requested
            stock = db.query(StockLevel).filter(
                StockLevel.organization_id == delivery.organization_id,
                StockLevel.product_id == line.product_id,
                StockLevel.location_id == delivery.source_location_id
            ).with_for_update().first()

            prev_qty = stock.on_hand
            new_qty = prev_qty - qty
            stock.on_hand = new_qty
            stock.available = new_qty - stock.reserved
            line.quantity_delivered = qty

            movement = StockMovement(
                organization_id=delivery.organization_id,
                product_id=line.product_id,
                warehouse_id=delivery.source_warehouse_id,
                location_id=delivery.source_location_id,
                movement_type=MovementType.DELIVERY.value,
                quantity=-qty,
                previous_quantity=prev_qty,
                resulting_quantity=new_qty,
                reference_type="delivery",
                reference_id=delivery.delivery_number,
                reason=f"Delivered on {delivery.delivery_number}" + (f" ({delivery.customer_reference})" if delivery.customer_reference else ""),
                actor_id=actor.id
            )
            db.add(movement)

        delivery.status = OperationStatus.DONE.value
        delivery.validated_at = utc_now()
        db.commit()
        db.refresh(delivery)
        return delivery

    @classmethod
    def validate_transfer(
        cls,
        db: Session,
        transfer: Transfer,
        actor: User
    ) -> Transfer:
        if transfer.status == OperationStatus.DONE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transfer {transfer.transfer_number} has already been executed."
            )
        if transfer.status == OperationStatus.CANCELLED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot execute cancelled transfer {transfer.transfer_number}."
            )

        if transfer.source_location_id == transfer.destination_location_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Source and destination location must be distinct for an internal transfer."
            )

        if not transfer.lines:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transfer must contain at least one line item."
            )

        # Pre-check source stock for all items
        for line in transfer.lines:
            product = db.query(Product).filter(Product.id == line.product_id).first()
            prod_name = product.name if product else f"ID {line.product_id}"

            stock_src = db.query(StockLevel).filter(
                StockLevel.organization_id == transfer.organization_id,
                StockLevel.product_id == line.product_id,
                StockLevel.location_id == transfer.source_location_id
            ).with_for_update().first()

            available = stock_src.available if stock_src else 0.0
            if available < line.quantity:
                loc = db.query(Location).filter(Location.id == transfer.source_location_id).first()
                loc_name = loc.name if loc else str(transfer.source_location_id)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot transfer '{prod_name}': Insufficient available quantity at source '{loc_name}'. Available: {available}, Required: {line.quantity}."
                )

        # Atomically execute transfer: decrement source, increment destination, write paired movements
        shared_link_id = f"TRF-{transfer.transfer_number}"
        for line in transfer.lines:
            qty = line.quantity

            # 1. Source decrement
            stock_src = db.query(StockLevel).filter(
                StockLevel.organization_id == transfer.organization_id,
                StockLevel.product_id == line.product_id,
                StockLevel.location_id == transfer.source_location_id
            ).with_for_update().first()

            src_prev = stock_src.on_hand
            src_new = src_prev - qty
            stock_src.on_hand = src_new
            stock_src.available = src_new - stock_src.reserved

            move_out = StockMovement(
                organization_id=transfer.organization_id,
                product_id=line.product_id,
                warehouse_id=transfer.source_warehouse_id,
                location_id=transfer.source_location_id,
                movement_type=MovementType.TRANSFER_OUT.value,
                quantity=-qty,
                previous_quantity=src_prev,
                resulting_quantity=src_new,
                reference_type="transfer",
                reference_id=transfer.transfer_number,
                transfer_link_id=shared_link_id,
                reason=f"Transfer to Location #{transfer.destination_location_id}",
                actor_id=actor.id
            )
            db.add(move_out)

            # 2. Destination increment
            stock_dst = cls.get_or_create_stock_level(
                db=db,
                organization_id=transfer.organization_id,
                product_id=line.product_id,
                warehouse_id=transfer.destination_warehouse_id,
                location_id=transfer.destination_location_id
            )

            dst_prev = stock_dst.on_hand
            dst_new = dst_prev + qty
            stock_dst.on_hand = dst_new
            stock_dst.available = dst_new - stock_dst.reserved

            move_in = StockMovement(
                organization_id=transfer.organization_id,
                product_id=line.product_id,
                warehouse_id=transfer.destination_warehouse_id,
                location_id=transfer.destination_location_id,
                movement_type=MovementType.TRANSFER_IN.value,
                quantity=qty,
                previous_quantity=dst_prev,
                resulting_quantity=dst_new,
                reference_type="transfer",
                reference_id=transfer.transfer_number,
                transfer_link_id=shared_link_id,
                reason=f"Transfer from Location #{transfer.source_location_id}",
                actor_id=actor.id
            )
            db.add(move_in)

        transfer.status = OperationStatus.DONE.value
        transfer.validated_at = utc_now()
        db.commit()
        db.refresh(transfer)
        return transfer

    @classmethod
    def execute_adjustment(
        cls,
        db: Session,
        organization_id: int,
        warehouse_id: int,
        location_id: int,
        product_id: int,
        physical_count: float,
        reason: str,
        notes: Optional[str],
        actor: User
    ) -> Adjustment:
        stock = cls.get_or_create_stock_level(
            db=db,
            organization_id=organization_id,
            product_id=product_id,
            warehouse_id=warehouse_id,
            location_id=location_id
        )

        system_qty = stock.on_hand
        delta = physical_count - system_qty

        adj_number = f"ADJ-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:4].upper()}"

        adjustment = Adjustment(
            organization_id=organization_id,
            adjustment_number=adj_number,
            warehouse_id=warehouse_id,
            location_id=location_id,
            product_id=product_id,
            system_quantity=system_qty,
            physical_count=physical_count,
            delta_quantity=delta,
            reason=reason,
            notes=notes,
            created_by_id=actor.id
        )
        db.add(adjustment)

        # Update balance
        stock.on_hand = physical_count
        stock.available = max(0.0, physical_count - stock.reserved)

        # Record movement
        movement = StockMovement(
            organization_id=organization_id,
            product_id=product_id,
            warehouse_id=warehouse_id,
            location_id=location_id,
            movement_type=MovementType.ADJUSTMENT.value,
            quantity=delta,
            previous_quantity=system_qty,
            resulting_quantity=physical_count,
            reference_type="adjustment",
            reference_id=adj_number,
            reason=f"Adjustment: {reason}" + (f" - {notes}" if notes else ""),
            actor_id=actor.id
        )
        db.add(movement)

        db.commit()
        db.refresh(adjustment)
        return adjustment
