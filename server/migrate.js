const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class Migration {
    client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '12345',
        database: 'postgres'
    });

    stores = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../client/assets/stores.json'))
    );

    async migrate() {
        await this.client.connect();

        for (const store of this.stores) {
            await this.client.query(
                `INSERT INTO stores (name, url, district, description, slug)
                 VALUES ($1, $2, $3, $4, $5)`,
                [store.name, store.url, store.district, store.description, store.slug]
            );
        }

        await this.client.end();
    }
}

new Migration().migrate();