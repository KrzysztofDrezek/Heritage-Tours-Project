const usersDao = require("../dao/usersDao");

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: "username and password are required"
            });
        }

        const user = await usersDao.getUserByUsername(username);

        if (!user || user.password !== password) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.isAdmin === 1 ? "admin" : "user"
        };

        res.json({
            message: "Login successful",
            user: req.session.user
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Login failed" });
    }
}

function getCurrentUser(req, res) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Not logged in"
        });
    }

    res.json({
        user: req.session.user
    });
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                error: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");
        res.json({
            message: "Logout successful"
        });
    });
}

module.exports = {
    login,
    getCurrentUser,
    logout
};