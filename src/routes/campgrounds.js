const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../admin/middleware.js');
// Multer for uploading files = https://github.com/expressjs/multer
const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
// Cloudinary Storage for images
const { storage } = require('../cloudinary')
const upload = multer({ storage })

//Controllers
const campgrounds = require('../controllers/campgrounds')


// //Display
// router.get('/', catchAsync(campgrounds.index))

// //Create
// router.get('/new', isLoggedIn, campgrounds.new)
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.create))

// //Read/show
// router.get('/:id', catchAsync(campgrounds.show))

// //Update
// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.update))
// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updated))

// //Delete
// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.delete))


// fancy way to restructure routes
// NOTE: Better create crud pattern first and then do this.
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create))
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files)
    //     res.send('It worked!')
    // })

router.get('/new', isLoggedIn, campgrounds.new)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updated))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.update))

module.exports = router;