from fastapi import APIRouter, HTTPException
from db import get_db_connection
from models.income_models import IncomeRequest

router = APIRouter()

@router.post("/income")
def save_income(payload: IncomeRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        for inc in payload.income:
            cursor.execute(
                """
                INSERT INTO Live_tracker.Live_Money.Income
                (userid, source, category, income_type, income_date, amount)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                inc.userid,
                inc.source,
                inc.category,
                inc.type,
                inc.date,
                inc.amount
            )

        conn.commit()
        return {"message": "Income saved successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.close()
