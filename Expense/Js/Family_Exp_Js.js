/***********************
 * GLOBAL STATE
 ***********************/
let previousReserve = 60000;
let outstandingReserve = previousReserve;

document.getElementById("reserve").value = outstandingReserve.toFixed(2);

/***********************
 * SEARCH MEMBER
 ***********************/
function searchMember() {
    const name = document.getElementById("searchName").value.trim();

    if (!name) {
        alert("Enter a name to search");
        return;
    }

    fetch(`/api/search-member?name=${name}`)
        .then(res => res.json())
        .then(data => {
            if (data.exists) {
                document.getElementById("familyChoice").style.display = "block";
            } else {
                alert("Member not found");
            }
        })
        .catch(() => alert("Backend not connected"));
}

function addToExisting() {
    alert("Added to existing family");
    document.getElementById("familyChoice").style.display = "none";
}

function createNewFamily() {
    document.getElementById("familyName").style.display = "block";
}

/***********************
 * SPLIT TOGGLE
 ***********************/
function toggleSplit() {
    const isSplit = document.getElementById("isSplit").value;
    document.getElementById("persons").style.display =
        isSplit === "yes" ? "block" : "none";
}

/***********************
 * ADD EXPENSE
 ***********************/
function addExpense() {
    const category = document.getElementById("category").value.trim();
    const details = document.getElementById("details").value.trim();
    const date = document.getElementById("date").value;
    const totalAmount = Number(document.getElementById("amount").value);

    const isSplit = document.getElementById("isSplit").value === "yes";
    const persons = isSplit
        ? Number(document.getElementById("persons").value)
        : 1;

    if (!category || !details || !date || totalAmount <= 0 || persons <= 0) {
        alert("Please fill all required fields");
        return;
    }

    const myShare = isSplit ? totalAmount / persons : totalAmount;

    // update reserve
    outstandingReserve -= myShare;
    document.getElementById("reserve").value = outstandingReserve.toFixed(2);

    const tbody = document.querySelector("#familyTable tbody");
    const row = tbody.insertRow();

    // store old values for update/delete
    row.dataset.totalAmount = totalAmount;
    row.dataset.persons = persons;
    row.dataset.myShare = myShare;

    row.innerHTML = `
        <td>${category}</td>
        <td>${details}</td>
        <td>${date}</td>
        <td>${totalAmount.toFixed(2)}</td>
        <td>${myShare.toFixed(2)}</td>
        <td>${outstandingReserve.toFixed(2)}</td>
        <td>${isSplit ? persons : "No"}</td>
        <td>
            <button class="update-btn" onclick="editRow(this)">Edit</button>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
        </td>
    `;

    fetch("/api/family-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category,
            details,
            date,
            totalAmount,
            myShare,
            persons,
            outstandingReserve
        })
    });
}

/***********************
 * EDIT ROW
 ***********************/
function editRow(button) {
    const row = button.closest("tr");
    const cells = row.cells;

    const details = cells[1].innerText;
    const totalAmount = cells[3].innerText;
    const persons = row.dataset.persons;

    cells[1].innerHTML = `<input value="${details}">`;
    cells[3].innerHTML = `<input type="number" value="${totalAmount}">`;
    cells[6].innerHTML = `
        <input type="number" min="1" value="${persons}">
    `;

    button.innerText = "Save";
    button.onclick = () => saveRow(button);
}

/***********************
 * SAVE ROW (UPDATE)
 ***********************/
function saveRow(button) {
    const row = button.closest("tr");
    const cells = row.cells;

    const newDetails = cells[1].querySelector("input").value;
    const newTotal = Number(cells[3].querySelector("input").value);
    const newPersons = Number(cells[6].querySelector("input").value);

    if (newTotal <= 0 || newPersons <= 0) {
        alert("Invalid values");
        return;
    }

    const oldMyShare = Number(row.dataset.myShare);

    // rollback old share
    outstandingReserve += oldMyShare;

    // apply new share
    const newMyShare = newTotal / newPersons;
    outstandingReserve -= newMyShare;

    // update UI
    cells[1].innerText = newDetails;
    cells[3].innerText = newTotal.toFixed(2);
    cells[4].innerText = newMyShare.toFixed(2);
    cells[5].innerText = outstandingReserve.toFixed(2);
    cells[6].innerText = newPersons;

    // persist new values
    row.dataset.totalAmount = newTotal;
    row.dataset.persons = newPersons;
    row.dataset.myShare = newMyShare;

    document.getElementById("reserve").value = outstandingReserve.toFixed(2);

    button.innerText = "Edit";
    button.onclick = () => editRow(button);

    fetch("/api/family-expense/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            newDetails,
            newTotal,
            newPersons,
            outstandingReserve
        })
    });
}

/***********************
 * DELETE ROW
 ***********************/
function deleteRow(button) {
    const row = button.closest("tr");
    const myShare = Number(row.dataset.myShare);

    // restore reserve
    outstandingReserve += myShare;
    document.getElementById("reserve").value = outstandingReserve.toFixed(2);

    row.remove();

    fetch("/api/family-expense/delete", {
        method: "DELETE"
    });
}
