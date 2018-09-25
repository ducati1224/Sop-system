require("dotenv").config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const errorHandler = require("./handlers/error");
const sopRoutes = require('./routes/sop');
const userRoutes = require("./routes/auth");

app.use(cors());

// Upload setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Routes
app.use('/sop', sopRoutes);
app.use('/user', userRoutes);

// Error handling
app.use(function (req, res, next) {
    let err = new Error("Not Found");
    console.log(err.message, err.name);
    err.status = 404;
    next(err);
});

app.use(errorHandler);

app.listen(3001, function(){
    console.log("Listening on port 3001")
})