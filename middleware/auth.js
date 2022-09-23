const { SECRET_KEY} = require('../config')
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');






function authenticateJWT(req,res, next) {
    try {
    const token = req.body._token;
    const payload = jwt.verify(token , SECRET_KEY);
    req.user = payload;
    console.log("You have a valid token")
    return next()

        
    } catch (error) {
        return next()
        
    }
    
}

function ensureLoggedin(req,res,next) {

    if(!req.user){
        const e =  new ExpressError('unauthorized', 404);
        return next(e)

    }else{
        return next();
    }
        
}

function ensureAdmin(req,res,next) {
    if(!req.user || req.user.type !== 'admin'){
        return next(new ExpressError("Must be admin to go here",401))

    }
    return next()
    
}

module.exports = { authenticateJWT, ensureLoggedin, ensureAdmin };