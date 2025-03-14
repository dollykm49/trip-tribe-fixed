from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_savings_goal():
    response = client.post("/api/savings/create-goal", json={
        "name": "Emergency Fund",
        "targetAmount": 5000,
        "deadline": "2023-12-31",
        "isGroup": False,
        "autoSave": True,
        "frequency": "monthly"
    })
    assert response.status_code == 200
    assert "goal_id" in response.json()

def test_set_budget_category():
    response = client.post("/api/budget/set-category", json={
        "name": "Groceries",
        "budget": 300
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Budget category set successfully"

def test_get_budget_analysis():
    response = client.get("/api/budget/analysis")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_savings_recommendations():
    response = client.get("/api/savings/recommendations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)