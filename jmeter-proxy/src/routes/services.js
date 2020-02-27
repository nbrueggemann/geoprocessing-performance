const request = require('request');
const fs = require('fs');
const { uuid } = require('uuidv4');

var GeoprocessingTask = require("../application/geoprocessingTask");

module.exports = function(express) {

    express.post('/jmeter/gp', function (req, res) {

        req.setTimeout(10800000); // 3 hours for accounting for very long running gp tools

        var toolParams = parseParamsTextFile(req.files.params.data);
        var toolURL = req.body.gpEndpoint;

        var gpTask = new GeoprocessingTask(null, null);
        gpTask.submitJob(toolURL, toolParams, toolURL).then( (results) =>{
            res.send(results);
        }, (errorMsg) => {
            res.status(500).send(errorMsg);
        });
     
    });

    function parseParamsTextFile(data) {
        var jsonParams = {};

        var dataString = data.toString();
        var stringParams = dataString.split('\r\n');

        stringParams.forEach((item) => {
            var paramParts = item.split(':=');
            jsonParams[paramParts[0]] = paramParts[1];
        });

        return jsonParams;
    }
};
