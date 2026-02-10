from pydantic import BaseModel
from typing import List
from datetime import date

class Income(BaseModel):
    userid: int
    source: str
    category: str
    type: str        # daily / monthly / yearly
    date: date
    amount: float

class IncomeRequest(BaseModel):
    income: List[Income]
