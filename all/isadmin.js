module.exports.isadmin = (req, res, next) => {

    if (req.user.u_role === 'admin') {
        next();

    } else {
        return res.redirect('/foods');

    }
}