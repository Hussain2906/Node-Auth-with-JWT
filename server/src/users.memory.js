const users = [];

const findUserByEmail = (email)=>{
    return users.find( user => user.email === email);
}

const addUser  = (user) =>{
    users.push(user);
    return user;
}
const getPublicUsers = (user)=>{
    return {
        id: user.id,
        email: user.email
    }
}

module.exports = {
    findUserByEmail,
    addUser,
    getPublicUsers
};

