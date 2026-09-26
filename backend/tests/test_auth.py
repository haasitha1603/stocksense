def test_login_success(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@stocksense.io",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@stocksense.io"
    assert data["user"]["role"] == "admin"

def test_login_invalid_password(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@stocksense.io",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

def test_me_endpoint(client, admin_headers):
    res = client.get("/api/v1/auth/me", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@stocksense.io"
    assert data["role"] == "admin"

def test_unauthorized_access(client):
    res = client.get("/api/v1/products")
    assert res.status_code == 401
