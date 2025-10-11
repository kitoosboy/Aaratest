require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// Initialize PostgreSQL connection pool using environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});


app.use(cors());
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Root Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Signup Route
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "User already exists!" });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully!", user: result.rows[0] });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Internal Server Error. Please try again." });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: "User not found!" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) return res.status(400).json({ error: "Invalid credentials!" });

        res.status(200).json({ message: "Login successful!", user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

pool.connect()
    .then(client => {
        console.log("Connected to PostgreSQL database successfully!");
        client.release(); // Release the client back to the pool
    })
    .catch(err => {
        console.error("Error connecting to PostgreSQL database:", err.message);
    });

    // cart
// Add to Cart Route
app.post("/add-to-cart", async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const existingItem = await pool.query(
            "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
            [userId, productId]
        );

        if (existingItem.rows.length > 0) {
            const newQty = existingItem.rows[0].quantity + quantity;
            await pool.query(
                "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3",
                [newQty, userId, productId]
            );
            return res.json({ message: "Cart updated!" });
        }

        await pool.query(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
            [userId, productId, quantity]
        );

        res.status(201).json({ message: "Product added to cart!" });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});

//form
app.get('/get-user-details/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM user_details WHERE username = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No details found for this user." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Get User Details Error:", error);
        res.status(500).json({ message: "Failed to fetch details." });
    }
});

// Save User Details Route
app.post("/save-user-details", async (req, res) => {
    const {
        username,
        first_name,
        last_name,
        email,
        country,
        address,
        city,
        zip_code,
        phone,
        comment,
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO user_details (username, first_name, last_name, email, country, address, city, zip_code, phone, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (username) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                email = EXCLUDED.email,
                country = EXCLUDED.country,
                address = EXCLUDED.address,
                city = EXCLUDED.city,
                zip_code = EXCLUDED.zip_code,
                phone = EXCLUDED.phone,
                comment = EXCLUDED.comment`,
            [
                username,
                first_name,
                last_name,
                email,
                country,
                address,
                city,
                zip_code,
                phone,
                comment,
            ]
        );

        res.status(200).json({ message: "User details saved successfully." });
    } catch (error) {
        console.error("Save User Details Error:", error);
        res.status(500).json({ error: "Failed to save user details." });
    }
});








// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
