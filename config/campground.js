const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

//res.cloudinary.com/nature-camp/image/upload/v1622581425/NatureCamp/sagyzibewsgp3gs8cvsb.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } }; // Vrituals in JSON.
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do '{ geometry: {type: String}}'
            enum: ['Point'], // 'location.type' must be 'POINT'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    //For specific review
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // New Schema for reviews
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
            // ref: means from review model
        }
    ],
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <h4><b>Campground</b></h4>
    <strong><a href="/campgrounds/${this._id}" style="text-decoration: none; color: blue">${this.title}</a></strong>
    <p>${this.description.substring(0, 60)}</p>
    `
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)