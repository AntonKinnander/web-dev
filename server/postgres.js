const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345', // Like in the lecture note probably fine local also it wouldnt matter unless i use .env sinced its plaintext in this file
    database: 'postgres'
});

// Connect to database
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
    } catch (err) {
        console.error('Connection error', err.stack);
    }
}

// Get all stores (GET / READ)
async function getAllStores() {
    const query = 'SELECT * FROM stores ORDER BY name ASC;';
    try {
        const res = await client.query(query);
        return res.rows;
    } catch (err) {
        console.error('Error fetching stores', err.stack);
    }
}

// Get store by slug
// How to make slug not case sensitive from Stack overflow user Chandu: https://stackoverflow.com/questions/7005302/how-to-make-case-insensitive-query-in-postgresql
async function getStoreBySlug(slug) {
    const query = 'SELECT * FROM stores WHERE LOWER(slug) = LOWER($1);';
    try {
        const res = await client.query(query, [slug]);
        return res.rows[0];
    } catch (err) {
        console.error('Error fetching store', err.stack);
    }
}

// Get random store
async function getRandomStore() {
    const query = 'SELECT * FROM stores ORDER BY RANDOM() LIMIT 1;';
    try {
        const res = await client.query(query);
        return res.rows[0];
    } catch (err) {
        console.error('Error fetching random store', err.stack);
    }
}
// Create new store (POST / CREATE)
async function createStore(storeData) {
    const { name, url, district, description, slug } = storeData;
    const query = `
    INSERT INTO stores (name, url, district, description, slug)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    try {
        const res = await client.query(query, [name, url, district, description, slug]);
        return res.rows[0];
    } catch (err) {
        console.error('Error creating store', err.stack);
        throw err;
    }
}

// Update (PUT / UPDATE)
async function updateStore(id, storeData) {
    const { name, url, district, description, slug } = storeData;
    const query = `
    UPDATE stores
    SET name = $1, url = $2, district = $3, description = $4, slug = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;
    try {
        const res = await client.query(query, [name, url, district, description, slug, id]);
        return res.rows[0];
    } catch (err) {
        console.error('Error updating store', err.stack);
        throw err;
    }
}

// Delete (DELETE)
async function deleteStore(id) {
    const query = 'DELETE FROM stores WHERE id = $1 RETURNING *;';
    try {
        const res = await client.query(query, [id]);
        return res.rows[0];
    } catch (err) {
        console.error('Error deleting store', err.stack);
        throw err;
    }
}

// Disconnect
async function disconnectDB() {
    await client.end();
    console.log('Disconnected from database');
}

module.exports = {
    connectDB,
    getAllStores,
    getStoreBySlug,
    getRandomStore,
    createStore,
    updateStore,
    deleteStore,
    disconnectDB
};