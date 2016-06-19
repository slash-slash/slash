function requireRole(role) {
    return function(req, res, next) {
        if (req.session.user && req.session.user.role === role) {
        	next();
        } else {
        	res.redirect('/articles');
        }
    }
}

module.exports = requireRole;