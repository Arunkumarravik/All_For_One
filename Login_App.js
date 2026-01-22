// -----------------------------
// Elements
// -----------------------------
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const msgBox = document.getElementById("msgBox");

const API_BASE = "http://127.0.0.1:8000"; // ✅ Change if needed

// -----------------------------
// Helpers
// -----------------------------
function showMessage(msg, type = "info") {
  msgBox.classList.remove("hidden");
  msgBox.innerText = msg;

  // optional colors
  if (type === "error") {
    msgBox.style.background = "#fef2f2";
    msgBox.style.border = "1px solid #fecaca";
  } else {
    msgBox.style.background = "#eff6ff";
    msgBox.style.border = "1px solid #bfdbfe";
  }
}

function clearMessage() {
  msgBox.classList.add("hidden");
  msgBox.innerText = "";
}

function setSession(user) {
  // ✅ Best practice: store only minimal safe info
  sessionStorage.setItem("active_user_id", user.user_id);
  sessionStorage.setItem("active_username", user.username);
}

// -----------------------------
// Page load (if already logged in)
// -----------------------------
window.addEventListener("load", () => {
  const username = sessionStorage.getItem("active_username");
  if (username) {
    window.location.href = "index.html";
  }
   document.getElementById("signupTab").innerText = "Sign Up";
 document.getElementById("signupTab").style.color = "green";
 document.getElementById("loginTab").innerText = "Login";
 document.getElementById("loginTab").style.color = "green";  
});

// -----------------------------
// Tabs logic
// -----------------------------
loginTab.addEventListener("click", () => {
  clearMessage();
  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  signupSection.classList.add("hidden");
  loginSection.classList.remove("hidden");

  document.getElementById("loginTab").innerText = "Login";
 document.getElementById("loginTab").style.color = "green";  // ✅ color

});

signupTab.addEventListener("click", () => {
  clearMessage();
  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  loginSection.classList.add("hidden");
  signupSection.classList.remove("hidden");
 document.getElementById("signupTab").innerText = "Sign Up";
 document.getElementById("signupTab").style.color = "green";  // ✅ color
});

// -----------------------------
// LOGIN (existing user)
// -----------------------------
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    showMessage("Please enter username and password", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.detail || "Login failed", "error");
      return;
    }

    // ✅ store session
    setSession(data);
    showMessage("Login successful ✅");

    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    showMessage("Backend not running / network issue", "error");
  }
});

// -----------------------------
// SIGNUP (first time user)
// -----------------------------
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const location = document.getElementById("location").value.trim();
  const address = document.getElementById("address").value.trim();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!username || !email || !dob || !location || !address || !password || !confirmPassword) {
    showMessage("Please fill all fields", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Password should be minimum 6 characters", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Password and Confirm Password do not match", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        dob,
        location,
        address,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.detail || "Signup failed", "error");
      return;
    }

    // ✅ store session
    setSession(data);
    showMessage("Account created ✅ Logging in...");

    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    showMessage("Backend not running / network issue", "error");
  }
});

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    btn.innerText = "Hide";
  } else {
    input.type = "password";
    btn.innerText = "Show";
  }
}

const pageTitle = document.getElementById("pageTitle");

loginTab.addEventListener("click", () => {
  clearMessage();

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  pageTitle.innerText = "Login";

  signupSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

signupTab.addEventListener("click", () => {
  clearMessage();

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  pageTitle.innerText = "Sign Up";

  loginSection.classList.add("hidden");
  signupSection.classList.remove("hidden");
});
