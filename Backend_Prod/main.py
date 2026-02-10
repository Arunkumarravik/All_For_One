from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.actual_expense import router as actual_expense_router
from routers.expected_expense import router as expected_expense_router
from routers.income import router as income_router

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten later if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(actual_expense_router, tags=["Actual Expense"])
app.include_router(expected_expense_router, prefix="/api", tags=["Expected Expense"])
app.include_router(income_router, tags=["Income"])

@app.get("/")
def health_check():
    return {"status": "API running 🚀"}
