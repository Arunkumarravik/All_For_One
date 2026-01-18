const todayKey = new Date().toLocaleDateString();

function saveExpense() {
    const amount = document.getElementById("amount").value;

    if (!amount) {
        alert("Please enter an amount");
        return;
    }

    let expenses = JSON.parse(localStorage.getItem(todayKey)) || [];
    expenses.push(Number(amount));

    localStorage.setItem(todayKey, JSON.stringify(expenses));

    document.getElementById("amount").value = "";
    showTotal();
}

function showTotal() {
    let expenses = JSON.parse(localStorage.getItem(todayKey)) || [];
    let total = expenses.reduce((a, b) => a + b, 0);

    document.getElementById("total").innerText =
        `Total expense for today: ₹${total}`;
}

showTotal();
