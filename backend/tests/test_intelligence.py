from app.models import Product

def test_demand_estimation_hero_product(client, admin_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-STL-001").first()
    res = client.get(f"/api/v1/intelligence/demand/{prod.id}", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["has_sufficient_data"] is True
    assert data["daily_demand_rate"] >= 10.0
    assert data["forecast_7d"] > 0
    assert "Derived from" in data["explanation"]

def test_demand_insufficient_history(client, admin_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-BRK-999").first()
    res = client.get(f"/api/v1/intelligence/demand/{prod.id}", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["has_sufficient_data"] is False
    assert "Insufficient historical outbound data" in data["explanation"]

def test_stockout_risks_ranking(client, admin_headers):
    res = client.get("/api/v1/intelligence/stockout-risks", headers=admin_headers)
    assert res.status_code == 200
    risks = res.json()
    assert len(risks) > 0
    # Top risks should be Critical/Warning
    assert risks[0]["risk_level"] in ["critical", "warning"]
    assert risks[0]["impact_priority"] in ["High", "Medium"]

def test_reorder_recommendation_formula(client, admin_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-STL-001").first()
    res = client.get(f"/api/v1/intelligence/reorder/{prod.id}", headers=admin_headers)
    assert res.status_code == 200
    rec = res.json()
    assert rec["recommended_order_quantity"] >= 0
    assert "suggested_order = max(0" in rec["formula_used"]
    assert len(rec["assumptions"]) >= 4

def test_transfer_recommendations(client, admin_headers):
    res = client.get("/api/v1/intelligence/transfers", headers=admin_headers)
    assert res.status_code == 200
    transfers = res.json()
    assert len(transfers) >= 1
    t = transfers[0]
    assert t["source_warehouse_name"] == "Warehouse B"
    assert t["destination_warehouse_name"] == "Main Warehouse"
    assert t["recommended_transfer_quantity"] > 0
