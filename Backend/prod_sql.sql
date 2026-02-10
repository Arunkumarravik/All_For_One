/*INSERT INTO Users.Login_Details
(
    Username,
    Email,
    DOB,
    Location,
    Address,
    PasswordHash
)
VALUES
(
    'Arun_Kumar',
    'arunkumarravi60@gmail.com',
    '2001-12-27',
    'Namakkal',
    '1/115 A Periyathottam PeriyaSolipalayam',
    '$2b$12$RESPLACE_WRITH_REANL_BDCHY'
);
*/
Select * from  Users.Login_Details;

Select * from Live_Money.savings;

CREATE  TABLE Live_Money.Expected_Expenses (
    id INT IDENTITY PRIMARY KEY,
    userid INT,
    description VARCHAR(1000),
    category VARCHAR(50),
    amount DECIMAL(12,2),
    planned BIT,   
	Entry_Period nVARCHAR(100),
	Expense_Date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userid) REFERENCES Users.Login_Details(userid)
);


Select * from Live_Money.Expected_Expenses;