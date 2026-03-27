# Charity Management API Documentation

**Base URL (Local Environment)**: `http://127.0.0.1:8000`

---

## Authentication
All protected routes (Expenses & Admin Routes) require a JWT Token passed directly in the HTTP Headers.
*   **Header Key:** `Authorization`
*   **Header Value:** `Bearer <your_access_token_here>`

---

## 1. Authentication Endpoints

### Register Admin User
*   **Endpoint:** `POST /register`
*   **Content-Type:** `application/json`
*   **Request JSON:**
    ```json
    {
      "username": "admin",
      "password": "password123"
    }
    ```
*   **Expected Response (200 OK):**
    ```json
    {
      "username": "admin",
      "password": "hashed_password_string"
    }
    ```

### Login (Get JWT Token)
*   **Endpoint:** `POST /login`
*   **Content-Type:** `application/x-www-form-urlencoded`
*   **Request Fields:**
    *   `username` (string)
    *   `password` (string)
*   **Expected Response (200 OK):**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
      "token_type": "bearer"
    }
    ```

---

## 2. Public Donations Endpoints

### Submit Public Web Donation
*   **Endpoint:** `POST /donate`
*   **Content-Type:** `multipart/form-data`
*   *(Note: This is Form Data, not JSON, to support image uploads!)*
*   **Request Form Fields:**
    *   `amount` (float, required)
    *   `donor_name` (string, optional)
    *   `is_anonymous` (boolean, optional)
    *   `location_id` (integer, optional) - ID of the selected location
    *   `screenshot` (File, optional)
*   **Expected Response (200 OK):**
    ```json
    {
      "id": 1,
      "amount": 500,
      "donor_name": "John Doe",
      "is_anonymous": false,
      "is_verified": false,
      "screenshot_url": "/uploads/1234abcd-efgh.jpg",
      "location_id": 2,
      "location": {
        "id": 2,
        "name": "Main Branch"
      },
      "created_at": "2026-03-25T11:00:00Z"
    }
    ```

### View Verified Donations (Public Platform List)
*   **Endpoint:** `GET /donations`
*   **Expected Response (200 OK):**
    *Returns an array of all donations where `is_verified == true`.*
    ```json
    [
      {
        "id": 1,
        "amount": 500,
        "donor_name": "John Doe",
        "is_anonymous": false,
        "is_verified": true,
        "screenshot_url": "/uploads/1234abcd-efgh.jpg",
        "location_id": 2,
        "location": {
          "id": 2,
          "name": "Main Branch"
        },
        "created_at": "2026-03-25T11:00:00Z"
      }
    ]
    ```

### View All Locations (Public Dropdown List)
*   **Endpoint:** `GET /locations`
*   **Expected Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Main Branch"
      }
    ]
    ```

---

## 3. Admin & Finance Endpoints
### `🔒 JWT Token Required in Header`

### Manual Pre-Verified Donation
*   **Endpoint:** `POST /admin/donations`
*   **Description:** For an admin manually entering cash without a screenshot. Automatically verifies.
*   **Content-Type:** `application/json`
*   **Request JSON:**
    ```json
    {
      "amount": 100,
      "donor_name": "Walk-in Cash",
      "is_anonymous": false,
      "location_id": 1
    }
    ```
*   **Expected Response (200 OK):** Returns the Donation object with `is_verified` set to `true`.

### View All Donations (Pending & Verified)
*   **Endpoint:** `GET /admin/donations`
*   **Expected Response (200 OK):** Returns an array of every single donation object in the database for the admin to review.

### Verify a Pending Web Donation
*   **Endpoint:** `PUT /admin/donations/{donation_id}/verify`
*   **URL Parameter:** Replace `{donation_id}` with the integer ID of the donation.
*   **Expected Response (200 OK):** Returns the updated Donation object with `is_verified` flipped to `true`.

### Add a New Location
*   **Endpoint:** `POST /admin/locations`
*   **Content-Type:** `application/json`
*   **Request JSON:**
    ```json
    {
      "name": "Headquarters"
    }
    ```
*   **Expected Response (200 OK):** Returns the created Location object.

### Record a Charity Expense
*   **Endpoint:** `POST /expense`
*   **Content-Type:** `application/json`
*   **Request JSON:**
    ```json
    {
      "amount": 50,
      "description": "Bought printing paper"
    }
    ```
*   **Expected Response (200 OK):**
    ```json
    {
      "id": 1,
      "amount": 50,
      "description": "Bought printing paper",
      "created_at": "2026-03-25T11:15:00Z"
    }
    ```
    *(Note: Will return HTTP 400 "Insufficient funds" if the amount exceeds the charity's verified balance).*

### View All Recorded Expenses
*   **Endpoint:** `GET /expenses`
*   **Expected Response (200 OK):** Returns a JSON array of all expense objects.

---

## 4. Generic App Endpoints

### Dashboard Financial Aggregates
*   **Endpoint:** `GET /dashboard`
*   **Expected Response (200 OK):**
    ```json
    {
      "totalFunds": 1500.0,
      "totalExpenses": 200.0,
      "remainingBalance": 1300.0
    }
    ```
    *(Note: `totalFunds` is dynamically generated strictly from verified donations.)*
