const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'public', 'data', 'users.json');
const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
const allowListPath = path.join(__dirname, 'public', 'data', 'AllowList.json');
const dbPath = path.join(__dirname, 'public', 'data', 'db.json');

try {
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    // We can also include AllowList if needed, but it seems users.json has its own allowlist or they are redundant.
    // Let's stick with the main data.

    const db = {
        ...usersData,
        products: Array.isArray(productsData) ? productsData : (productsData.products || [])
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Successfully created db.json with all fields');
} catch (err) {
    console.error('Error merging files:', err);
    process.exit(1);
}
