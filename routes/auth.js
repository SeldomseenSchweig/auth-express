const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require('../db');
const {BCRYPT_WORK_FACTOR, SECRET_KEY} = require('../config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { ensureLoggedin, ensureAdmin } = require('../middleware/auth')


router.get('/',(req,res,next)=>{

    res.send('app is working');
});

router.post('/register', async (req,res,next)=>{
    try {

        const {username, password } = req.body;
        if(!username || !password){
            throw new ExpressError('Username or password is invalid', 404)

        }
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
        let result = await db.query(`
        INSERT INTO users (username, password) 
        VALUES ($1,$2) 
        RETURNING username`, [username,hashedPassword])

    
        return res.json(result.rows[0]);
        
    } catch (error) {
        if(error.code === '23505'){
           return next(new ExpressError('Username is taken, choose another', 400))

        }
        next(error);
    }

});


    router.post('/login', async (req,res,next)=>{

        try {
            const {username,password} = req.body;
            if(!username || !password){
                throw new ExpressError('Username or password is invalid', 404)
    
            }

            const results = await db.query(`
            SELECT username, password 
            FROM users 
            WHERE username = $1`,[username]);
            const user = results.rows[0];
            if(user){

                if(await bcrypt.compare(password, user.password)){
                    const token = jwt.sign({username}, SECRET_KEY)
        
                    return res.json({msg:"logged in!", token})
                }

            }
            throw new ExpressError("User not found", 400)
            
        } catch (error) {

             return next(error);
            
        }
    });

    router.get('/topsecret', ensureLoggedin,(req,res,next)=>{


        try {
            const token = req.body._token;
            const payload = jwt.verify(token, SECRET_KEY)
            return res.json({payload:payload})

        } catch (error) {
            return next(new ExpressError("You must be logged in first", 404))
        }
    })


    router.get('/private', ensureLoggedin,(req,res,next)=>{
        return res.json({message:`Welcome to private ${req.user.username}`})
    });


    router.get('/adminHome',ensureAdmin, (req,res,next)=>{
        return res.json({msg:`welcome admin ${req.user.username}`});
    } );

    


module.exports = router;