// ================= GLOBAL STATE =================
let actualReserve = 0;
const userId = 3; // TEMP (replace with real login user id)

async function loadActualReserve() {
    try {
        const response = await fetch(`http://localhost:8000/reserve/${userId}`);
        const data = await response.json();

        actualReserve = data.actualReserve;
        document.getElementById("reserve").value = actualReserve;

    } catch (error) {
        console.error(error);
        alert("Failed to load reserve amount");
    }
}

// Load reserve when page loads
window.onload = loadActualReserve;

// ================= SPLIT TOGGLE =================
function toggleSplit() {
    const isSplit = document.getElementById("isSplit").value;
    document.getElementById("persons").style.display =
        isSplit === "yes" ? "block" : "none";
}

// ================= ADD EXPENSE =================
function addExpense() {
    const category = categoryInput();
    const detail = expenseDetailInput();
    const date = dateInput();
    const totalAmount = amountInput();
    const isSplit = isSplitYes();
    const persons = splitCount(isSplit);

    if (!category || !detail || !date || totalAmount <= 0 || persons <= 0) {
        alert("Fill all required fields");
        return;
    }

    const myShare = totalAmount / persons;

    // ✅ Reserve update on INSERT
    actualReserve -= myShare;
    document.getElementById("reserve").value = actualReserve;

    const row = document.querySelector("#expenseTable tbody").insertRow();

    row.dataset.totalAmount = totalAmount;
    row.dataset.persons = persons;
    row.dataset.myShare = myShare;

    row.innerHTML = `
        <td>${category}</td>
        <td>${detail}</td>
        <td>${date}</td>
        <td>${totalAmount}</td>
        <td>${myShare.toFixed(2)}</td>
        <td>${actualReserve.toFixed(2)}</td>
        <td>${persons}</td>
        <td>
            <button class="action-btn update-btn" onclick="editRow(this)">✏️ Edit</button>
        </td>
        <td>
            <button class="action-btn delete-btn" onclick="deleteRow(this)">🗑️ Delete</button>
        </td>
    `;
}

// ================= EDIT ROW =================
function editRow(btn) {
    const row = btn.closest("tr");
    const cells = row.cells;

    cells[1].innerHTML = `<input value="${cells[1].innerText}">`;
    cells[3].innerHTML = `<input type="number" value="${cells[3].innerText}">`;
    cells[6].innerHTML = `<input type="number" min="1" value="${cells[6].innerText}">`;

    btn.innerText = "💾 Save";
    btn.onclick = () => saveRow(btn);
}

// ================= SAVE ROW =================
function saveRow(btn) {
    const row = btn.closest("tr");
    const cells = row.cells;

    const newDetail = cells[1].querySelector("input").value;
    const newTotal = Number(cells[3].querySelector("input").value);
    const newPersons = Number(cells[6].querySelector("input").value);

    if (newTotal <= 0 || newPersons <= 0) {
        alert("Invalid values");
        return;
    }

    const oldMyShare = Number(row.dataset.myShare);

    // ✅ LOGIC YOU ASKED FOR
    // Step 1: take latest reserve
    actualReserve += oldMyShare;

    // Step 2: subtract new share
    const newMyShare = newTotal / newPersons;
    actualReserve -= newMyShare;

    // Step 3: update UI
    cells[1].innerText = newDetail;
    cells[3].innerText = newTotal;
    cells[4].innerText = newMyShare.toFixed(2);
    cells[5].innerText = actualReserve.toFixed(2);
    cells[6].innerText = newPersons;

    row.dataset.totalAmount = newTotal;
    row.dataset.persons = newPersons;
    row.dataset.myShare = newMyShare;

    document.getElementById("reserve").value = actualReserve;

    btn.innerText = "✏️ Edit";
    btn.onclick = () => editRow(btn);
}

// ================= DELETE ROW =================
function deleteRow(btn) {
    const row = btn.closest("tr");
    const myShare = Number(row.dataset.myShare);

    // ✅ rollback reserve
    actualReserve += myShare;
    document.getElementById("reserve").value = actualReserve;

    row.remove();
}

// ================= HELPERS =================
const categoryInput = () => document.getElementById("category").value;
const expenseDetailInput = () => document.getElementById("expenseDetail").value;
const dateInput = () => document.getElementById("date").value;
const amountInput = () => Number(document.getElementById("amount").value);
const isSplitYes = () => document.getElementById("isSplit").value === "yes";
const splitCount = (isSplit) =>
    isSplit ? Number(document.getElementById("persons").value) : 1;

// ================= SUBMIT ALL EXPENSES =================
async function submitExpenses() {
    const rows = document.querySelectorAll("#expenseTable tbody tr");

    if (rows.length === 0) {
        alert("No expenses to submit");
        return;
    }

    const expenses = [];

    rows.forEach(row => {
        const cells = row.cells;

        expenses.push({
            userid : 3 ,
            category: cells[0].innerText,
            detail: cells[1].innerText,
            date: cells[2].innerText,
            total_amount: Number(cells[3].innerText),
            my_share: Number(cells[4].innerText),
            outstanding_reserve: Number(cells[5].innerText),
            split_count: Number(cells[6].innerText)
        });
    });
    console.log(expenses);
    try {
        const response = await fetch("http://localhost:8000/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expenses: expenses
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Expenses saved successfully ✅");
        } else {
            alert(data.detail || "Failed to save expenses");
        }

    } catch (err) {
        console.error(err);
        alert("Backend not reachable");
    }
}

