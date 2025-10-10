// Ensure event listeners are added after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");

    if (signupBtn) signupBtn.addEventListener("click", registerUser);
    if (loginBtn) loginBtn.addEventListener("click", loginUser);
});

// Signup Function
async function registerUser(event) {
    event.preventDefault(); // Prevent page refresh

    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    console.log("Sending signup request to server...");

    try {
        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        console.log("Received signup response:", data);

        if (response.ok && data.user) {
            alert("Signup Successful! You can now log in.");
            toggleAuth('login'); // Switch to login form after signup
        } else {
            console.error('Signup failed:', data.error || "Unknown error");
            alert(data.error || "Signup failed.");
        }
    } catch (error) {
        console.error("Error during signup request:", error);
        alert("An error occurred. Please try again.");
    }
}

// Login Function
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    console.log("Sending login request to server...");

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("Received login response:", data);

        if (response.ok && data.user) {
            alert("Login Successful!");
        } else {
            console.error('Login failed:', data.error || "Unknown error");
            alert(data.error || "Login failed.");
        }
    } catch (error) {
        console.error("Error during login request:", error);
        alert("An error occurred. Please try again.");
    }
}
