from fastapi import APIRouter, HTTPException
from db import get_db_connection
from models.expense_models import ExpenseRequest

router = APIRouter()

@router.post("/expenses")
def save_expenses(payload: ExpenseRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        for exp in payload.expenses:
            cursor.execute("""
                INSERT INTO Live_Money.Actual_Expenses
                (userid, category, expense_detail, expense_date,
                 total_amount, my_share, outstanding_reserve, split_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            exp.userid, exp.category, exp.detail, exp.date,
            exp.total_amount, exp.my_share, exp.outstanding_reserve, exp.split_count)

        conn.commit()
        return {"message": "Expenses saved successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/reserve/{userid}")
def get_reserve(userid: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT SUM(amount)
        FROM Live_Money.Expected_Expenses
        WHERE userid = ?
        AND Entry_Period = (
            SELECT MAX(Entry_Period)
            FROM Live_Money.Expected_Expenses WHERE userid = ?
        )
    """, userid, userid)

    result = cursor.fetchone()[0] or 0
    conn.close()
    return {"actualReserve": result}
