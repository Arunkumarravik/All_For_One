let reserve = 100000;

function addRow() {
    const categoryInput = document.getElementById("categoryInput");
    const expenseInput = document.getElementById("expenseInput");

    const category = categoryInput.value.trim();
    const expense = Number(expenseInput.value);

    if (!category || expense <= 0) {
        alert("Please enter valid values");
        return;
    }

    reserve -= expense;

    const tableBody = document.querySelector("#expTable tbody");
    const row = tableBody.insertRow();

    row.innerHTML = `
        <td>${category}</td>
        <td>${expense}</td>
        <td class="reserve">${reserve}</td>
        <td>
            <button class="action-btn" onclick="editRow(this)">Update</button>
        </td>
    `;

    // Clear inputs
    categoryInput.value = "";
    expenseInput.value = "";

    // Backend-ready
    fetch("/api/expected-expense", {
        method: "POST",
        body: JSON.stringify({ category, expense, reserve })
    });
}

/*Update logic*/
function editRow(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");

    const category = cells[0].innerText;
    const expense = cells[1].innerText;

    // Store old expense BEFORE editing
    row.dataset.oldExpense = expense;

    cells[0].innerHTML = `<input value="${category}">`;
    cells[1].innerHTML = `<input type="number" value="${expense}">`;

    button.innerText = "Save";
    button.classList.add("save-mode"); // ✅ turn GREEN
    button.onclick = function () {
        saveRow(this);
    };
}

function saveRow(button) {
    const row = button.closest("tr");
    const inputs = row.querySelectorAll("input");

    const newCategory = inputs[0].value;
    const newExpense = Number(inputs[1].value);
    const oldExpense = Number(row.dataset.oldExpense);

    // Reserve recalculation
    reserve += oldExpense;
    reserve -= newExpense;

    row.cells[0].innerText = newCategory;
    row.cells[1].innerText = newExpense;
    row.cells[2].innerText = reserve;

    button.innerText = "Update";
    button.classList.remove("save-mode"); // ✅ back to PINK
    button.onclick = function () {
        editRow(this);
    };

    fetch("/api/expected-expense/update", {
        method: "PUT",
        body: JSON.stringify({ newCategory, newExpense, reserve })
    });
}
