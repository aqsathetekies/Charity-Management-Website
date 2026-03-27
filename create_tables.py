from database.connection import engine, Base
from models.models import *

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
