require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql2');
// const mysql2 = require('mysql2/promise');
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
const { isadmin } = require('./isadmin');
const guest = require('./isguestMiddleware');

const passportConfig = require('./config/passport');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
// const MySQLStore = require('express-mysql-session')(session);




const { userResponse, validateUser, secret } = require('./config/passport');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

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

app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));



//sql connection with nodejs



const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


// var options = {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// };


const sessionConfig = {
    key: 'session_cookie_name',
    secret: 'secret',
    resave: false,

    // store: sessionStore,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(function(req, res, next) {
    res.locals.session = req.session;
    res.locals.user = req.session.user;

    next();
});


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

app.get('/foods', (req, res) => {

    const q = 'select * from foods WHERE food_status=1';
    connection.query(q, (error, results, field) => {
        if (error) throw error;
        res.render('foods/index', { items: results })
    })

});
app.get('/cart', (req, res) => {
    res.render('customer/cart', { user: req.user })

});

// const cart = require('../all/views/cart')
function cartController() {
    return {
        update(req, res) {
            // let cart = {
            //     items: {
            //         pizzaId: { item: pizzaObject, qty:0 },
            //         pizzaId: { item: pizzaObject, qty:0 },
            //         pizzaId: { item: pizzaObject, qty:0 },
            //     },
            //     totalQty: 0,
            //     totalPrice: 0
            // }
            // for the first time creating cart and adding basic object structure
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }
            let cart = req.session.cart

            // Check if item does not exist in cart 
            if (!cart.items[req.body.food_id]) {
                cart.items[req.body.food_id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.unit_price
            } else {
                cart.items[req.body.food_id].qty = cart.items[req.body.food_id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.unit_price
            }

            return res.json({ totalQty: req.session.cart.totalQty })
        }
    }
}
app.post('/update-cart', cartController().update)
    // app.get('/foods/add-to-cart/:id', (req, res) => {

//     connection.query("SELECT * FROM foods WHERE foods.food_id=?", req.params.id, (error, results, field) => {
//             if (error) throw error;


//             res.render('foods/show', { infos: results })
//         })
//         // console.log(req.user)
// });
var moment = require('moment');
app.get('/customerorders', isLoggedIn, (req, res) => {

    const q = 'select * from orders WHERE user_id = ? ORDER BY date_time DESC';

    connection.query(q, [req.user.user_id], (error, results, field) => {
        if (error) throw error;

        res.render('customer/customerorders', { orders: results, moment: moment })
    })

});
var orderid = [];
var orderidvalue;
app.post('/orders', isLoggedIn, (req, res) => {
    var insertQuery = "INSERT INTO orders ( user_id,total_price,payment_type,delivery_address,phone_no,customer_name) values (?,?,?,?,?,?)";

    connection.query(insertQuery, [req.user.user_id, Number(JSON.stringify(req.session.cart.totalPrice)), req.body.paymentType, req.body.address, req.body.phone, req.user.first_name], function(err, results) {
        if (err) throw err;


    });


    var insertQuery = "INSERT INTO order_food_items ( order_id,food_id,quantity,item_price) values ((SELECT order_id from orders WHERE user_id=? order by date_time desc limit 1),?,?,?)";
    for (const element in req.session.cart.items) {
        const obj = req.session.cart.items[element];

        let price = obj.qty * obj.item.unit_price;


        connection.query(insertQuery, [req.user.user_id, obj.item.food_id, obj.qty, price],
            function(err, results) {
                if (err) throw err;


            });
    }


    req.flash('success', 'Order Placed Successfully!!');

    delete req.session.cart;
    res.redirect('/customerorders')
})


//admin routes
app.get('/admin/orders', isLoggedIn, isadmin, (req, res) => {
    // const q = 'select i.order_id as order_id,o.total_price as total_price,o.date_time as date_time,o.payment_type as payment_type,o.customer_name as customer_name,f.food_name as food_name,i.quantity as food_quantity,o.delivery_address as delivery_address,o.phone_no as phone_no from orders o INNER JOIN order_food_items i ON o.order_id = i.order_id INNER JOIN foods f ON i.food_id=f.food_id WHERE o.order_status !=? ORDER BY date_time DESC';
    const q = 'select * from orders WHERE order_status !=? ORDER BY date_time DESC ';
    connection.query(q, ['completed'], (error, results, field) => {
        if (error) throw error;
        const q = 'select i.order_id as order_id,o.total_price as total_price,o.date_time as date_time,o.payment_type as payment_type,o.customer_name as customer_name,f.food_name as food_name,i.quantity as food_quantity,o.delivery_address as delivery_address,o.phone_no as phone_no from orders o INNER JOIN order_food_items i ON o.order_id = i.order_id INNER JOIN foods f ON i.food_id=f.food_id WHERE o.order_status !=? ORDER BY date_time DESC';
        connection.query(q, ['completed'], (error, ans, field) => {
            if (error) throw error;

            res.render('admin/adminorders', { orders: results, moment: moment, foods: ans })


        })
    })



})

app.post('/admin/order/status', isLoggedIn, isadmin, (req, res) => {

    const q = 'UPDATE orders SET order_status = ? WHERE order_id =?';

    connection.query(q, [req.body.status, req.body.orderId], (error, results, field) => {
        if (error) throw error;




    })
    res.redirect('/admin/orders');
})

// -------------------------------------------------------------------adminfoodroutes

app.get('/admin/foods', isLoggedIn, isadmin, async(req, res) => {
    const q = 'select * from foods';
    connection.query(q, (error, results, field) => {
        if (error) throw error;
        res.render('admin/index', { foods: results })
    })
});

app.get('/admin/foods/new', isLoggedIn, isadmin, (req, res) => {
    res.render('admin/new');
});
app.post('/admin/foods', async(req, res) => {
    var insertQuery = "INSERT INTO foods ( category,food_name,food_type,img_url,unit_price,food_status) values (?,?,?,?,?,?)";

    connection.query(insertQuery, [req.body.category, req.body.food_name, req.body.food_type, req.body.img_url, req.body.unit_price, req.body.food_status], function(err, results) {
        if (err) throw err;
        res.redirect('/admin/foods');

    });

});


app.get('/admin/food/:id', isLoggedIn, isadmin, async(req, res) => {
    const { id } = req.params;
    const q = 'select * from foods WHERE food_id = ?';
    connection.query(q, [id], (error, results, field) => {
        if (error) throw error;

        res.render('admin/show', { food: results[0] })
    })

});

app.get('/admin/food/:id/edit', isLoggedIn, isadmin, async(req, res) => {
    const { id } = req.params;
    const q = 'select * from foods WHERE food_id = ?';
    connection.query(q, [id], (error, results, field) => {

        if (error) throw error;
        res.render('admin/edit', { food: results[0] });
    })


});


app.put('/admin/food/:id', isLoggedIn, isadmin, async(req, res) => {
    const { id } = req.params;
    const q = 'UPDATE foods SET category=?,food_name=?,food_type=?,img_url=?,unit_price=?,food_status=? WHERE food_id =?';

    connection.query(q, [req.body.category, req.body.food_name, req.body.food_type, req.body.img_url, req.body.unit_price, req.body.food_status, id], (error, results, field) => {
        if (error) throw error;




    })

    res.redirect(`/admin/food/${id}`);
});

app.delete('/admin/food/:id', isLoggedIn, isadmin, async(req, res) => {
    const q = 'DELETE FROM foods WHERE food_id=?;';
    connection.query(q, [req.params._id], (error, results, field) => {
        if (error) throw error;

    })
    res.redirect('/admin/foods');
});














const _getRedirectUrl = (req) => {
        return req.user.u_role === 'admin' ? '/admin/orders' : '/foods'
    }
    //login
app.get("/login", guest, (req, res) => {
    res.render('login');
})
app.post("/login", passport.authenticate('local-login', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back ,', req.user.first_name.toUpperCase(), '!!');
    const redirectUrl = req.session.returnTo || '/foods';

    res.redirect(_getRedirectUrl(req));

})

//regiter
app.get("/register", guest, (req, res) => {
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


// app.get("/adminregister", (req, res) => {

//     res.render('admin/adminRegister');
// });
// app.post("/adminregister", validateregister, passport.authenticate('local-adminsignup', { failureRedirect: '/adminregister' }), catchAsync(async(req, res, next) => {

//     res.redirect('/foods');
// }));



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