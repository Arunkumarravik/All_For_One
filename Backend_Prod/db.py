import pyodbc

def get_db_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=ARUN-ICHI;"
        "DATABASE=Live_Tracker_Prod;"
        "Trusted_Connection=yes;"
    )
