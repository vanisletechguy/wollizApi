const db = require('../config/db');
const path = require('path');
const fs = require('fs');

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// newListing  ///////////////////////////
//////////////////////////////////////////////////////////////////////////////
exports.newListing = (req, res) => {
    const { user_id, listing_type, price, bedrooms, bathrooms, property_type, 
        address, latitude, longitude, created_at, square_footage } = req.body;

    let sql = `INSERT INTO listings (user_id, listing_type, price, bedrooms, bathrooms, property_type, address, latitude, longitude, created_at, square_footage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, listing_type, price, bedrooms, bathrooms, property_type, 
        address, latitude, longitude, created_at, square_footage], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).send("Failed to create post.");
        }
        
        const listingId = result.insertId;
        const images = req.files.map(file => ({
            listing_id: listingId,
            //            image_path: path.join('uploads', file.filename),
            image_path: file.location,
            is_featured: false 
        }));

        if (images.length > 0) {
            images[0].is_featured = true; 
        }

        let imageSql = `INSERT INTO listing_images (listing_id, image_path, is_featured) VALUES ?`;
        const imageValues = images.map(image => [image.listing_id, image.image_path, image.is_featured]);

        db.query(imageSql, [imageValues], (err, result) => {
            if (err) {
                console.error("SQL Error:", err);
                return res.status(500).send("Failed to upload images.");
            }
            res.status(201).send({ message: "Post created successfully!", listing: result });
        });
    });
};

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// updateListing  ////////////////////////
//////////////////////////////////////////////////////////////////////////////
exports.updateListing = (req, res) => {
    const { listing_id, user_id, listing_type, price, bedrooms, bathrooms, property_type, 
        address, latitude, longitude, square_footage, delete_image_ids = [] } = req.body;

    let sql = `UPDATE listings SET listing_type = ?, price = ?, bedrooms = ?, bathrooms = ?, property_type = ?, address = ?, latitude = ?, longitude = ? WHERE listing_id = ? AND user_id = ?, square_footage = ?`;
    let params = [listing_type, price, bedrooms, bathrooms, property_type, address, 
        latitude, longitude, listing_id, user_id, square_footage];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).send("Failed to update listing.");
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                listing_id: listing_id,
                //image_path: path.join('uploads', file.filename),
                image_path: file.location,
                is_featured: false 
            }));

            if (newImages.length > 0) {
                newImages[0].is_featured = true; 
            }

            let imageSql = `INSERT INTO listing_images (listing_id, image_path, is_featured) VALUES ?`;
            const imageValues = newImages.map(image => [image.listing_id, image.image_path, image.is_featured]);

            db.query(imageSql, [imageValues], (err, result) => {
                if (err) {
                    console.error("SQL Error:", err);
                    return res.status(500).send("Failed to upload new images.");
                }

                // Remove deleted images from server and database
                if (delete_image_ids.length > 0) {
                    let deleteSql = `DELETE FROM listing_images WHERE image_id IN (?)`;
                    db.query(deleteSql, [delete_image_ids], (err, result) => {
                        if (err) {
                            console.error("SQL Error:", err);
                            return res.status(500).send("Failed to delete images.");
                        }

                        // Delete image files from server
                        delete_image_ids.forEach(image_id => {
                            db.query('SELECT image_path FROM listing_images WHERE image_id = ?', [image_id], (err, results) => {
                                if (err) {
                                    console.error("SQL Error:", err);
                                    return;
                                }

                                const imagePath = results[0]?.image_path;
                                if (imagePath) {
                                    fs.unlink(path.join(__dirname, '..', imagePath), err => {
                                        if (err) {
                                            console.error("Failed to delete image file:", err);
                                        }
                                    });
                                }
                            });
                        });
                    });
                }

                res.status(200).send({ message: "Listing updated successfully!" });
            });
        } else {
            res.status(200).send({ message: "Listing updated successfully!" });
        }
    });
};

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// getAllListings  ///////////////////////
//////////////////////////////////////////////////////////////////////////////
exports.getAllListings = (req, res) => {
    let sql = `SELECT l.*, GROUP_CONCAT(i.image_path ORDER BY i.is_featured DESC SEPARATOR ',') AS images FROM listings l LEFT JOIN listing_images i ON l.listing_id = i.listing_id GROUP BY l.listing_id`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send("Failed to retrieve posts.");
        res.status(200).send(result);
    });
};


//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// getFilteredListings  //////////////////
//////////////////////////////////////////////////////////////////////////////
exports.getFilteredListings = (req, res) => {
    console.log("getting filtered listings");
    const { listingType, minPrice, maxPrice, bedrooms, bathrooms, propertyType, user_id } = req.query;

    let sql = `SELECT l.*, GROUP_CONCAT(i.image_path ORDER BY i.is_featured DESC SEPARATOR ',') AS images FROM listings l LEFT JOIN listing_images i ON l.listing_id = i.listing_id WHERE 1=1`;
    let params = [];

    if (user_id) {
        sql += ` AND user_id = ?`;
        params.push(user_id);
    }


    if (listingType) {
        sql += ` AND listing_type = ?`;
        params.push(listingType);
    }

    if (minPrice) {
        sql += ` AND price >= ?`;
        params.push(minPrice);
    }

    if (maxPrice) {
        sql += ` AND price <= ?`;
        params.push(maxPrice);
    }

    if (bedrooms) {
        sql += ` AND bedrooms = ?`;
        params.push(bedrooms);
    }

    if (bathrooms) {
        sql += ` AND bathrooms = ?`;
        params.push(bathrooms);
    }

    if (propertyType) {
        sql += ` AND property_type = ?`;
        params.push(propertyType);
    }

    sql += ` GROUP BY l.listing_id`;

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).send("Failed to retrieve posts.");
        }
        res.status(200).send(result);
    });
};

