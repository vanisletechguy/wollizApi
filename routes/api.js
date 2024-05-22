/*const express = require('express');
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
*/

/*
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname});
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname)
        }
    })
});

*/






const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const listingsController = require('../controllers/listingsController');
const authMiddleware = require('../middleware/authMiddleware');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure multer to use S3 for storage
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname});
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/listings', listingsController.getAllListings);
router.get('/filteredListings', listingsController.getFilteredListings);

// Protected routes
router.use(authMiddleware.verifyToken);
router.post('/listings', upload.array('images', 10), listingsController.newListing);
router.put('/listings/:id', upload.array('images', 10), listingsController.updateListing);

module.exports = router;

