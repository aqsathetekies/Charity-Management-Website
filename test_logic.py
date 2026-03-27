from database.connection import SessionLocal
from models.models import Location, Donation

def test_db():
    print("Starting DB Logic Test...")
    db = SessionLocal()
    
    try:
        # Check if we can create a location
        loc = Location(name="Test Location DB")
        db.add(loc)
        db.commit()
        db.refresh(loc)
        print("Created Location:", loc.id, loc.name)
        
        # Create a donation with location
        don = Donation(amount=100.0, donor_name="Test Donor", location_id=loc.id)
        db.add(don)
        db.commit()
        db.refresh(don)
        print("Created Donation:", don.id, "with location_id:", don.location_id)
        
        # Retrieve with relationship
        fetched_don = db.query(Donation).filter(Donation.id == don.id).first()
        print("Fetched Donation Location Name:", getattr(fetched_don.location, 'name', None))
        
        # Cleanup
        db.delete(don)
        db.delete(loc)
        db.commit()
        print("Cleanup done. DB Logic works properly.")
    except Exception as e:
        print("Test failed:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
