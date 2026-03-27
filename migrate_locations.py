import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

conn = psycopg2.connect(
    dbname='charity_db',
    user='postgres',
    password='123456789',
    host='localhost',
    port='5433'
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()
try:
    cursor.execute('ALTER TABLE donations ADD COLUMN location_id INTEGER REFERENCES locations(id)')
    print("Migration successful: added location_id.")
except Exception as e:
    print("Log:", e)
finally:
    cursor.close()
    conn.close()
