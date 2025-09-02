const { createUser, verifyLoginUser, makeLoginResult } = require('./auth.service');
const { getPublicUsers } = require('./users.memory');

const { verifyToken } = require('./utils.jwt');

const COOKIE_NAME = "session";
const COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax", secure: false, path: "/" };


const handleSignup = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const newUser = await createUser({ email, passwordPlain: password });
        const { token, publicUser } = makeLoginResult(newUser);
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        return res.status(201).json({ user: publicUser });
    } catch (err) {
        return res.status(400).json({
            error: err.message
        });
    }
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).send('Email is Required');
    } else if (!password) {
        return res.status(400).send('Password is Required');
    }
    try {
        const user = await verifyLoginUser({ email, passwordPlain: password })
        const { token, publicUser } = makeLoginResult(user);
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        return res.status(201).json({ user: publicUser });
    } catch (err) {
        return res.status(401).json({ error: err.message });

    }
}

const handleMe = async (req, res) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        return res.status(401).send(`Unauthorized, Token Not Found ${token}`);
    }
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).send('Unauthorized, Invalid Token');
    }
    return res.status(200).json({ user: payload })


}

const handleLogout = async (req, res) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(200).send('Logged Out Successfully');
}


module.exports = {
    handleSignup,
    handleLogin,
    handleMe,
    handleLogout
}