function depositMoney() {
    fetch("http://127.0.0.1:8000/post-deposit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            account_id: document.getElementById("accountId").value,
            username: document.getElementById("username").value,
            amount: document.getElementById("amount").value,
            balance: document.getElementById("balance").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.error(err));
}
