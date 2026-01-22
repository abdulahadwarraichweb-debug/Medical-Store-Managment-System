// DOM Elements
const excelInput = document.getElementById('excelFile');
const searchInput = document.getElementById('searchInput');
const medicineList = document.getElementById('medicineList');
const cartItemsContainer = document.getElementById('cartItems');
const grandTotalEl = document.getElementById('grandTotal');
const whatsappBtn = document.getElementById('whatsappBtn');
const currentDateEl = document.getElementById('currentDate');

// State
let inventory = [];
let cart = [];

// Initialize Date
currentDateEl.innerText = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
});

// Event Listeners
excelInput.addEventListener('change', handleFileUpload);
searchInput.addEventListener('input', handleSearch);
whatsappBtn.addEventListener('click', shareToWhatsApp);

// 1. Handle File Upload (Excel/CSV)
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        try {
            const workbook = XLSX.read(data, { type: 'array' });

            // Assume first sheet contains data
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Parse to JSON
            const json = XLSX.utils.sheet_to_json(worksheet);

            // Normalize Data Keys (Search for fuzzy matches of 'Name', 'Price')
            inventory = json.map(item => {
                // Find keys that look like 'Name', 'Price', 'Stock'
                const keys = Object.keys(item);
                const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('medicine'));
                const priceKey = keys.find(k => k.toLowerCase().includes('price') || k.toLowerCase().includes('cost'));
                const stockKey = keys.find(k => k.toLowerCase().includes('stock') || k.toLowerCase().includes('qty'));

                return {
                    name: item[nameKey] || 'Unknown Item',
                    price: parseFloat(item[priceKey]) || 0,
                    stock: parseInt(item[stockKey]) || 0
                };
            }).filter(item => item.name !== 'Unknown Item');

            console.log('Loaded Inventory:', inventory);
            renderMedicineList(inventory);

            // Notification (using simple alert for now, or just UI update)
            medicineList.innerHTML = `<div class="empty-state" style="opacity: 1; color: var(--success-color)">
                <i class="fa-solid fa-check-circle"></i>
                <p>Data Loaded Successfully!<br>${inventory.length} medicines found.</p>
            </div>`;
            setTimeout(() => {
                renderMedicineList([]); // Clear success message to show search specific or empty
                searchInput.focus();
            }, 1500);

        } catch (error) {
            console.error('Error parsing excel:', error);
            alert('Error reading file. Please make sure it is a valid Excel or CSV file.');
        }
    };

    reader.readAsArrayBuffer(file);
}

// 2. Search Functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase();

    if (inventory.length === 0) {
        medicineList.innerHTML = `<div class="empty-state">
            <i class="fa-solid fa-upload"></i>
            <p>Please upload a medicine file first.</p>
        </div>`;
        return;
    }

    if (query === '') {
        medicineList.innerHTML = '';
        return;
    }

    const matches = inventory.filter(item =>
        item.name.toLowerCase().includes(query)
    );

    renderMedicineList(matches);
}

// 3. Render Medicine List
function renderMedicineList(items) {
    medicineList.innerHTML = '';

    if (items.length === 0) {
        // Only show "No results" if user has typed something
        if (searchInput.value) {
            medicineList.innerHTML = '<div class="empty-state"><p>No medicines found.</p></div>';
        }
        return;
    }

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'medicine-item';
        el.innerHTML = `
            <div class="med-info">
                <h3>${item.name}</h3>
                <p>Stock: ${item.stock}</p>
            </div>
            <div class="med-price">$${item.price.toFixed(2)}</div>
        `;
        el.addEventListener('click', () => addToCart(item));
        medicineList.appendChild(el);
    });
}

// 4. Cart Logic
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.name === item.name);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({
            ...item,
            qty: 1
        });
    }
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateQty(index, newQty) {
    if (newQty < 1) return;
    cart[index].qty = parseInt(newQty);
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <input type="number" class="receipt-qty-input" value="${item.qty}" min="1" 
                onchange="updateQty(${index}, this.value)">
            </td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });

    grandTotalEl.innerText = `$${total.toFixed(2)}`;
}

// Global functions for inline HTML events
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;

// 5. WhatsApp Sharing
function shareToWhatsApp() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    let message = "*VSpark Pharmacy Receipt*\n";
    message += "----------------\n";

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `${item.name} x${item.qty} = $${itemTotal.toFixed(2)}\n`;
    });

    message += "----------------\n";
    message += `*Total: $${total.toFixed(2)}*\n`;
    message += `Date: ${new Date().toLocaleDateString()}`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encodedMessage}`;

    window.open(url, '_blank');
}
