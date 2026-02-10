from fastapi import APIRouter, HTTPException
from datetime import datetime
import bcrypt
from db import get_db_connection
from models.auth_models import SignupRequest, LoginRequest

router = APIRouter()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed.encode())

def insert_login_audit(user_id, status, stat):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Users.LoginAudit (UserId, Status, Stat_Description) VALUES (?, ?, ?)",
        user_id, status, stat
    )
    conn.commit()
    conn.close()

@router.post("/signup")
def signup(data: SignupRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT UserId FROM Users.Login_Details WHERE Username=? OR Email=?",
        data.username, data.email
    )
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    dob = datetime.strptime(data.dob, "%Y-%m-%d").date()
    pwd = hash_password(data.password)

    cursor.execute("""
        INSERT INTO Users.Login_Details
        (Username, Email, DOB, Location, Address, PasswordHash)
        VALUES (?, ?, ?, ?, ?, ?)
    """, data.username, data.email, dob, data.location, data.address, pwd)

    conn.commit()
    cursor.execute("SELECT UserId FROM Users.Login_Details WHERE Username=?", data.username)
    user_id = cursor.fetchone()[0]
    conn.close()

    return {"user_id": user_id, "username": data.username}

@router.post("/login")
def login(data: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT UserId, PasswordHash FROM Users.Login_Details WHERE Username=?",
        data.username
    )
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, hashed = row
    if not verify_password(data.password, hashed):
        insert_login_audit(user_id, "Failed", "Invalid Password")
        raise HTTPException(status_code=401, detail="Invalid password")

    insert_login_audit(user_id, "Success", "Login Successful")
    conn.close()

    return {"user_id": user_id, "username": data.username}
