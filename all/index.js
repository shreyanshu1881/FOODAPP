require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql');
const faker = require('faker');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { registerSchema } = require('./schemas');
const { isLoggedIn } = require('./isloggedinMiddleware');

const passportConfig = require('./config/passport');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');

const { userResponse, validateUser, secret } = require('./config/passport');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

passportConfig(passport);
//strategy for passport
// const localStrategy = require('passport-local').Strategy;

const path = require('path');
const { query } = require('express');

//for layouts
app.engine('ejs', ejsMate);
//setting ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));



//sql connection with nodejs
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});


const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    })
    //for passport:
app.use(passport.initialize());
app.use(passport.session());

const validateregister = (req, res, next) => {

    const { error } = registerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')

        throw new ExpressError(msg, 400);

    } else {
        next();
    }

};



// sql query demo
// const q = 'select curdate()';
// connection.query(q, (error, results, field) => {
//     if (error) throw error;
//     console.log(results);
// })



app.get('/', (req, res) => {
    res.render('home')
});

app.get('/restaurants', isLoggedIn, (req, res) => {

    const q = 'select * from restaurants';
    connection.query(q, (error, results, field) => {
        if (error) throw error;
        res.render('restaurant/index', { items: results })
    })

});

app.get('/restaurants/:id', (req, res) => {

    connection.query("SELECT * FROM restaurants INNER JOIN food_items ON restaurants.resto_id=food_items.resto_id WHERE restaurants.resto_id=? ORDER BY category_id;", req.params.id, (error, results, field) => {
            if (error) throw error;


            res.render('restaurant/show', { infos: results })
        })
        // console.log(req.user)
});


//login
app.get("/login", (req, res) => {
    res.render('login');
})
app.post("/login", passport.authenticate('local-login', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back !!')
    res.redirect('/restaurants');

})

//regiter
app.get("/register", (req, res) => {
    res.render('register');
});
app.post("/register", validateregister, passport.authenticate('local-signup', { failureRedirect: '/register' }), catchAsync(async(req, res, next) => {

    res.redirect('/restaurants');
}));
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'goodbye');
    res.redirect('/');

});


app.get("/adminregister", (req, res) => {

    res.render('admin/adminRegister');
});
app.post("/adminregister", validateregister, passport.authenticate('local-adminsignup', { failureRedirect: '/adminregister' }), catchAsync(async(req, res, next) => {

    res.redirect('/restaurants');
}));



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Somethig Went Wrong!!'
    res.status(statusCode).render('error', { err });

});


app.listen(8080, () => {
    console.log('listening on port 8080')
});