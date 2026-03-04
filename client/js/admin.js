let stores = [];

// Load stores
async function loadStores() {
    const response = await fetch('/api/admin/stores');
    stores = await response.json();
    renderStores();
}

// Render stores list
function renderStores() {
    const list = document.getElementById('storeList');
    list.innerHTML = stores.map(store => `
    <div>
      <div>
        <h3>${store.name}</h3>
        <p>${store.slug} | ${store.district || 'No district'}</p>
      </div>
      <div>
        <button onclick="editStore(${store.id})">Edit</button>
        <button onclick="deleteStore(${store.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// Reset the form for adding a new store
function resetForm() {
    const title = document.getElementById('groupTitle');
    const form = document.getElementById('storeForm');

    title.textContent = 'Add Store';
    form.reset();
    document.getElementById('storeId').value = '';
}

// Fill the form when editing a store
function fillForm(store) {
    const title = document.getElementById('groupTitle');

    title.textContent = 'Edit Store';
    document.getElementById('storeId').value = store.id;
    document.getElementById('name').value = store.name;
    document.getElementById('url').value = store.url || '';
    document.getElementById('district').value = store.district || '';
    document.getElementById('description').value = store.description || '';
    document.getElementById('slug').value = store.slug;
}

// Edit store
function editStore(id) {
    const store = stores.find(s => s.id === id);
    fillForm(store);
}

// Delete store
async function deleteStore(id) {
    if (!confirm('Are you sure you want to delete this store?')) return;

    await fetch(`/api/admin/stores/${id}`, { method: 'DELETE' });
    loadStores();
}

// Form submit
document.getElementById('storeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('storeId').value;
    const data = {
        name: document.getElementById('name').value,
        url: document.getElementById('url').value || null,
        district: document.getElementById('district').value || null,
        description: document.getElementById('description').value || null,
        slug: document.getElementById('slug').value
    };

    const url = id ? `/api/admin/stores/${id}` : '/api/admin/stores';
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    resetForm();
    loadStores();
});

// Initial load
loadStores();
