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
    rejectUnauthorized: false
  }
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

        // IMPORTANT: set a cookie so frontend can detect logged-in user
        // Adjust cookie options (secure: true) if you run over HTTPS in production
        res.cookie("user_email", user.email, {
            httpOnly: false,   // frontend JS needs to read this cookie
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "Lax"
        });

        // Return success with user object
        res.status(200).json({ message: "Login successful!", user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});



// Google Login Route
app.post("/google-login", async (req, res) => {
  const { email, name } = req.body;

  try {
    if (!email) return res.status(400).json({ error: "Email missing from request" });

    // Check if user already exists
    let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // If new user, create
    if (result.rows.length === 0) {
      result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, "google_auth_user"]
      );
    }

    const user = result.rows[0];
    res.status(200).json({ message: "Google login successful!", user });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ error: "Failed to handle Google login." });
  }
});


// google verification
app.post("/verify-google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "980376587255-gfq843odsd62h1r2svvl9j3gbnno17ef.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;
    res.json({ success: true, name, email });
  } catch (error) {
    console.error(error);
    res.json({ success: false });
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
// ✅ Add item to cart
app.post("/cart/add", async (req, res) => {
    const { userEmail, productName, productPrice, productImage, quantity } = req.body;

    try {
        // Check if item already exists
        const existing = await pool.query(
            "SELECT * FROM cart WHERE user_email = $1 AND product_name = $2",
            [userEmail, productName]
        );

        if (existing.rows.length > 0) {
            // Update quantity
            const newQty = existing.rows[0].quantity + quantity;
            await pool.query(
                "UPDATE cart SET quantity = $1 WHERE user_email = $2 AND product_name = $3",
                [newQty, userEmail, productName]
            );
        } else {
            // Insert new item
            await pool.query(
                `INSERT INTO cart (user_email, product_name, product_price, product_image, quantity)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userEmail, productName, productPrice, productImage, quantity]
            );
        }

        res.status(200).json({ message: "Item added/updated in cart successfully" });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

// ✅ Get all cart items for user
app.get("/cart/:userEmail", async (req, res) => {
    const { userEmail } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM cart WHERE user_email = $1 ORDER BY id DESC",
            [userEmail]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Fetch cart error:", error);
        res.status(500).json({ error: "Failed to load cart" });
    }
});

// ✅ Remove item from cart
app.delete("/cart/:userEmail/:productName", async (req, res) => {
    const { userEmail, productName } = req.params;

    try {
        await pool.query(
            "DELETE FROM cart WHERE user_email = $1 AND product_name = $2",
            [userEmail, productName]
        );
        res.json({ message: "Item removed" });
    } catch (error) {
        console.error("Delete cart item error:", error);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

// 🛒 Save cart item
app.post("/save-cart", async (req, res) => {
    const { email, cart } = req.body;

    if (!email || !cart || !Array.isArray(cart)) {
        return res.status(400).json({ success: false, message: "Invalid data" });
    }

    try {
        // Remove old items for that user before saving
        await pool.query("DELETE FROM user_cart WHERE user_email = $1", [email]);

        // Insert each item
        for (const item of cart) {
            await pool.query(
                `INSERT INTO user_cart (user_email, product_name, price, image, quantity)
                 VALUES ($1, $2, $3, $4, $5)`,
                [email, item.name, item.price, item.image, item.quantity]
            );
        }

        res.json({ success: true, message: "Cart saved successfully" });
    } catch (error) {
        console.error("Error saving cart:", error);
        res.status(500).json({ success: false, message: "Error saving cart" });
    }
});


// 🧾 Fetch cart
app.get("/get-cart", async (req, res) => {
    try {
        const user_email = req.query.user_email;

        if (!user_email) {
            return res.status(400).json({ success: false, message: "Missing user email" });
        }

        const result = await pool.query(
            "SELECT * FROM cart WHERE user_email = $1 ORDER BY created_at DESC",
            [user_email]
        );

        // Return a consistent JSON shape the frontend expects
        res.json({ success: true, cart: result.rows });
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ success: false, error: err.message });
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
