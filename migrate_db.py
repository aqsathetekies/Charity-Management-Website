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
    cursor.execute('ALTER TABLE donations ADD COLUMN is_verified BOOLEAN DEFAULT FALSE')
    cursor.execute('ALTER TABLE donations ADD COLUMN screenshot_url VARCHAR')
    print("Migration successful: added is_verified and screenshot_url.")
except Exception as e:
    print("Log:", e)
finally:
    cursor.close()
    conn.close()
