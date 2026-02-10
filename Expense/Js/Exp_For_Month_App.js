/*const userId = sessionStorage.getItem("user_id");*/
const userId = 3;  // Temporary hardcoded user ID for testing
document.getElementById("userName").innerText = userId;

const API_BASE = "http://localhost:8000/api";
let expenses = [];

/* ---------------- SAVINGS ---------------- */
async function loadSavings() {
    const res = await fetch(`${API_BASE}/savings/${userId}`);
    const data = await res.json();

    if (!data || data.amount <= 0) {
        const initial = prompt("Enter your initial savings");
        await fetch(`${API_BASE}/savings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, amount: initial })
        });
        document.getElementById("savingsAmount").innerText = initial;
    } else {
        document.getElementById("savingsAmount").innerText = data.amount;
    }
}

/* ---------------- TOGGLE ---------------- */
function showLiving() {
    livingPanel.classList.remove("hidden");
    workPanel.classList.add("hidden");
}

function showWork() {
    workPanel.classList.remove("hidden");
    livingPanel.classList.add("hidden");
}

/* ---------------- PLANNED LOGIC ---------------- */
function isPlanned() {
    const today = new Date();
    return today.getDate() <= 7 && today.getDate() >= 27;
}

/* ---------------- ADD LIVING ---------------- */
function addLivingExpense() {
    const desc = livingDesc.value;
    const cat = livingCategory.value;
    const amt = Number(livingAmount.value);
    const expectedDate = document.getElementById("Expected_Expense").value;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    addExpense(desc, cat, amt, expectedDate  , yearMonth);
}

/* ---------------- ADD WORK ---------------- */
function addWorkExpense() {
    const desc = workDesc.value;
    const amt = Number(workDays.value) * Number(workPerDay.value);
    const expectedDate = document.getElementById("Expected_Expense").value;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    addExpense(desc, "Work Investment", amt , expectedDate , yearMonth);
}

/* ---------------- COMMON ADD ---------------- */
function addExpense(desc, category, amount, expectedDate,yearMonth) {
    const planned = isPlanned();

    const expenseObj = { desc, category, amount, planned,expectedDate, yearMonth };
    expenses.push(expenseObj);

    const row = expTable.tBodies[0].insertRow();

    row.innerHTML = `
        <td>${desc}</td>
        <td>${category}</td>
        <td>${amount}</td>
        <td>${planned ? "Yes" : "No"}</td>
        <td>${expectedDate}</td>
        <td><button class="action-btn">✖</button></td>
    `;

    // 🔥 DELETE LOGIC
    row.querySelector(".action-btn").addEventListener("click", () => {
        const index = expenses.indexOf(expenseObj);
        if (index > -1) {
            expenses.splice(index, 1);
        }
        row.remove();
    });
}


/* ---------------- SUBMIT ---------------- */
async function submitMonth() {

    if (expenses.length === 0) {
        alert("No expenses to submit");
        return;
    }

    const payload = {
        userId: 3,   // ✅ from sessionStorage
        expenses: expenses.map(e => ({
            desc: e.desc,
            category: e.category,
            amount: e.amount,
            planned: e.planned,
            Expected_date: e.expectedDate, // YYYY-MM-DD
            Entry_Period: e.yearMonth      // YYYY-MM
        }))
    };

    console.log("Submitting payload:", payload); // 🔍 DEBUG

    const res = await fetch(`${API_BASE}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json();
        console.error(err);
        alert("Submission failed. Check console.");
        return;
    }

    alert("Month submitted successfully!");
    expenses.length = 0; // clear array if you want
}


loadSavings();
