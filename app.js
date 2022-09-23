const express = require("express");
const app = express();
const routes = require("./routes/auth.js");
const ExpressError = require("./expressError")
const { authenticateJWT } = require("./middleware/auth")

app.use(express.json());
app.use(authenticateJWT);
app.use("/", routes);

app.use((req,res,next)=>{

    const err = new ExpressError("Not found", 404);
    return next(err)
})


app.use((err,req,res,next)=>{

    let status = err.status || 500;

    return res.status(status).json({

        error:{
            message:err.message,
            status:status
        }


    });
});

module.exports = app;