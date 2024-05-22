/*const db = require('../config/db');

exports.newPost = (req, res) => {

    const { userId, listing_type, price, bedrooms, bathrooms, property_type, 
        address, latitude, longitude, created_at } = req.body;

    let sql = `INSERT INTO post (userId, listing_type, price, bedrooms, bathrooms, property_type, 
        address, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [userId, listing_type, price, bedrooms, bathrooms, property_type, 
        address, latitude, longitude, created_at], (err, result) => {
            if (err) return res.status(500).send("Failed to create post.");
            res.status(201).send({ message: "Post created successfully!" });
        });
};




exports.getPosts = (req, res) => {
    let sql = `SELECT * FROM post WHERE userid = ?`;

    db.query(sql, [req.userId], (err, result) => {
        if (err) return res.status(500).send("Failed to retrieve posts.");
        res.status(200).send(result);
    });
};
*/
