var Promise = require("bluebird");
var request = require('request');
const fs = require('fs');

class GeoprocessingTask {
	constructor(certPath, keyPath) {
        this.keyPath = keyPath;
        this.certPath = certPath;
	}

    submitJob (toolName, params, url) {
        console.log("Starting " + toolName);

        return new Promise((resolve, reject) => {
            var submitJobUrl = url + "/submitJob";
            params.f = "json";

            const options = {
                url: submitJobUrl,
                form: params,
                jar: true,
                rejectUnauthorized: false,
                followRedirect: true,
                followAllRedirects: true,
                headers:{  
                    "content-type": "application/json",
                }
            };

            if(this.certPath && this.keyPath) {
                options.key = fs.readFileSync(this.keyPath);
                options.cert = fs.readFileSync(this.certPath);
            }

            request.post(options, 
                (error, response, body) => {
                    if(error) {
                        reject(error.message);
                    } else {
                        var jobId = "";
                        // Get the job jobId
                        try {
                            body = JSON.parse(body);
                            jobId = body.jobId;
                        } catch (e) {

                        }

                        // Start polling to see if the job gp task is complete.
                        var interval = setInterval( () => {
                            this._isJobComplete(toolName, url, jobId).then( (result) => {
                                if(result.isComplete === true) {
                                    clearInterval(interval);

                                    // Get the results from the server
                                    this._getAllResults(url, result.results, jobId).then( (allResults) => {
                                        resolve({
                                            jobId: jobId,
                                            results: allResults
                                        });
                                    });
                                }
                            }, (error) => {
                                clearInterval(interval);
                                reject(error);
                            });
                        }, 1000);
                    }
            });
        });
    }

    _isJobComplete (toolName, url , jobId) {
        return new Promise((resolve, reject) => {
            url = url + "/jobs/" + jobId + "?f=json";

            const options = {
                url: url,
                jar: true,
                rejectUnauthorized: false,
                followRedirect: true,
                followAllRedirects: true,
                headers:{  
                    "content-type": "application/json",
                }
            };

            if(this.certPath && this.keyPath) {
                options.key = fs.readFileSync(this.keyPath);
                options.cert = fs.readFileSync(this.certPath);
            }

            request.post(options, 
                (error, response, body) => {
                    if (error) {
                        reject(error.message);
                    }
                    else {
                        try {
                            var resultJSON = JSON.parse(body);

                            if(resultJSON.error){
                                console.log(resultJSON.error);
                                reject(resultJSON.error);
                            } else {
                                if(resultJSON.jobStatus === "esriJobSucceeded") {
                                    console.log("Complete");
                                    resolve({isComplete: true, results: resultJSON.results});
                                } else if(resultJSON.jobStatus === "esriJobFailed") {
                                    console.log(resultJSON.messages);
                                    reject(resultJSON.messages);
                                } else {
                                    //console.log(toolName + " is running...");
                                    resolve({isComplete: false});
                                }
                            }
                            
                        } catch(err) {
                            
                        }
                        
                    }
            });
        });
    }

    _getAllResults (url, paramURLs, jobId) {
        return new Promise((resolve, reject) => {

            var promises = [];
            var results = {};

            for (var prop in paramURLs) {
                if (paramURLs.hasOwnProperty(prop)) {
                    var promise = this._getResult(url, prop, jobId).then( (paramResult) => {
                        results[paramResult.paramName] = paramResult.value;
                    });
                    promises.push(promise);
                }
            }

            Promise.all(promises).then( () => {
                resolve(results);
            });
        });
    }

    _getResult (url, paramUrl, jobId) {
        return new Promise((resolve, reject) => {
            url = url + "/jobs/" + jobId + "/results/" + paramUrl + "?f=json";

            const options = {
                url: url,
                jar: true,
                rejectUnauthorized: false,
                followRedirect: true,
                followAllRedirects: true,
                headers:{  
                    "content-type": "application/json",
                }
            };

            if(this.certPath && this.keyPath) {
                options.key = fs.readFileSync(this.keyPath);
                options.cert = fs.readFileSync(this.certPath);
            }

            request.post(options, 
                (error, response, body) => {
                    var resultJSON = JSON.parse(body);
                    resolve(resultJSON);
            });
        });
    }


} // end class

module.exports = GeoprocessingTask;