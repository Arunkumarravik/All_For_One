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


CREATE TABLE Users.LoginAudit (
    AuditId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    LoginTime DATETIME2 DEFAULT SYSUTCDATETIME(),
    Status VARCHAR(20) NOT NULL, -- SUCCESS / FAILED
    FOREIGN KEY (UserId) REFERENCES Users.Login_Details(UserId)
);
