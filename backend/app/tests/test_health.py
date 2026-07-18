from fastapi import status
from fastapi.testclient import TestClient

def test_health_check_endpoint(client: TestClient):
    """
    Test verifying that the health diagnostics route returns active response parameters.
    Checks endpoint connectivity and response dictionary structure.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    
    json_data = response.json()
    assert "status" in json_data
    assert "database" in json_data
    assert "api_status" in json_data
    
    # Under test sqlite mock setups, connection should register successfully
    assert json_data["status"] == "healthy"
    assert json_data["database"] == "connected"
    assert json_data["api_status"] == "online"
