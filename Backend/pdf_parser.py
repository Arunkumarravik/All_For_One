import pdfplumber
import pandas as pd
import re


def extract_lines_from_pdf(pdf_path):
    lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                lines.extend(text.split("\n"))
    return lines


def parse_phonepe_transactions(lines):
    transactions = []
    current_txn = {}

    date_pattern = re.compile(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2},\s\d{4}")
    time_pattern = re.compile(r"\d{2}:\d{2}\s?(AM|PM)")
    amount_pattern = re.compile(r"₹([\d,]+)")
    paid_to_pattern = re.compile(r"Paid to\s(.+?)(?=\sDEBIT|\sCREDIT|$)")

    for line in lines:
        line = line.replace("�", ":").strip()

        # 🔹 If a new date appears, close previous transaction
        if date_pattern.search(line):
            if current_txn:
                transactions.append(current_txn)
                current_txn = {}

            current_txn["date"] = date_pattern.search(line).group()

        # Time (if present)
        time_match = time_pattern.search(line)
        if time_match:
            current_txn["time"] = time_match.group()

        # Debit / Credit
        if "DEBIT" in line or "CREDIT" in line:
            current_txn["type"] = "DEBIT" if "DEBIT" in line else "CREDIT"

        # Amount
        amt_match = amount_pattern.search(line)
        if amt_match:
            current_txn["amount"] = amt_match.group(1).replace(",", "")

        # ✅ Paid to (works for SAME LINE + multi-line)
        paid_to_match = paid_to_pattern.search(line)
        if paid_to_match:
            current_txn["paid_to"] = paid_to_match.group(1).strip()

        # Transaction ID
        if "Transaction ID" in line:
            current_txn["transaction_id"] = line.replace("Transaction ID", "").strip()

        # UTR
        if "UTR No." in line:
            current_txn["utr"] = line.replace("UTR No.", "").strip()

        # Paid by
        if "Paid by" in line:
            current_txn["paid_by_account"] = line.replace("Paid by", "").strip()

    # Append last transaction
    if current_txn:
        transactions.append(current_txn)

    return pd.DataFrame(transactions)


if __name__ == "__main__":
    pdf_path = r"D:\Documents\Neeeeeeeeeeeew\Goal_Achiever\Backend\invoice.pdf"  # your PhonePe statement

    lines = extract_lines_from_pdf(pdf_path)
    df = parse_phonepe_transactions(lines)

    print("\n✅ Parsed Transactions (ONE-LINE SAFE):\n")
    print(df)

    df.to_csv(r"D:\Documents\Neeeeeeeeeeeew\Goal_Achiever\Backend\phonepe_transactions_final.csv", index=False)
