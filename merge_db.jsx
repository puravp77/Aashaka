const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'public', 'data', 'users.json');
const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
const allowListPath = path.join(__dirname, 'public', 'data', 'AllowList.json');
const dbPath = path.join(__dirname, 'public', 'data', 'db.json');

try {
    const existingDb = fs.existsSync(dbPath)
        ? JSON.parse(fs.readFileSync(dbPath, 'utf8'))
        : {};
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const settingsData = fs.existsSync(settingsPath)
        ? JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
        : {};
    const allowListData = fs.existsSync(allowListPath)
        ? JSON.parse(fs.readFileSync(allowListPath, 'utf8'))
        : [];

    const db = {
        users: Array.isArray(usersData?.users)
            ? usersData.users
            : Array.isArray(existingDb?.users)
                ? existingDb.users
                : [],
        addresses: Array.isArray(usersData?.addresses)
            ? usersData.addresses
            : Array.isArray(existingDb?.addresses)
                ? existingDb.addresses
                : [],
        orders: Array.isArray(usersData?.orders)
            ? usersData.orders
            : Array.isArray(existingDb?.orders)
                ? existingDb.orders
                : [],
        allowlist: Array.isArray(usersData?.allowlist)
            ? usersData.allowlist
            : Array.isArray(allowListData)
                ? allowListData
                : Array.isArray(existingDb?.allowlist)
                    ? existingDb.allowlist
                    : [],
        settings: usersData?.settings || settingsData || existingDb?.settings || {},
        content: usersData?.content || existingDb?.content || {},
        products: Array.isArray(productsData)
            ? productsData
            : Array.isArray(productsData?.products)
                ? productsData.products
                : Array.isArray(existingDb?.products)
                    ? existingDb.products
                    : [],
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Successfully created normalized db.json');
} catch (err) {
    console.error('Error merging files:', err);
    process.exit(1);
}
