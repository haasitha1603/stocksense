from app.models import Product, Warehouse, Location, StockLevel, StockMovement

def test_products_list(client, admin_headers):
    res = client.get("/api/v1/products", headers=admin_headers)
    assert res.status_code == 200
    products = res.json()
    assert len(products) >= 8
    skus = [p["sku"] for p in products]
    assert "SKU-STL-001" in skus

def test_receipt_flow(client, manager_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-PPE-007").first()
    wh = db_session.query(Warehouse).filter(Warehouse.code == "MWH").first()
    loc = db_session.query(Location).filter(Location.code == "MWH-BAY-A").first()

    # Initial stock
    stock_before = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc.id
    ).first()
    qty_before = stock_before.on_hand if stock_before else 0.0

    # Create receipt
    rec_res = client.post("/api/v1/receipts", headers=manager_headers, json={
        "destination_warehouse_id": wh.id,
        "destination_location_id": loc.id,
        "notes": "Test receipt",
        "lines": [{"product_id": prod.id, "quantity_expected": 25.0}]
    })
    assert rec_res.status_code == 201
    receipt_data = rec_res.json()
    receipt_id = receipt_data["id"]

    # Validate receipt
    val_res = client.post(f"/api/v1/receipts/{receipt_id}/validate", headers=manager_headers)
    assert val_res.status_code == 200
    assert val_res.json()["status"] == "Done"

    # Verify stock increment
    db_session.expire_all()
    stock_after = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc.id
    ).first()
    assert stock_after.on_hand == qty_before + 25.0

    # Verify ledger movement exists
    movement = db_session.query(StockMovement).filter(
        StockMovement.reference_id == receipt_data["receipt_number"],
        StockMovement.movement_type == "RECEIPT"
    ).first()
    assert movement is not None
    assert movement.quantity == 25.0

def test_delivery_insufficient_stock_fails_atomically(client, manager_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-WIR-004").first()
    wh = db_session.query(Warehouse).filter(Warehouse.code == "MWH").first()
    loc = db_session.query(Location).filter(Location.code == "MWH-BAY-A").first()

    # Create delivery requesting 500 units (way more than 6 available)
    deliv_res = client.post("/api/v1/deliveries", headers=manager_headers, json={
        "source_warehouse_id": wh.id,
        "source_location_id": loc.id,
        "customer_reference": "Impossible Order",
        "lines": [{"product_id": prod.id, "quantity_requested": 500.0}]
    })
    assert deliv_res.status_code == 201
    deliv_id = deliv_res.json()["id"]

    # Validation must fail with 400 Bad Request
    val_res = client.post(f"/api/v1/deliveries/{deliv_id}/validate", headers=manager_headers)
    assert val_res.status_code == 400
    assert "Insufficient stock" in val_res.json()["detail"]

    # Stock must remain unchanged
    db_session.expire_all()
    stock = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc.id
    ).first()
    assert stock.on_hand == 6.0

def test_adjustment_flow(client, manager_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-MIL-009").first()
    wh = db_session.query(Warehouse).filter(Warehouse.code == "MWH").first()
    loc = db_session.query(Location).filter(Location.code == "MWH-BAY-A").first()

    adj_res = client.post("/api/v1/adjustments", headers=manager_headers, json={
        "warehouse_id": wh.id,
        "location_id": loc.id,
        "product_id": prod.id,
        "physical_count": 25.0,
        "reason": "count_error",
        "notes": "Annual physical audit recount"
    })
    assert adj_res.status_code == 201
    adj_data = adj_res.json()
    assert adj_data["physical_count"] == 25.0

    # Stock balance updated
    db_session.expire_all()
    stock = db_session.query(StockLevel).filter(
        StockLevel.product_id == prod.id,
        StockLevel.location_id == loc.id
    ).first()
    assert stock.on_hand == 25.0
