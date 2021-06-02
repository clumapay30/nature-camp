if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./src/utils/ExpressError')
const methodOverride = require('method-override');

//helmet
const helmet = require("helmet");
//Passport
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./config/user')

//  mongo injection
const mongoSanitize = require('express-mongo-sanitize');

// passport user routes
const userRoutes = require('./src/routes/user')
//Breaking routes to separate file
const campgrounds = require('./src/routes/campgrounds')
const reviews = require('./src/routes/reviews');
const { contentSecurityPolicy } = require('helmet');


// Database
mongoose.connect('mongodb://localhost:27017/nature-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    // if received deprecationWarning
    // use this:     
    useFindAndModify: false
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })






// For template
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/components'))


// docs: http://www.passportjs.org/
app.use(methodOverride('_method'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
// For javascript and css file
app.use(express.static(path.join(__dirname, 'src/assets')))
//mongo injection
app.use(mongoSanitize({
    replaceWith: 'please-dont!-',
}));

// express session
const sessionConfig = {
    name: 'session',
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //unhide this once it deploy
        // httpOnly for extra security
        // if the http only flag is included in the http response header, the cookie cannot be accessed through client side script
        // Even if a cross-site scripting (XSS) flaw exist, and a user accidentally accessed a link that exploits this flaw the browser will not reveal the cookie to a third party.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
        // 1000 milliseconds in a second
        // 60 seconds in a minute
        // 60 minutes in an hour
        // 24 hours in a day
        // 7 days in a week
    }
}
app.use(session(sessionConfig))
// Flash 
// for alerting errors 
app.use(flash())


//express.js security ::: Helmet
app.use(helmet());

const scriptSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: [ "'self'", "'unsafe-inline'",...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/nature-camp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



// passport initialize
// NOTE: Make sure that session() is use before passport.session()
app.use(passport.initialize());
app.use(passport.session());
//NOTE: we can add multiple strategy at once
passport.use(new LocalStrategy(User.authenticate()));
// serializeUser means how do we store data in the session
// deserializeUser means how do you get user out of that sessionss
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middlewarres
// Flash - Global 
app.use((req, res, next) => {
    // console.log(req.session)
    console.log(req.query)
    res.locals.user = req.user; // this is for showing login, logout and register. Note: this needs to run after the passport is called
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// User routes
// Test Routes
// app.get('/fakeUser', async(req, res) => {
// 	const user = new User({email: 'christiannn@gmail.com', username: 'chris'});
// 	const newUser = await User.register(user, 'chris');
// 	res.send(newUser);
// })

// routes
app.get('/', (req, res) => {
    res.render('campgrounds/home')
})

app.use('/', userRoutes)
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews)

//Error handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

//Port
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('listening to port', port)
})