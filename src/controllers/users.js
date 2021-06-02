const User = require('../../config/user');

module.exports.renderRegister = (req, res) => {
    // res.send('it worked')
    res.render('auth/register')
}

module.exports.registered = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registered = await User.register(user, password)
        req.login(registered, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Nature Camp!');
            res.redirect('/campgrounds');
        })

    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('auth/login')
}

module.exports.authenticate = (req, res) => {
    req.flash('success', 'Welcome to Nature Camp');
    //if the user click the page but its not signed in. Then when the user signed in it will redirect to the url they want to go.
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}


module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye! :(')
    res.redirect('/campgrounds')
}