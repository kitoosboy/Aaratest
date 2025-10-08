// Ensure event listeners are added after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".submit-btn[onclick='registerUser(event)']").addEventListener("click", registerUser);
    document.querySelector(".submit-btn[onclick='loginUser(event)']").addEventListener("click", loginUser);
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

    try {
        console.log("Sending signup request...");
        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Signup response received:", data);

        if (data.user) {
            alert("Signup Successful! You can now log in.");
            toggleAuth('login'); // Switch to login form after signup
        } else {
            alert(data.error || "Signup failed.");
        }
    } catch (error) {
        console.error("Error:", error);
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

    try {
        console.log("Sending login request...");
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response received:", data);

        if (data.user) {
            alert("Login Successful!");
        } else {
            alert(data.error || "Login failed.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
}
