const mongoose = require('mongoose');
const Campground = require('../config/campground')
const cities = require('./cities')
const { places, descriptors } = require('./helpers')

// Database
mongoose.connect('mongodb://localhost:27017/nature-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

//
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random = Math.floor(Math.random() * 100);
        const price = Math.floor(Math.random() * 35) + 10;
        const camp = new Campground({
            author: '60b44c44d8cc963964fad5bc',
            location: `${cities[random].city}, ${cities[random].state},`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: `There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.`,
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random].longitude,
                    cities[random].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/nature-camp/image/upload/v1622507969/NatureCamp/hljtxamtupmttahwdkpx.jpg',
                    
                    filename: 'NatureCamp/hljtxamtupmttahwdkpx'
                  },
                  {
                    url: 'https://res.cloudinary.com/nature-camp/image/upload/v1622505768/NatureCamp/nkeqlqjon07ffyhl11cz.jpg',
                    filename: 'NatureCamp/nkeqlqjon07ffyhl11cz'
                  }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
}) 