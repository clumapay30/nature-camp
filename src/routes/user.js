const express = require('express');
const router = express.Router();
const User = require('../../config/user');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')

// Controller
const users = require('../controllers/users')

// Create / register
// router.get('/register', users.renderRegister)

// router.post('/register', catchAsync(users.registered))

// Read / login
// router.get('/login', users.renderLogin)

//passport.authenticate() verify the user if it is registered
// router.post('/login', passport.authenticate('local', {
//     failureFlash: true,
//     failureRedirect: '/login'
// }), users.authenticate)

// // Logout
// router.get('/logout', users.logout)

// fancy way to restructure routes
router.route('/register') // Create / register
    .get(users.renderRegister)
    .post(catchAsync(users.registered))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {
        //passport.authenticate() verify the user if it is registered
        failureFlash: true,
        failureRedirect: '/login'
    }), users.authenticate)

// Logout
router.get('/logout', users.logout)

module.exports = router;

// Test Routes
// app.get('/fakeUser', async(req, res) => {
// 	const user = new User({email: 'christiannn@gmail.com', username: 'chris'});
// 	const newUser = await User.register(user, 'chris');
// 	res.send(newUser);
// })
