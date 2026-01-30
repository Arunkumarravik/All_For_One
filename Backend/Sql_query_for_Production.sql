Create  database Live_tracker;
Create schema Users;

CREATE TABLE Users.Login_Details (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(150) NOT NULL UNIQUE,
    DOB DATE NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Address VARCHAR(300) NOT NULL,
    PasswordHash VARCHAR(300) NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

--Drop table Users.LoginAudit
CREATE TABLE Users.LoginAudit (
    AuditId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    LoginTime DATETIME2 DEFAULT SYSUTCDATETIME(),
    Status VARCHAR(20) NOT NULL, -- SUCCESS / FAILED ,
	Stat_Description VARCHAR(1000),
    FOREIGN KEY (UserId) REFERENCES Users.Login_Details(UserId)
);


Select  * from Users.Login_Details;

Select * from Users.LoginAudit ;

Use database Live_tracker;

Create schema Live_Money;

CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY
);

CREATE TABLE Live_Money.savings (
    userid INT,
    amount DECIMAL(12,2),
	created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userid) REFERENCES Users.Login_Details(userid)
);

CREATE   TABLE Live_Money.Expected_Expenses (
    id INT IDENTITY PRIMARY KEY,
    userid INT,
    description VARCHAR(100),
    category VARCHAR(50),
    amount DECIMAL(12,2),
    planned BIT,   
	Entry_Period nVARCHAR(100),
	Expense_Date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userid) REFERENCES Users.Login_Details(userid)
);

