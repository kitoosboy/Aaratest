const cartTableBody = document.getElementById('cart-table-body');
const cartTotalElement = document.getElementById('cart-total');
const subtotalElement = document.getElementById('subtotal');
const cartCountElement = document.getElementById('cart-count');

// Get user email from cookie
function getUserEmail() {
    const match = document.cookie.match(/user_email=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

let cart = [];

// 🧾 Load user's cart from DB
async function loadCart() {
    const email = getUserEmail();
    if (!email) return console.warn("No user logged in");

    const res = await fetch("/get-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
        cart = data.cart || [];
        renderCart();
    }
}

// 💾 Save cart to DB
async function saveCartToDB() {
    const email = getUserEmail();
    if (!email) return console.warn("No user logged in");

    await fetch("/save-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cart })
    });
}

// get cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

document.querySelectorAll(".add-to-cart-btn").forEach(button => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const userEmail = getCookie("user_email");
    if (!userEmail) {
      alert("Please log in to add items to your cart.");
      return;
    }

    const productName = button.getAttribute("data-name");
    const productPrice = parseFloat(button.getAttribute("data-price"));
    const productImage = button.getAttribute("data-image");

    console.log("Sending cart data:", { userEmail, productName, productPrice, productImage });

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

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok) {
        alert("✅ Added to cart!");
      } else {
        alert("❌ Failed to add to cart.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Server error while adding item to cart.");
    }
  });
});

// ✅ Render Cart
async function renderCart() {
    const userEmail = getCookie("user_email");
    if (!userEmail) {
        cartTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Please log in to view your cart.</td></tr>`;
        return;
    }

    // ✅ Fetch cart items from DB
    const res = await fetch(`/get-cart?user_email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();

    if (!data.success || !data.cart || data.cart.length === 0) {
        cartTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Your cart is empty.</td></tr>`;
        cartTotalElement.textContent = "₹0.00";
        subtotalElement.textContent = "₹0.00";
        updateCartCount(0);
        return;
    }

    const cart = data.cart;
    cartTableBody.innerHTML = '';

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        const subtotal = item.product_price * item.quantity;
        total += subtotal;
        count += item.quantity;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="cart_product_img">
                <a href="#"><img src="${item.product_image}" alt="${item.product_name}" width="80"></a>
            </td>
            <td class="cart_product_desc">
                <h5>${item.product_name}</h5>
            </td>
            <td class="price">
                <span>₹${parseFloat(item.product_price).toFixed(2)}</span>
            </td>
            <td class="qty">
                <div class="qty-btn d-flex">
                    <p>Qty</p>
                    <div class="quantity">
                        <input type="number" class="qty-text" value="${item.quantity}" readonly>
                    </div>
                </div>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    cartTotalElement.textContent = `₹${total.toFixed(2)}`;
    subtotalElement.textContent = `₹${total.toFixed(2)}`;
    updateCartCount(count);
}

function updateCartCount(count) {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = `(${count})`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
}

document.addEventListener('DOMContentLoaded', renderCart);

function attachQuantityEvents() {
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = e.currentTarget.dataset.index;
            cart[index].quantity++;
            renderCart();
            saveCartToDB();
        });
    });

    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = e.currentTarget.dataset.index;
            if (cart[index].quantity > 1) cart[index].quantity--;
            else cart.splice(index, 1);
            renderCart();
            saveCartToDB();
        });
    });
}

// 🛍️ Add-to-Cart button click
document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const image = btn.dataset.image;

        const existing = cart.find(item => item.name === name);
        if (existing) existing.quantity++;
        else cart.push({ name, price, image, quantity: 1 });

        renderCart();
        saveCartToDB();
    });
});

document.addEventListener("DOMContentLoaded", loadCart);
