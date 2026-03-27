# Charity Funding Management System

A robust backend API for managing charity donations and tracking expenses with full transparency. Built with FastAPI and PostgreSQL.

## Prerequisites

- Python 3.9+
- PostgreSQL
- pgAdmin (optional for UI)

## Setup Instructions

### 1. Database Setup

1. Open pgAdmin or use the psql command line tool.
2. Create a new database named `charity_db`. You can use the `postgres` user with password `postgres` or update the credentials in `database/connection.py`.

### 2. Run the Application

Navigate to the project directory:
```bash
cd "d:/thetekies/Charity Management app"
```

Create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- For Windows: `venv\Scripts\activate`
- For Linux/Mac: `source venv/bin/activate`

Install the required dependencies:
```bash
pip install -r requirements.txt
```

Run the FastAPI server:
```bash
python main.py
```
Or with uvicorn directly:
```bash
uvicorn main:app --reload
```

### 3. Usage

Access the automatically generated Swagger UI API documentation at:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

1. **Register an Admin User**
   Since the `/expense` endpoint is protected by JWT authentication, you'll need an admin user.
   Use the `POST /register` endpoint via the Docs interface to create your credentials.

2. **Login and Get Token**
   Use the `POST /login` endpoint (or click the 'Authorize' button at the top right of the Docs UI) and enter your credentials. This will inject your JWT token to make protected calls.

3. **Try Out the Endpoints**
   - **`POST /donate`**: Add an anonymous or named donation.
   - **`GET /donations`**: View all current donations.
   - **`POST /expense`**: Log an authorized expense (Auth Required). Note: Business logic prevents submitting an expense if it exceeds current funds!
   - **`GET /expenses`**: Retrieve expense history.
   - **`GET /dashboard`**: See real-time calculated totalFunds, totalExpenses, and remainingBalance.

## Tech Stack
- FastAPI
- SQLAlchemy
- PostgreSQL
- Passlib (bcrypt)
- Python-JOSE (jwt)
