from sqlalchemy import func
from app.models import Product, Warehouse, Location, StockLevel, StockMovement

def test_transfer_company_total_invariant(client, manager_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-STL-001").first()
    wh_mwh = db_session.query(Warehouse).filter(Warehouse.code == "MWH").first()
    loc_mwh = db_session.query(Location).filter(Location.code == "MWH-BAY-A").first()
    wh_whb = db_session.query(Warehouse).filter(Warehouse.code == "WHB").first()
    loc_whb = db_session.query(Location).filter(Location.code == "WHB-SR-1").first()

    # Pre-transfer totals
    tot_before = db_session.query(func.sum(StockLevel.on_hand)).filter(
        StockLevel.product_id == prod.id
    ).scalar()

    src_stock_before = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc_whb.id
    ).first().on_hand

    dst_stock_before = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc_mwh.id
    ).first().on_hand

    transfer_qty = 20.0

    # Create transfer
    trf_res = client.post("/api/v1/transfers", headers=manager_headers, json={
        "source_warehouse_id": wh_whb.id,
        "source_location_id": loc_whb.id,
        "destination_warehouse_id": wh_mwh.id,
        "destination_location_id": loc_mwh.id,
        "notes": "Rebalancing stock",
        "lines": [{"product_id": prod.id, "quantity": transfer_qty}]
    })
    assert trf_res.status_code == 201
    trf_id = trf_res.json()["id"]
    trf_num = trf_res.json()["transfer_number"]

    # Validate execution
    val_res = client.post(f"/api/v1/transfers/{trf_id}/validate", headers=manager_headers)
    assert val_res.status_code == 200
    assert val_res.json()["status"] == "Done"

    # Post-transfer checks
    db_session.expire_all()
    tot_after = db_session.query(func.sum(StockLevel.on_hand)).filter(
        StockLevel.product_id == prod.id
    ).scalar()

    # CRITICAL INVARIANT: Total company stock MUST be unchanged!
    assert tot_after == tot_before

    src_stock_after = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc_whb.id
    ).first().on_hand

    dst_stock_after = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc_mwh.id
    ).first().on_hand

    assert src_stock_after == src_stock_before - transfer_qty
    assert dst_stock_after == dst_stock_before + transfer_qty

    # Check paired ledger movements
    out_move = db_session.query(StockMovement).filter(
        StockMovement.reference_id == trf_num,
        StockMovement.movement_type == "TRANSFER_OUT"
    ).first()
    in_move = db_session.query(StockMovement).filter(
        StockMovement.reference_id == trf_num,
        StockMovement.movement_type == "TRANSFER_IN"
    ).first()

    assert out_move is not None
    assert in_move is not None
    assert out_move.quantity == -transfer_qty
    assert in_move.quantity == transfer_qty
    assert out_move.transfer_link_id == in_move.transfer_link_id
