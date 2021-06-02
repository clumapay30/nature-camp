const express = require('express');
// mergeParams: true => this is going to have an access to all id
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor  } = require('../admin/middleware');

//controllers
const reviews = require('../controllers/reviews')

//Reviews Route NOTE: No need full CRUD 
// Use Joi for back end validation
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))
// Delete
router.delete('/:reviewId', isLoggedIn, isReviewAuthor , catchAsync(reviews.deleteReview))

module.exports = router;