from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import pyodbc
import bcrypt
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS (adjust frontend port if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
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

# -----------------------------
# Pydantic Models
# -----------------------------
class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    dob: str
    location: str
    address: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# -----------------------------
# Password Utils
# -----------------------------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def insert_login_audit(user_id: int, status: str , stat : str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Users.LoginAudit (UserId, Status , Stat_Description) VALUES (?, ?, ?)",
        user_id,
        status ,
        stat
    )
    conn.commit()
    conn.close()

# -----------------------------
# Signup Endpoint
# -----------------------------
@app.post("/auth/signup")
def signup_user(data: SignupRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # ✅ check existing username/email
    cursor.execute("SELECT UserId FROM Users.Login_Details WHERE Username = ? OR Email = ?", data.username, data.email)
    existing = cursor.fetchone()

    date_format = datetime.strptime(data.dob, "%Y-%m-%d").date()

    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists with same username/email")

    hashed_pwd = hash_password(data.password)

    cursor.execute("""
        INSERT INTO Users.Login_Details (Username, Email, DOB, Location, Address, PasswordHash)
        VALUES (?, ?, ?, ?, ?, ?)
    """, data.username, data.email, date_format, data.location, data.address, hashed_pwd)

    conn.commit()

    # ✅ get new user id
    cursor.execute("SELECT UserId FROM Users.Login_Details WHERE Username = ?", data.username)
    user_row = cursor.fetchone()

    conn.close()

    return {"user_id": user_row[0], "username": data.username}

# -----------------------------
# Login Endpoint
# -----------------------------
@app.post("/auth/login")
def login_user(data: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT UserId, Username, PasswordHash FROM Users.Login_Details WHERE Username = ?", data.username)
    row = cursor.fetchone()

    if not row:
        conn.close()

        raise HTTPException(status_code=401, detail="Invalid username or password")

    user_id, username, password_hash = row

    if not verify_password(data.password, password_hash):
        conn.close()

        insert_login_audit(user_id, "Failed" , "Invalid Password Attempt")

        raise HTTPException(status_code=401, detail="Invalid password")

    conn.close()

    insert_login_audit(user_id, "Success" , "Login Successful")

    return {"user_id": user_id, "username": username}
