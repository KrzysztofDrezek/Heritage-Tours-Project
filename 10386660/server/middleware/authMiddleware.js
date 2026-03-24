function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "You must be logged in to access this resource"
        });
    }

    next();
}

function requireSameUserOrAdmin(req, res, next) {
    const sessionUser = req.session.user;
    const requestedUsername = req.params.username;

    if (!sessionUser) {
        return res.status(401).json({
            error: "You must be logged in to access this resource"
        });
    }

    if (sessionUser.username !== requestedUsername && sessionUser.role !== "admin") {
        return res.status(403).json({
            error: "You are not allowed to access this user's bookings"
        });
    }

    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "You must be logged in to access this resource"
        });
    }

    if (req.session.user.role !== "admin") {
        return res.status(403).json({
            error: "Admin access only"
        });
    }

    next();
}

module.exports = {
    requireLogin,
    requireSameUserOrAdmin,
    requireAdmin
};