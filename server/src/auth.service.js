const { get } = require('http');
const {findUserByEmail, addUser,getPublicUsers} = require('./users.memory');

const {signinToken} = require('./utils.jwt')

const crypto = require('crypto');

const createUser = ({email, passwordPlain})=>{
    if(findUserByEmail(email)){
        throw new Error(
            'User Already Exists'
        )
    }
    const user = {
        id: crypto.randomUUID(),
        email,
        passwordPlain
    }
    return addUser(user);
}

const verifyLoginUser = ({email,passwordPlain})=>{
    const user = findUserByEmail(email);
    if(!user || user.passwordPlain !== passwordPlain){
        throw new Error(
            'Invalid Credentials, Email or Password is Incorrect.'
        )
    }
    return user;
}

const makeLoginResult = (user)=>{
    const payload = {id: user.id,
        email: user.email}
    const token = signinToken(payload);
    return{
        token,
        publicUser: getPublicUsers(user)
    }
}

module.exports = {
    createUser,
    verifyLoginUser,
    makeLoginResult
}