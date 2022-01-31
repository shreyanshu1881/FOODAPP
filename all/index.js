require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql2');
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


//for passport:
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

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

app.get('/foods', isLoggedIn, (req, res) => {

    const q = 'select * from foods';
    connection.query(q, (error, results, field) => {
        if (error) throw error;
        res.render('foods/index', { items: results })
    })

});

app.get('/foods/:id', (req, res) => {

    connection.query("SELECT * FROM foods WHERE foods.food_id=?", req.params.id, (error, results, field) => {
            if (error) throw error;


            res.render('foods/show', { infos: results })
        })
        // console.log(req.user)
});


//login
app.get("/login", (req, res) => {
    res.render('login');
})
app.post("/login", passport.authenticate('local-login', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back ,', req.user.first_name.toUpperCase(), '!!');
    const redirectUrl = req.session.returnTo || '/campgrounds';

    res.redirect('/foods');

})

//regiter
app.get("/register", (req, res) => {
    res.render('register');
});
app.post("/register", validateregister, passport.authenticate('local-signup', { failureRedirect: '/register' }), catchAsync(async(req, res, next) => {

    res.redirect('/foods');
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

    res.redirect('/foods');
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