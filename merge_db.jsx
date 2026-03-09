const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'public', 'data', 'users.json');
const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
const allowListPath = path.join(__dirname, 'public', 'data', 'AllowList.json');
const dbPath = path.join(__dirname, 'public', 'data', 'db.json');

try {
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const settingsData = fs.existsSync(settingsPath)
        ? JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
        : {};
    const allowListData = fs.existsSync(allowListPath)
        ? JSON.parse(fs.readFileSync(allowListPath, 'utf8'))
        : [];

    const db = {
        users: Array.isArray(usersData?.users) ? usersData.users : [],
        addresses: Array.isArray(usersData?.addresses) ? usersData.addresses : [],
        orders: Array.isArray(usersData?.orders) ? usersData.orders : [],
        allowlist: Array.isArray(usersData?.allowlist)
            ? usersData.allowlist
            : Array.isArray(allowListData)
                ? allowListData
                : [],
        settings: usersData?.settings || settingsData || {},
        content: usersData?.content || {},
        products: Array.isArray(productsData) ? productsData : (productsData.products || [])
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Successfully created normalized db.json');
} catch (err) {
    console.error('Error merging files:', err);
    process.exit(1);
}
