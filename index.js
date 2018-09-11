const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const sopRoutes = require('./routes/sop');

// Upload setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/sop', sopRoutes)

app.listen(3001, function(){
    console.log("Listening on port 3001")
})