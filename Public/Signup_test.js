async function testSignup() {
    const testUser = {
        username: "TestUser",
        email: "testuser@example.com",
        password: "Test@123"
    };

    try {
        console.log("Sending test signup request...");

        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
        });

        const data = await response.json();
        console.log("Response received:", data);

        if (response.ok) {
            alert("✅ Signup Test Successful: " + data.message);
        } else {
            alert("❌ Signup Test Failed: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Signup request failed. Check the backend.");
    }
}

// Call the function to test
testSignup();
