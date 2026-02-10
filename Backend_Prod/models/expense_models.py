from pydantic import BaseModel
from typing import List
from datetime import date

# ---------------- ACTUAL EXPENSE ----------------
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

# ---------------- EXPECTED EXPENSE ----------------
class SavingsCreate(BaseModel):
    userId: int
    amount: float

class ExpectedExpenseItem(BaseModel):
    desc: str
    category: str
    amount: float
    planned: bool
    Expected_date: date
    Entry_Period: str

class ExpectedExpenseCreate(BaseModel):
    userId: int
    expenses: List[ExpectedExpenseItem]
