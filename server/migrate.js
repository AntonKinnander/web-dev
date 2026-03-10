const Store = require("./model/Store");
let storesData = [];

storesData = require("../client/assets/stores.json");


async function migrateData() {
    await Store.connectDB();

    console.log(`Migrating ${storesData.length} stores...`);

    for (const store of storesData) {
        try {
            await Store.createStore(store);
            console.log(`Create: ${store.name}`);
        } catch (err) {
            console.error(`Failed: ${store.name}`, err.message);
        }
    }

    console.log("Migration complete!");
    await Store.disconnectDB();
}

migrateData();