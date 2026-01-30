from pydantic import BaseModel
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import pyodbc
from datetime import datetime , date
# ---------------- DB CONNECTION ----------------
def get_db_connection():   
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Live_tracker;"
        "Trusted_Connection=yes;"
    )

class Expense(BaseModel):
    userid: int
    category: str
    detail: str
    date: date
    total_amount: float
    my_share: float
    outstanding_reserve: float
    split_count: int

class ExpenseRequest(BaseModel):
    expenses: List[Expense]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/expenses")
def save_expenses(payload: ExpenseRequest):
    connection = get_db_connection()

    try:
        cursor = connection.cursor()

        insert_query = """
        INSERT INTO Live_Money.Actual_Expenses
        (userid , category, expense_detail, expense_date, total_amount, my_share, outstanding_reserve, split_count)
        VALUES (?,?, ?, ?, ?, ?, ?, ?)
        """

        for exp in payload.expenses:
            cursor.execute(
                insert_query,
                exp.userid,
                exp.category,
                exp.detail,
                exp.date,
                exp.total_amount,
                exp.my_share,
                exp.outstanding_reserve,
                exp.split_count
            )


        connection.commit()
        return {"message": "Expenses saved successfully"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()

@app.get("/reserve/{userid}")
def get_actual_reserve(userid: int):
    connection = get_db_connection()

    try:
        cursor = connection.cursor()

        query = """
        SELECT SUM(amount)
        FROM Live_Money.Expected_Expenses
        WHERE userid = ?
        AND Entry_Period = (
            SELECT MAX(Entry_Period)
            FROM Live_Money.Expected_Expenses
            WHERE userid = ?
        )
        """

        cursor.execute(query, userid, userid)
        result = cursor.fetchone()

        actual_reserve = result[0] if result[0] else 0

        return {"actualReserve": actual_reserve}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()

