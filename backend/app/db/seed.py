from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models import (
    Organization, User, Category, Supplier, Warehouse, Location,
    Product, StockLevel, StockMovement, Receipt, ReceiptLine,
    Delivery, DeliveryLine, Transfer, TransferLine, Alert,
    MovementType, OperationStatus, BusinessCriticality
)

def utc_now():
    return datetime.now(timezone.utc)

def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_org = db.query(Organization).filter(Organization.code == "stocksense-corp").first()
        if existing_org:
            print("Database already seeded with demo organization.")
            return

        print("Seeding StockSense demo data...")

        # 1. Organization & Users
        org = Organization(name="StockSense Logistics Corp", code="stocksense-corp")
        db.add(org)
        db.flush()

        admin_user = User(
            organization_id=org.id,
            email="admin@stocksense.io",
            hashed_password=hash_password("password123"),
            full_name="Elena Rostova",
            role="admin",
            is_active=True
        )
        manager_user = User(
            organization_id=org.id,
            email="manager@stocksense.io",
            hashed_password=hash_password("password123"),
            full_name="Marcus Vance",
            role="manager",
            is_active=True
        )
        db.add_all([admin_user, manager_user])
        db.flush()

        # 2. Warehouses & Locations
        wh_main = Warehouse(
            organization_id=org.id,
            name="Main Warehouse",
            code="MWH",
            address="100 Logistics Blvd, Detroit, MI",
            is_active=True
        )
        wh_b = Warehouse(
            organization_id=org.id,
            name="Warehouse B",
            code="WHB",
            address="450 Industrial Parkway, Cleveland, OH",
            is_active=True
        )
        db.add_all([wh_main, wh_b])
        db.flush()

        loc_mwh_rec = Location(organization_id=org.id, warehouse_id=wh_main.id, name="Receiving Dock", code="MWH-REC", location_type="Receiving", is_active=True)
        loc_mwh_bay_a = Location(organization_id=org.id, warehouse_id=wh_main.id, name="Bay A", code="MWH-BAY-A", location_type="Storage", is_active=True)
        loc_mwh_prod = Location(organization_id=org.id, warehouse_id=wh_main.id, name="Production Rack", code="MWH-PROD", location_type="Production", is_active=True)

        loc_whb_sr1 = Location(organization_id=org.id, warehouse_id=wh_b.id, name="Storage Rack 1", code="WHB-SR-1", location_type="Storage", is_active=True)
        loc_whb_bulk = Location(organization_id=org.id, warehouse_id=wh_b.id, name="Bulk Bay", code="WHB-BULK", location_type="Storage", is_active=True)

        db.add_all([loc_mwh_rec, loc_mwh_bay_a, loc_mwh_prod, loc_whb_sr1, loc_whb_bulk])
        db.flush()

        # 3. Categories & Suppliers
        cat_metals = Category(organization_id=org.id, name="Raw Materials & Metals", description="Structural metals, bars, sheets")
        cat_fasteners = Category(organization_id=org.id, name="Fasteners & Hardware", description="Bolts, nuts, screws, washers")
        cat_tools = Category(organization_id=org.id, name="Industrial Tools", description="Drill bits, cutters, hand tools")
        cat_electronics = Category(organization_id=org.id, name="Electrical & Sensors", description="Relays, wire, controllers")
        cat_packaging = Category(organization_id=org.id, name="Packaging & Safety", description="Boxes, shrink wrap, PPE")
        db.add_all([cat_metals, cat_fasteners, cat_tools, cat_electronics, cat_packaging])
        db.flush()

        supp_steel = Supplier(organization_id=org.id, name="Global Steel & Alloys Corp", contact_email="orders@globalsteel.com", phone="+1-800-555-0191", lead_time_days=10)
        supp_hardware = Supplier(organization_id=org.id, name="Apex Hardware & Fasteners", contact_email="sales@apexhardware.com", phone="+1-800-555-0192", lead_time_days=7)
        supp_elect = Supplier(organization_id=org.id, name="OmniTech Electrical Components", contact_email="support@omnitechelec.com", phone="+1-800-555-0193", lead_time_days=14)
        db.add_all([supp_steel, supp_hardware, supp_elect])
        db.flush()

        # 4. Products & Catalog
        # Product 1: Steel Rods (Demo Hero Product)
        p_steel_rods = Product(
            organization_id=org.id,
            category_id=cat_metals.id,
            supplier_id=supp_steel.id,
            name="Steel Rods (10mm x 2m)",
            sku="SKU-STL-001",
            description="High-tensile hardened structural carbon steel rods",
            unit_of_measure="Units",
            reorder_level=50.0,
            reorder_quantity=120.0,
            unit_cost=18.50,
            lead_time_days=10,
            business_criticality=BusinessCriticality.CRITICAL.value,
            status="Active"
        )

        p_aluminum = Product(
            organization_id=org.id,
            category_id=cat_metals.id,
            supplier_id=supp_steel.id,
            name="Aluminum Alloy Sheet (4x8ft)",
            sku="SKU-ALU-002",
            description="6061-T6 lightweight structural aluminum plates",
            unit_of_measure="Sheets",
            reorder_level=20.0,
            reorder_quantity=40.0,
            unit_cost=85.00,
            lead_time_days=8,
            business_criticality=BusinessCriticality.STANDARD.value,
            status="Active"
        )

        p_hex_bolts = Product(
            organization_id=org.id,
            category_id=cat_fasteners.id,
            supplier_id=supp_hardware.id,
            name="Grade 8 Hex Bolts (M8 x 50mm)",
            sku="SKU-BLT-003",
            description="Zinc-plated heavy industrial hex head cap screws",
            unit_of_measure="Boxes (100ct)",
            reorder_level=15.0,
            reorder_quantity=50.0,
            unit_cost=24.00,
            lead_time_days=5,
            business_criticality=BusinessCriticality.STANDARD.value,
            status="Active"
        )

        p_copper_wire = Product(
            organization_id=org.id,
            category_id=cat_electronics.id,
            supplier_id=supp_elect.id,
            name="Industrial Copper Wiring Spool (500ft)",
            sku="SKU-WIR-004",
            description="12 AWG THHN solid copper commercial electrical wire",
            unit_of_measure="Spools",
            reorder_level=10.0,
            reorder_quantity=25.0,
            unit_cost=115.00,
            lead_time_days=14,
            business_criticality=BusinessCriticality.CRITICAL.value,
            status="Active"
        )

        p_bearings = Product(
            organization_id=org.id,
            category_id=cat_tools.id,
            supplier_id=supp_hardware.id,
            name="Precision Sealed Ball Bearings (6204-2RS)",
            sku="SKU-BRG-005",
            description="Chrome steel high-speed electric motor bearings",
            unit_of_measure="Units",
            reorder_level=30.0,
            reorder_quantity=80.0,
            unit_cost=12.25,
            lead_time_days=6,
            business_criticality=BusinessCriticality.STANDARD.value,
            status="Active"
        )

        p_brackets_dead = Product(
            organization_id=org.id,
            category_id=cat_metals.id,
            supplier_id=supp_steel.id,
            name="Obsolete Gusset Brackets (Rev A)",
            sku="SKU-BRK-999",
            description="Discontinued mounting brackets with zero demand over 60 days",
            unit_of_measure="Units",
            reorder_level=10.0,
            reorder_quantity=20.0,
            unit_cost=32.00,
            lead_time_days=12,
            business_criticality=BusinessCriticality.LOW.value,
            status="Active"
        )

        p_goggles = Product(
            organization_id=org.id,
            category_id=cat_packaging.id,
            supplier_id=supp_hardware.id,
            name="ANSI Z87.1 Safety Eyewear",
            sku="SKU-PPE-007",
            description="Anti-fog scratch-resistant impact protective glasses",
            unit_of_measure="Pairs",
            reorder_level=25.0,
            reorder_quantity=100.0,
            unit_cost=6.50,
            lead_time_days=4,
            business_criticality=BusinessCriticality.LOW.value,
            status="Active"
        )

        p_pallet_wrap = Product(
            organization_id=org.id,
            category_id=cat_packaging.id,
            supplier_id=supp_hardware.id,
            name="Heavy Duty Stretch Film (18in x 1500ft)",
            sku="SKU-PKG-008",
            description="80 gauge puncture-resistant cast hand stretch pallet wrap",
            unit_of_measure="Rolls",
            reorder_level=15.0,
            reorder_quantity=48.0,
            unit_cost=19.75,
            lead_time_days=3,
            business_criticality=BusinessCriticality.LOW.value,
            status="Active"
        )

        p_carbide_drills = Product(
            organization_id=org.id,
            category_id=cat_tools.id,
            supplier_id=supp_hardware.id,
            name="Solid Carbide End Mills (1/2in 4-Flute)",
            sku="SKU-MIL-009",
            description="AlTiN coated CNC high-performance milling bits",
            unit_of_measure="Units",
            reorder_level=8.0,
            reorder_quantity=20.0,
            unit_cost=48.00,
            lead_time_days=7,
            business_criticality=BusinessCriticality.STANDARD.value,
            status="Active"
        )

        db.add_all([
            p_steel_rods, p_aluminum, p_hex_bolts, p_copper_wire,
            p_bearings, p_brackets_dead, p_goggles, p_pallet_wrap, p_carbide_drills
        ])
        db.flush()

        # 5. Stock Levels
        # Steel Rods:
        # Main Warehouse (Bay A): 85 units
        # Warehouse B (Storage Rack 1): 160 units
        stock_steel_mwh = StockLevel(organization_id=org.id, product_id=p_steel_rods.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=85.0, reserved=0.0, available=85.0)
        stock_steel_whb = StockLevel(organization_id=org.id, product_id=p_steel_rods.id, warehouse_id=wh_b.id, location_id=loc_whb_sr1.id, on_hand=160.0, reserved=0.0, available=160.0)

        # Aluminum: Main Warehouse 65 units
        stock_alu_mwh = StockLevel(organization_id=org.id, product_id=p_aluminum.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=65.0, reserved=0.0, available=65.0)
        
        # Hex Bolts: Main Warehouse 12 boxes (Low stock!)
        stock_blt_mwh = StockLevel(organization_id=org.id, product_id=p_hex_bolts.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=12.0, reserved=0.0, available=12.0)
        
        # Copper Wire: Main Warehouse 6 spools (Critical shortage vs 14d lead time)
        stock_wir_mwh = StockLevel(organization_id=org.id, product_id=p_copper_wire.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=6.0, reserved=0.0, available=6.0)

        # Bearings: Main Warehouse 95 units
        stock_brg_mwh = StockLevel(organization_id=org.id, product_id=p_bearings.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=95.0, reserved=0.0, available=95.0)

        # Dead Stock Brackets: Warehouse B 120 units ($3,840 capital tied up!)
        stock_brk_whb = StockLevel(organization_id=org.id, product_id=p_brackets_dead.id, warehouse_id=wh_b.id, location_id=loc_whb_bulk.id, on_hand=120.0, reserved=0.0, available=120.0)

        # Safety Goggles: Main Warehouse 140 pairs
        stock_ppe_mwh = StockLevel(organization_id=org.id, product_id=p_goggles.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=140.0, reserved=0.0, available=140.0)

        # Pallet Wrap: Main Warehouse 50 rolls
        stock_pkg_mwh = StockLevel(organization_id=org.id, product_id=p_pallet_wrap.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=50.0, reserved=0.0, available=50.0)

        # Carbide Drills: Main Warehouse 22 units
        stock_mil_mwh = StockLevel(organization_id=org.id, product_id=p_carbide_drills.id, warehouse_id=wh_main.id, location_id=loc_mwh_bay_a.id, on_hand=22.0, reserved=0.0, available=22.0)

        db.add_all([
            stock_steel_mwh, stock_steel_whb, stock_alu_mwh, stock_blt_mwh,
            stock_wir_mwh, stock_brg_mwh, stock_brk_whb, stock_ppe_mwh,
            stock_pkg_mwh, stock_mil_mwh
        ])
        db.flush()

        # 6. Historical Outbound Deliveries to establish REAL demand rate
        # For Steel Rods: 30 days lookback with ~420 units delivered (~14 units/day)
        # Create 6 distinct delivery events spread over last 28 days
        base_time = utc_now()
        delivery_history = [
            (25, 70.0, "SO-1001", "Apex Manufacturing"),
            (20, 85.0, "SO-1002", "Titan Structural Works"),
            (15, 65.0, "SO-1003", "Precision Frame Corp"),
            (10, 75.0, "SO-1004", "Great Lakes Fabricators"),
            (5, 60.0, "SO-1005", "Vanguard Assembly"),
            (2, 65.0, "SO-1006", "Midwest Metalworks")
        ]

        for days_ago, qty, so_num, customer in delivery_history:
            event_time = base_time - timedelta(days=days_ago)
            deliv = Delivery(
                organization_id=org.id,
                delivery_number=f"DEL-{so_num}",
                customer_reference=f"{customer} ({so_num})",
                source_warehouse_id=wh_main.id,
                source_location_id=loc_mwh_bay_a.id,
                status=OperationStatus.DONE.value,
                notes=f"Completed shipment for {customer}",
                created_by_id=manager_user.id,
                created_at=event_time,
                validated_at=event_time
            )
            db.add(deliv)
            db.flush()

            deliv_line = DeliveryLine(
                delivery_id=deliv.id,
                product_id=p_steel_rods.id,
                quantity_requested=qty,
                quantity_delivered=qty
            )
            db.add(deliv_line)

            # Record in ledger
            move = StockMovement(
                organization_id=org.id,
                product_id=p_steel_rods.id,
                warehouse_id=wh_main.id,
                location_id=loc_mwh_bay_a.id,
                movement_type=MovementType.DELIVERY.value,
                quantity=-qty,
                previous_quantity=85.0 + qty, # illustrative
                resulting_quantity=85.0,
                reference_type="delivery",
                reference_id=deliv.delivery_number,
                reason=f"Customer Dispatch to {customer}",
                actor_id=manager_user.id,
                created_at=event_time
            )
            db.add(move)

        # Deliveries for Copper Wire: ~1.2 spools/day demand over 30 days
        for days_ago, qty, so_num, customer in [(22, 10.0, "SO-201", "Metro Grid Systems"), (12, 12.0, "SO-202", "ElectroTech Industrial"), (4, 14.0, "SO-203", "Commercial Wiring Ltd")]:
            event_time = base_time - timedelta(days=days_ago)
            deliv = Delivery(
                organization_id=org.id,
                delivery_number=f"DEL-{so_num}",
                customer_reference=customer,
                source_warehouse_id=wh_main.id,
                source_location_id=loc_mwh_bay_a.id,
                status=OperationStatus.DONE.value,
                notes="Delivered electrical cabling",
                created_by_id=manager_user.id,
                created_at=event_time,
                validated_at=event_time
            )
            db.add(deliv)
            db.flush()

            move = StockMovement(
                organization_id=org.id,
                product_id=p_copper_wire.id,
                warehouse_id=wh_main.id,
                location_id=loc_mwh_bay_a.id,
                movement_type=MovementType.DELIVERY.value,
                quantity=-qty,
                previous_quantity=6.0 + qty,
                resulting_quantity=6.0,
                reference_type="delivery",
                reference_id=deliv.delivery_number,
                reason=f"Dispatched to {customer}",
                actor_id=manager_user.id,
                created_at=event_time
            )
            db.add(move)

        # Baseline receipt records in ledger for initial balances
        for prod, stock_rec, wh, loc in [
            (p_steel_rods, stock_steel_mwh, wh_main, loc_mwh_bay_a),
            (p_steel_rods, stock_steel_whb, wh_b, loc_whb_sr1),
            (p_aluminum, stock_alu_mwh, wh_main, loc_mwh_bay_a),
            (p_hex_bolts, stock_blt_mwh, wh_main, loc_mwh_bay_a),
            (p_copper_wire, stock_wir_mwh, wh_main, loc_mwh_bay_a),
            (p_bearings, stock_brg_mwh, wh_main, loc_mwh_bay_a),
            (p_brackets_dead, stock_brk_whb, wh_b, loc_whb_bulk),
            (p_goggles, stock_ppe_mwh, wh_main, loc_mwh_bay_a),
            (p_pallet_wrap, stock_pkg_mwh, wh_main, loc_mwh_bay_a),
            (p_carbide_drills, stock_mil_mwh, wh_main, loc_mwh_bay_a),
        ]:
            move = StockMovement(
                organization_id=org.id,
                product_id=prod.id,
                warehouse_id=wh.id,
                location_id=loc.id,
                movement_type=MovementType.RECEIPT.value,
                quantity=stock_rec.on_hand,
                previous_quantity=0.0,
                resulting_quantity=stock_rec.on_hand,
                reference_type="initial_seed",
                reference_id=f"SEED-{prod.sku}",
                reason="Initial baseline warehouse inventory intake",
                actor_id=admin_user.id,
                created_at=base_time - timedelta(days=35)
            )
            db.add(move)

        # 7. Seed Pending Receipts and Deliveries
        pending_rec = Receipt(
            organization_id=org.id,
            receipt_number="REC-2026-PO902",
            supplier_id=supp_steel.id,
            destination_warehouse_id=wh_main.id,
            destination_location_id=loc_mwh_rec.id,
            status=OperationStatus.READY.value,
            notes="PO-902 Scheduled Dock Delivery - Aluminum Alloy Sheets",
            created_by_id=manager_user.id
        )
        db.add(pending_rec)
        db.flush()

        pending_rec_line = ReceiptLine(
            receipt_id=pending_rec.id,
            product_id=p_aluminum.id,
            quantity_expected=30.0,
            quantity_received=0.0
        )
        db.add(pending_rec_line)

        # 8. Operational Alerts
        alert_steel = Alert(
            organization_id=org.id,
            product_id=p_steel_rods.id,
            warehouse_id=wh_main.id,
            alert_type="critical_stockout",
            severity="critical",
            title="Imminent Stockout Risk: Steel Rods (10mm)",
            message="Available stock (85 units) represents ~6 days of cover against 14 units/day demand, falling below the 10-day supplier lead time.",
            evidence_json='{"days_cover": 6.0, "lead_time_days": 10, "daily_demand": 14.0, "criticality": "Critical"}',
            is_acknowledged=False
        )
        alert_wire = Alert(
            organization_id=org.id,
            product_id=p_copper_wire.id,
            warehouse_id=wh_main.id,
            alert_type="critical_stockout",
            severity="critical",
            title="Critical Shortage: Industrial Copper Wiring Spool",
            message="Only 6 spools remain in Main Warehouse with supplier lead time of 14 days. Production disruption risk is high.",
            evidence_json='{"days_cover": 5.0, "lead_time_days": 14, "criticality": "Critical"}',
            is_acknowledged=False
        )
        alert_dead = Alert(
            organization_id=org.id,
            product_id=p_brackets_dead.id,
            warehouse_id=wh_b.id,
            alert_type="slow_stock",
            severity="warning",
            title="Dead Stock Capital Alert: Obsolete Gusset Brackets",
            message="120 units have been inactive with 0 outbound demand over 60 days, tying up $3,840.00 in working capital.",
            evidence_json='{"days_inactive": 60, "tied_up_capital": 3840.0, "unit_cost": 32.0}',
            is_acknowledged=False
        )
        db.add_all([alert_steel, alert_wire, alert_dead])

        db.commit()
        print("StockSense demo dataset successfully seeded!")
        print("Demo Credentials: admin@stocksense.io / password123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
