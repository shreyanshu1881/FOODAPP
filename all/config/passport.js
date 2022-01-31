// config/passport.js

// load all the things we need
const bcrypt = require('bcryptjs');
var LocalStrategy = require('passport-local').Strategy;

var mysql = require('mysql2');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
});

connection.query('USE food_app');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(email, done) {
        connection.query("select * from users where email = ?", email, function(err, results, field) {
            done(err, results[0]);
        });
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("select * from users where email = ?", [email], function(err, results, field) {
                console.log(results);
                console.log("above row object");
                if (err)
                    return done(err);
                if (results.length) {
                    return done(null, false, req.flash('error', 'That email is already taken.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUserMysql = new Object();

                    newUserMysql.email = email;
                    // newUserMysql.phone_no = phone_no;
                    // newUserMysql.default_address = default_address;
                    // newUserMysql.first_name = first_name;
                    // newUserMysql.last_name = last_name;
                    bcrypt.genSalt(10, function(err, salt) {
                        if (err) return next(err);
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                            if (err) return next(err);
                            newUserMysql.password = hash; // Or however suits your setup
                            // Store the user to the database, then send the response
                            var insertQuery = "INSERT INTO users ( first_name,last_name,email, pass,phone_no,default_address ) values (?,?,?,?,?,?)";

                            connection.query(insertQuery, [req.body.first_name, req.body.last_name, newUserMysql.email, newUserMysql.password, req.body.phone_no, req.body.default_address], function(err, results) {
                                if (err) throw err;
                                newUserMysql.id = results.insertId;

                                return done(null, newUserMysql);
                            });
                        });
                    });
                    // const hash = await bcrypt.hashSync(password, 10);
                    // newUserMysql.password = password // use the generateHash function in our user model


                }
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            connection.query("SELECT * FROM users WHERE email = ? ", [email], function(err, rows) {
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('error', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                bcrypt.compare(req.body.password, rows[0].pass, function(err, res) {
                    if (err) { return done(err); }
                    if (res === false) {
                        return done(null, false, req.flash('error', 'Oops! Wrong password.'));
                    } else {
                        return done(null, rows[0]);
                    }
                });

                // if the user is found but the password is wrong
                // if (!(rows[0].password == password))
                //     return done(null, false, req.flash('error', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // // all is well, return successful user
                // return done(null, rows[0]);

            });



        }));

};