from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pyodbc
from pydantic import BaseModel
from typing import List
from datetime import date

class Income(BaseModel):
    userid: int
    source: str
    category: str
    type: str          # daily / monthly / yearly
    date: date
    amount: float

class IncomeRequest(BaseModel):
    income: List[Income]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Live_tracker;"
        "Trusted_Connection=yes;"
    )
@app.post("/income")
def save_income(payload: IncomeRequest):
    connection = get_db_connection()

    try:
        cursor = connection.cursor()

        insert_query = """
        INSERT INTO Live_tracker.Live_Money.Income
        (userid , source, category, income_type, income_date, amount)
        VALUES (?, ?, ?, ?, ?, ?)
        """

        for inc in payload.income:
            cursor.execute(
                insert_query,
                inc.userid,
                inc.source,
                inc.category,
                inc.type,
                inc.date,
                inc.amount
            )

        connection.commit()
        return {"message": "Income saved successfully"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()
