const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const KEY_FILE = './keys.json';

// Helpers to read/write JSON
function readKeys() {
    const raw = fs.readFileSync(KEY_FILE);
    return JSON.parse(raw);
}
function writeKeys(keysObj) {
    fs.writeFileSync(KEY_FILE, JSON.stringify(keysObj, null, 2));
}

// Generate random key
function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 12; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 11) key += '-';
    }
    return key;
}

// Endpoint to generate a key
app.post('/generate', (req, res) => {
    const keysObj = readKeys();
    const newKey = generateRandomKey();
    keysObj.validKeys.push(newKey);
    writeKeys(keysObj);
    res.json({ key: newKey });
});

// Endpoint to validate a key
app.post('/validate', (req, res) => {
    const { key } = req.body;
    const keysObj = readKeys();
    const isValid = keysObj.validKeys.includes(key);
    res.json({ valid: isValid });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
