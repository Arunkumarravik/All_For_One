let incomeList = [];

function addIncome() {
    const source = incomeSource.value;
    const category = incomeCategory.value;
    const type = incomeType.value;
    const date = incomeDate.value;
    const amount = Number(incomeAmount.value);
    const userid = 3;

    if (!source || !date || amount <= 0) {
        alert("Fill all fields correctly");
        return;
    }

    const row = incomeTable.tBodies[0].insertRow();

    row.innerHTML = `
        <td>${source}</td>
        <td>${category}</td>
        <td>${type}</td>
        <td>${date}</td>
        <td>${amount}</td>
        <td><button onclick="deleteRow(this)">🗑️</button></td>
    `;

    incomeList.push({ userid, source, category, type, date, amount });
}

function deleteRow(btn) {
    const row = btn.closest("tr");
    const index = row.rowIndex - 1;
    incomeList.splice(index, 1);
    row.remove();
}

async function submitIncome() {
    if (incomeList.length === 0) {
        alert("No income to submit");
        return;
    }

    await fetch("http://localhost:8000/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: incomeList })
    });

    alert("Income saved successfully ✅");
}
