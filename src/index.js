require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.get('/health', (req, res) => res.send('OK'));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
