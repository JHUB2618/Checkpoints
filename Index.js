const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const KEY_FILE = './keys.json';
const KEY_LIFETIME = 4 * 60 * 60 * 1000; // 4 hours in ms

// Helpers
function readKeys() {
    const raw = fs.readFileSync(KEY_FILE);
    return JSON.parse(raw);
}

function writeKeys(keysObj) {
    fs.writeFileSync(KEY_FILE, JSON.stringify(keysObj, null, 2));
}

function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 12; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 11) key += '-';
    }
    return key;
}

// Clean expired keys
function cleanExpiredKeys() {
    const keysObj = readKeys();
    const now = Date.now();
    keysObj.validKeys = keysObj.validKeys.filter(k => k.expiresAt > now);
    writeKeys(keysObj);
}

// Generate a new key
app.post('/generate', (req, res) => {
    cleanExpiredKeys();
    const keysObj = readKeys();
    const newKey = generateRandomKey();
    const expiresAt = Date.now() + KEY_LIFETIME;
    keysObj.validKeys.push({ key: newKey, expiresAt });
    writeKeys(keysObj);
    res.json({ key: newKey, expiresAt });
});

// Validate a key
app.post('/validate', (req, res) => {
    cleanExpiredKeys();
    const { key } = req.body;
    const keysObj = readKeys();
    const isValid = keysObj.validKeys.some(k => k.key === key);
    res.json({ valid: isValid });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
