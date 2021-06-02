const Campground = require('../../config/campground')
const { cloudinary } = require('../cloudinary')
// MapBox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const campground = require('../../config/campground');
const mapBox = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBox})

// Display
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('./campgrounds/index', { campgrounds })
}

// New/Create
module.exports.new = (req, res) => {
    res.render('./campgrounds/new')
}

module.exports.create = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const newcamp = new Campground(req.body.campground);
    // we add on geometry 
    newcamp.geometry = (geoData.body.features[0].geometry)
    // for cloudinary images
    newcamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newcamp.author = req.user._id;
    await newcamp.save()
    console.log(newcamp)
    // create a flash after successfully save the data
    req.flash('success', 'Congratulations! You are successfully made a new camp!')
    res.redirect(`/campgrounds/${newcamp._id}`)
}

// Read/Show
module.exports.show = async (req, res) => {
    // const { id } = req.params
    // NOTE: its populate not populated
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/show', { campground })
}

// Update
module.exports.update = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/edit', { campground })
}

module.exports.updated = async (req, res) => {
    const { id } = req.params
    // if authorize went through then it will run this code
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    // Delete images 
    // NOTE: Pull is how we pull an elements in an arrays
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

// Deletes
module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect(`/campgrounds`)
}