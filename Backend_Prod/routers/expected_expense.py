from fastapi import APIRouter
from db import get_db_connection
from models.expense_models import (
    SavingsCreate,
    ExpectedExpenseCreate
)

router = APIRouter()

# ---------------- SAVINGS ----------------
@router.get("/savings/{userId}")
def get_savings(userId: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT TOP 1 amount FROM Live_Money.savings WHERE userId = ? ORDER BY Created_At DESC",
        userId
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {"amount": 0}

    return {"amount": row[0]}


@router.post("/savings")
def create_savings(data: SavingsCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO Live_Money.savings (userid, amount) VALUES (?, ?)",
        data.userId,
        data.amount
    )

    conn.commit()
    conn.close()

    return {"message": "Savings created successfully"}

# ---------------- EXPECTED EXPENSE ----------------
@router.post("/expenses")
def create_expected_expenses(payload: ExpectedExpenseCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    for exp in payload.expenses:
        cursor.execute(
            """
            INSERT INTO Live_Money.Expected_Expenses
            (userId, description, category, amount, planned, Expense_date, Entry_Period)
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

    return {"message": "Expected expenses saved successfully"}
