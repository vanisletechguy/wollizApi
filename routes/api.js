const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const listingsController = require('../controllers/listingsController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/listings', listingsController.getAllListings);
router.get('/filteredListings', listingsController.getFilteredListings);

router.use(authMiddleware.verifyToken);
router.post('/listings', upload.array('images', 10), listingsController.newListing);
router.put('/listings/:id', upload.array('images', 10), listingsController.updateListing);

module.exports = router;

