"""#Testing the Sql server connection : 

import pyodbc 

conn= pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Accounts;"
        "Trusted_Connection=yes;"
    )
cursor = conn.cursor()

cursor.execute(
        "INSERT INTO dbo.deposit (Account_Id  ,UserName  , deposited_Amount ,  Balance  )" \
        "Values (1 , 'Arun' , 100  ,1000 )"
        
    )
conn.commit()
conn.close()"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
import pyodbc

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------
# Database connection function
# -----------------------------
def get_db_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Accounts;"
        "Trusted_Connection=yes;"
    )

# -----------------------------
# Request body
# -----------------------------
class DepositRequest(BaseModel):
    account_id: int
    amount : float
    balance : float
    username: str

# -----------------------------
# Deposit API
# -----------------------------
@app.post("/post-deposit")
def post_deposit_money(data: DepositRequest):

    conn= pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Accounts;"
        "Trusted_Connection=yes;"
    )
    cursor = conn.cursor()

    cursor.execute(
            """INSERT INTO dbo.deposit (Account_Id  ,UserName  , deposited_Amount ,  Balance  )
            Values (? , ? , ?  , ? )""" ,
            data.account_id , 
            data.username  ,
            data.amount ,
            data.balance
        )
    conn.commit()
    conn.close()

    return {
        "message": f"Deposit successful for {data.username}" }


@app.post("/get-deposit")
def get_deposit_money(data: DepositRequest):

    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid deposit amount")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if account exists
    cursor.execute(
        """
        SELECT balance FROM accounts_savings
        WHERE account_id = ? AND user_id = ?
        """,
        data.account_id,
        data.user_id
    )

    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Account not found")

    new_balance = row[0] + data.amount

    # Update balance
    cursor.execute(
        """
        UPDATE accounts_savings
        SET balance = ?, last_updated = GETDATE()
        WHERE account_id = ? AND user_id = ?
        """,
        new_balance,
        data.account_id,
        data.user_id
    )

    conn.commit()
    conn.close()

    return {
        "message": f"Deposit successful for {data.username}",
        "balance": new_balance
    }
