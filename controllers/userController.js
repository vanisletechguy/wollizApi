const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// login  ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
exports.login = (req, res) => {

    const { email, password } = req.body;
    const sql = 'SELECT password FROM users WHERE email = ?';

    db.query(sql, [email], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error when attempting login' });
        }
        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Error comparing passwords' });
                }
                if (isMatch) {
                    getToken(email, res);
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
};


//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// register  /////////////////////////////
//////////////////////////////////////////////////////////////////////////////
exports.register = (req, res) => {

    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    var sql = `INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`;
    db.query(sql, [firstName, lastName, email, hashedPassword], function(err) {
        if(err) {
            res.send({ message: ("User registration failed! " + err) });
        } else {
            getToken(email, res);
        }
    });
};


//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// getToken  /////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function getToken(email, res) {
	var sql = "SELECT user_id FROM users WHERE email = '" + email + "'";
	var newToken = '';
	db.query(sql, function (err, result) {
		if (err) throw err;
		var userId = result[0].user_id;
		newToken = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
			expiresIn: 86400 // expires in 24 hours
		});
		var addKeyQuery = "UPDATE users SET token = '" + newToken + "' WHERE user_id = " + userId;
		db.query(addKeyQuery, function (err) {
			if(err) throw err;
			res.json({yourToken: newToken, userId: userId, email: email});
		});
	});
}
