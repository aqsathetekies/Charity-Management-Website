from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def run_tests():
    print("Starting tests...")
    
    # Register purely for test
    username = f"admin_{uuid.uuid4().hex[:6]}"
    res = client.post("/register", json={"username": username, "password": "password"})
    print("Register:", res.status_code)

    # Login
    res = client.post("/login", data={"username": username, "password": "password"})
    print("Login:", res.status_code)
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add Location
    loc_name = f"Location {uuid.uuid4().hex[:4]}"
    res = client.post("/admin/locations", json={"name": loc_name}, headers=headers)
    print("Create location:", res.status_code, res.json())
    loc_id = res.json()["id"]

    # Get Locations
    res = client.get("/locations")
    print("Get locations:", res.status_code, sum(1 for l in res.json()), "locations total")
    assert any(l['id'] == loc_id for l in res.json())

    # Add Donation with location
    res = client.post("/donate", data={"amount": 200, "donor_name": "Test Loc", "location_id": loc_id})
    print("Create donation:", res.status_code, res.json())
    assert res.json()["location_id"] == loc_id
    
    # Clean up might be good but let's just make sure it prints
    print("All tests passed dynamically.")

if __name__ == "__main__":
    run_tests()
