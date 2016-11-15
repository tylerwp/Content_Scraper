(function () {

    "use strict";


    var fs = require('fs');
    var json2csv = require('json2csv');
    // https://www.npmjs.com/package/json2csv
    // I chose json2csv as it was well documented and as of 3.7.1 it was recently updated.

    var Xray = require('x-ray');
    // https://www.npmjs.com/package/x-ray
    // After trying several others and running into issues I found x-ray to work and do what was needed and was also pleased to see many stars on Github for it.


    /**
    * Create error log then write error to log file.
    *
    * @param {String} errorMessage - Error message to log in the file. 
    * 
    */
    function Logerrors(errorMessage) {

        var now = new Date();

        var message = '[' + now.toString() + '] ' + errorMessage + ' \r\n';
        fs.appendFile('./scraper-error.log', message, function (err) {
            if (err) {
                console.log(err.message);
            }
        });

    }


    /**
    * Formats results from contentScraper function into JSON.
    *
    * @param {Array} result - An Array of Objects from Xray scraper. 
    * 
    */
    function resultsJSONFormatter(result) {

        var json = [];

        // Title, Price, ImageURL, URL and Time
        result.forEach(function (entry) {

            entry.title = entry.title.replace(entry.price, '').trim(); // remove price from title
            var now = new Date();
            entry.date = now.toString(); // add date to object
            //{name: name, goals: goals[name]}
            json.push({ 'Title': entry.title, 'Price': entry.price, 'ImageURL': entry.image, 'URL': entry.url, 'Time': entry.date });
        });
        return json;
    }



    /**
    * Creates a CSV file and save it to a folder titled data.
    *
    * @param {Array} result - An Array of Objects from Xray scraper. 
    * 
    */
    function createCSV(result) {

        // create new CSV with date name. eg. 2016-01-29.csv
        // https://www.npmjs.com/package/json2csv - https://github.com/zemirco/json2csv
        var today = new Date();

        var filename = today.getFullYear().toString() + '-' + today.getMonth().toString() + '-' + today.getDate().toString() + '.csv';


        // reorder results and convert to JSON object
        var JSONresults = resultsJSONFormatter(result);
        // write to CSV file
        var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
        var csv = json2csv({ data: JSONresults, fields: fields });

        fs.writeFile('data/' + filename, csv, 'utf8', function (err) {
            if (err) {
                console.log(err.message);
                Logerrors(err.message);
            } else {
                console.log('file saved');
            }
        });

        // save/overwite csv file.

    }


    /**
    * Check for data folder, create folder if it doesn't already exist.
    *
    * @param {String} directory - path to folder.
    * @param {Function} callback  
    */
    function checkDirectory(directory, callback) {
        fs.stat(directory, function (err) {
            //Check if error defined and the error is ENOENT (No such file or directory)
            if (err && err.code === 'ENOENT') {
                //Create the directory, call the callback.
                fs.mkdir(directory, callback);
            } else {
                //just in case there was a different error:
                callback(err);
                Logerrors(err.message);
            }
        });
    }



    /**
    * Scrapes the content of shirts4mike.com and creates a CSV file from the results
    * 
    */
    function contentScraper() {

        var x = new Xray();

        x('http://shirts4mike.com', 'ul.products li', [{
            url: 'a@href',
            image: 'img@src',
            price: x('a@href', '.price'),
            title: x('a@href', '.shirt-details h1')
        }])(function (err, result) {
            //Create CSV
            if (err) {
                // display message, write to log file
                var error = err.message;
                console.log(error);
                Logerrors(error);
            } else {
                createCSV(result);
            }
        });

    }



    //Check directory and run content scraper
    checkDirectory("./data/", function (error) {
        if (error) {
            console.log("Error:", error);
            //log error
        } else {
            // run x-ray content scraper
            contentScraper();

        }
    });

} ());


