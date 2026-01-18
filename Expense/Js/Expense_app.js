const today = new Date();
document.getElementById("greeting").innerText =
    `Hi there! What is your expense for the day : ${today.toDateString()}`;

function goToExpected() {
    location.href = "Exp_For_Month.html";
}
function goToMyExpense() {
    location.href = "My_Expense.html";
}
function goToSplitExpense() {
    location.href = "Collab_Exp.html";
}
function nav(page) {
    location.href = page + ".html";
}
