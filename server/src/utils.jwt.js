//jwt initialization
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ux3K1FesV+Y=' 

const signinToken = (payload) =>{
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});

}

const verifyToken = (token) =>{
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = {
    signinToken,
    verifyToken
}