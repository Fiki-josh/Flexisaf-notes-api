require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path")
const {logger, logEvent} = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const connectDb = require("./config/dbConn");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 8000;

connectDb();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require("./routes/root"));

app.use('/auth', require("./routes/authRoutes.js"));

app.use('/users', require("./routes/userRoutes.js"));

app.use('/notes', require("./routes/noteRoutes.js"));

app.all('*', (req,res) => {
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(req.accepts('json')){
        res.json({message: '404 not Found'});
    }else{
        res.type(txt).send("404 not found");
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log("Connected to Db");
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
})
mongoose.connection.on('error', err => {
    console.log(err);
    logEvent(`${err.no}: ${err.code}\t ${err.syscall}\t ${err.hostname}`,'mongoError.log')
})