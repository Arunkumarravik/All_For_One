from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pyodbc
from typing import List
from datetime import datetime ,date
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB CONNECTION ----------------
def get_db_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Live_tracker;"
        "Trusted_Connection=yes;"
    )

# ---------------- MODELS ----------------
class SavingsCreate(BaseModel):
    userId: int
    amount: float

class ExpenseItem(BaseModel):
    desc: str
    category: str
    amount: float
    planned: bool
    Expected_date : date
    Entry_Period : str 


class ExpenseCreate(BaseModel):
    userId: int
    expenses: List[ExpenseItem]

# ---------------- SAVINGS APIs ----------------
@app.get("/api/savings/{userId}")
def get_savings(userId: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT top 1 amount FROM Live_Money.savings WHERE userId = ? Order by Created_At", userId
    )
    row = cursor.fetchone()

    conn.close()

    if not row:
        return {"amount": 0}

    return {"amount": row[0]}


@app.post("/api/savings")
def create_savings(data: SavingsCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    # check if savings already exists

    cursor.execute(
        "INSERT INTO Live_Money.savings (userid, amount) VALUES (?, ?)",
        data.userId,
        data.amount
    )
    conn.commit()
    conn.close()

    return {"message": "Savings created successfully"}

# ---------------- EXPENSE APIs ----------------
@app.post("/api/expenses")
def create_expenses(payload: ExpenseCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    for exp in payload.expenses:
        cursor.execute(
            """
            INSERT INTO Live_Money.Expected_Expenses
            (userId, description, category, amount, planned  , Expense_date , Entry_Period)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            payload.userId,
            exp.desc,
            exp.category,
            exp.amount,
            exp.planned,
            exp.Expected_date,
            exp.Entry_Period
        )

    conn.commit()
    conn.close()

    return {"message": "Expenses saved successfully"}

# ---------------- HEALTH CHECK ----------------
@app.get("/")
def root():
    return {"status": "Expense Tracker API is running"}
