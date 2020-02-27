var express = require('express');
var cors = require('cors');
var http = require('http');
var bodyParser = require("body-parser");
var path = require('path');
var fileUpload = require('express-fileupload');

var exports = module.exports = {};

exports.initialize = function () {
    // Init express
    this.express = express();

    // allow everything
    var corsOptions = {
        origin: true,
        credentials: true
    };

    // Plugin our cors middleware
    this.express.use(cors(corsOptions));

    // Plugin our file upload middleware
    this.express.use(fileUpload());

    this.express.set('views', __dirname + '/views');
    this.express.set('view engine', 'pug');

    // for parsing application/json
    this.express.use(bodyParser.json({ limit: '50mb' }));
    this.express.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    var port = 55998;
    http.createServer(this.express).listen(port);
    console.log("listening on HTTP on port", port);
};

exports.getExpress = function () {
    return this.express;
};

