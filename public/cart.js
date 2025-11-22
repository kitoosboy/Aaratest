// ==========================
// Cookie Helper
// ==========================
function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

// Global cart
let cart = [];

// DOM Elements
const cartTableBody = document.getElementById("cart-table-body");
const cartTotalElement = document.getElementById("cart-total");
const subtotalElement = document.getElementById("subtotal");
const cartCountElement = document.getElementById("cart-count");

// ==========================
// Load Cart from Server
// ==========================
async function loadCart() {
    const email = getCookie("user_email");

    if (!email) {
        cartTableBody.innerHTML =
            `<tr><td colspan="4" class="text-center">Please log in to view your cart.</td></tr>`;
        updateCartCount(0);
        cartTotalElement.textContent = "₹0.00";
        subtotalElement.textContent = "₹0.00";
        return;
    }

    try {
        const res = await fetch(`/get-cart?user_email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (!data.success || !Array.isArray(data.cart) || data.cart.length === 0) {
            cart = [];
            cartTableBody.innerHTML =
                `<tr><td colspan="4" class="text-center">Your cart is empty.</td></tr>`;
            updateCartCount(0);
            cartTotalElement.textContent = "₹0.00";
            subtotalElement.textContent = "₹0.00";
            return;
        }

        // Normalize DB → frontend
        cart = data.cart.map(item => ({
            id: item.id,
            product_name: item.product_name,
            product_price: parseFloat(item.product_price),
            product_image: item.product_image,
            quantity: item.quantity
        }));

        renderCart();
    } catch (err) {
        console.error("Error loading cart:", err);
    }
}

// ==========================
// Save Cart to DB
// ==========================
async function saveCartToDB() {
    const email = getCookie("user_email");
    if (!email) return;

    const payload = cart.map(it => ({
        name: it.product_name,
        price: it.product_price,
        image: it.product_image,
        quantity: it.quantity
    }));

    await fetch("/save-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cart: payload })
    });
}

// ==========================
// Add to Cart
// ==========================
document.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", async (e) => {
        e.preventDefault();

        const userEmail = getCookie("user_email");
        if (!userEmail) {
            alert("Please log in to add items to your cart.");
            return;
        }

        const productName = button.dataset.name;
        const productPrice = parseFloat(button.dataset.price);
        const productImage = button.dataset.image;

        try {
            const response = await fetch("/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail,
                    productName,
                    productPrice,
                    productImage,
                    quantity: 1
                })
            });

            if (response.ok) {
                await loadCart();
                alert("Added to cart!");
            } else {
                alert("Could not add to cart.");
            }
        } catch (err) {
            console.error(err);
            alert("Server error adding to cart");
        }
    });
});

// ==========================
// Render Cart UI
// ==========================
function renderCart() {
    const userEmail = getCookie("user_email");

    if (!userEmail) {
        cartTableBody.innerHTML =
            `<tr><td colspan="4" class="text-center">Please log in to view your cart.</td></tr>`;
        return;
    }

    if (!cart.length) {
        cartTableBody.innerHTML =
            `<tr><td colspan="4" class="text-center">Your cart is empty.</td></tr>`;
        updateCartCount(0);
        return;
    }

    cartTableBody.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        const price = item.product_price;
        const subtotal = price * item.quantity;

        total += subtotal;
        count += item.quantity;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="cart_product_img">
                <img src="${item.product_image}" width="80">
            </td>
            <td class="cart_product_desc">
                <h5>${item.product_name}</h5>
            </td>
            <td class="price">
                ₹${price.toFixed(2)}
            </td>
            <td class="qty">
                <div class="quantity">${item.quantity}</div>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    cartTotalElement.textContent = `₹${total.toFixed(2)}`;
    subtotalElement.textContent = `₹${total.toFixed(2)}`;
    updateCartCount(count);
}

// ==========================
// Update Cart Count
// ==========================
function updateCartCount(count) {
    if (cartCountElement) {
        cartCountElement.textContent = `(${count})`;
    }
}

// ==========================
// Init
// ==========================
document.addEventListener("DOMContentLoaded", loadCart);
