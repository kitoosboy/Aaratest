document.addEventListener('DOMContentLoaded', () => {
    function searchItems() {
        let input = document.getElementById('search-input').value.toLowerCase();
        let resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = ''; // Clear previous results

        let products = document.querySelectorAll('.product-item'); // Adjust selector based on your product listing

        let found = false;

        products.forEach(product => {
            let productName = product.querySelector('.product-name').textContent.toLowerCase();

            if (productName.includes(input)) {
                product.style.display = 'block'; // Show matching products
                found = true;
            } else {
                product.style.display = 'none'; // Hide non-matching products
            }
        });

        if (!found) {
            resultsContainer.innerHTML = '<p>No products found</p>';
        }
    }

    document.getElementById('search-input').addEventListener('keyup', searchItems);
});
