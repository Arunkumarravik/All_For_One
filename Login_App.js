const form = document.getElementById("userForm");

// On page load
window.addEventListener("load", () => {
    const username = sessionStorage.getItem("active_username");

    if (username) {
        // Existing user → directly go to index.html
        window.location.href = "index.html";
    }
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    if (!username) return;

    const userKey = `user_${username}`;
    const existingUser = sessionStorage.getItem(userKey);

    // Always store active username
    sessionStorage.setItem("active_username", username);

    // First-time user → store full details
    if (!existingUser) {
        const userDetails = {
            username: username,
            email: document.getElementById("email").value,
            dob: document.getElementById("dob").value,
            location: document.getElementById("location").value,
            address: document.getElementById("address").value,
            createdAt: new Date().toISOString()
        };

        sessionStorage.setItem(userKey, JSON.stringify(userDetails));
    }

    // Redirect after login
    window.location.href = "index.html";
});
