const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


const app = express();
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', require('./routes/api'));

const port = process.env.PORT || 3131;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

