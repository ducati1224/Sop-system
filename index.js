const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const sopRoutes = require('./routes/sop');

// Upload setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes
app.use('/sop', sopRoutes)

app.listen(3001, function(){
    console.log("Listening on port 3001")
})