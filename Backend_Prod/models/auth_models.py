from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    dob: str            # yyyy-mm-dd (string from frontend)
    location: str
    address: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str
