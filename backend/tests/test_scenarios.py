from app.models import Product, StockMovement, StockLevel

def test_scenario_simulation_zero_mutation_guarantee(client, admin_headers, db_session):
    prod = db_session.query(Product).filter(Product.sku == "SKU-STL-001").first()

    # Capture initial ledger count and stock
    moves_count_before = db_session.query(StockMovement).count()

    sim_res = client.post("/api/v1/scenarios/simulate", headers=admin_headers, json={
        "product_id": prod.id,
        "horizon_days": 30,
        "demand_change_pct": 25.0,
        "lead_time_delay_days": 5,
        "proposed_transfer_units": 40.0
    })
    assert sim_res.status_code == 200
    data = sim_res.json()

    # Zero mutation guarantee verification
    assert data["is_mutation_performed"] is False
    assert len(data["projected_stock_by_day"]) == 30
    assert "Demand shift" in data["assumptions_applied"][0]

    # Verify no new movements in ledger
    moves_count_after = db_session.query(StockMovement).count()
    assert moves_count_after == moves_count_before

def test_copilot_grounded_response(client, admin_headers):
    res = client.post("/api/v1/copilot/query", headers=admin_headers, json={
        "query": "Which products are at critical stockout risk right now?"
    })
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["grounded_evidence"]["top_stockout_risks"]) > 0
    assert len(data["suggested_actions"]) > 0
