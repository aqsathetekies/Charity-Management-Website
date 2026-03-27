-- Run this script in pgAdmin or via psql
CREATE DATABASE charity_db;

-- Connect to the database
\c charity_db;

-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,
    password VARCHAR
);

-- Table: donations
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    amount FLOAT NOT NULL,
    donor_name VARCHAR,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: expenses
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    amount FLOAT NOT NULL,
    description VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
