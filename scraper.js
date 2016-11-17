(function () {

    "use strict";


    var fs = require('fs');
    var json2csv = require('json2csv');
    // https://www.npmjs.com/package/json2csv
    // I chose json2csv as it was well documented and as of 3.7.1 it was recently updated.
    // I particularly like the feature of adding column title from a separate array.

    var Xray = require('x-ray');
    // https://www.npmjs.com/package/x-ray
    // After trying several others and running into issues I found x-ray to work and do what was needed and was also pleased to see many stars on Github for it.
    // The documentation could be improved as there was a lot of trial and error to see how it could fit my needs.



    /**
    * Create error log then write error to log file.
    *
    * @param {String} errorMessage - Error message to log in the file. 
    * 
    */
    function logErrors(errorMessage) {

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
                logErrors(err.message);
            } else {
                console.log('CSV file saved.');
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
        fs.mkdir(directory, function (err) {
            if (err) {
                if(err.code === 'EEXIST'){
                    console.log("Directory already created.");  
                    callback('EEXIST');        
                }else{
                    //Something went wrong
                    callback(err);
                }      
            }else{
                //directory created
                console.log("New directory created.");
                callback('DONE');
            }
        });
    }

    /**
    * Check if shirt already exists within shirtsResults Array and returns boolean
    *
    * @param {Object} shirt - Objects of shirt details. 
    * @param {Array} shirtsResults - An Array of Objects from Xray scraper. 
    * 
    */
    function filterShirts(shirt, shirtsResults) {
        var hasShirt = false;
        Object.keys(shirtsResults).forEach(function (ob) {
            if (shirtsResults[ob].title === shirt.title) {
                hasShirt = true;
            }
        });
        return hasShirt;
    }

    /**
    * Scrapes the content of shirts4mike.com and creates a CSV file from the results
    * 
    */
    function contentScraper() {

        var shirtsResults = null;
        var shirtsPageResults = null;
        var x = new Xray();
        x('http://shirts4mike.com', {     

            shirtsMenu: x('li.shirts', [{
                shirtsLink: x('a@href', {
                    shirtsPage: x('ul.products li', [{
                        url: 'a@href',
                        image: 'img@src',
                        price: x('a@href', '.price'),
                        title: x('a@href', '.shirt-details h1')
                    }])

                })
            }]),
            
            HomepageShirts: x('ul.products li', [{
                url: 'a@href',
                image: 'img@src',
                price: x('a@href', '.price'),
                title: x('a@href', '.shirt-details h1')
            }])
            
        })(function (err, result) {
            //Create CSV
            if (err) {
                // display message, write to log file
                var error = err.message;
                console.log('Content scraping aborted, there was an error:', error);
                logErrors(error);

            } else {
                shirtsResults = result.HomepageShirts;
                shirtsPageResults = result.shirtsMenu[0].shirtsLink.shirtsPage;

                // Loop through Shirt page results and add to shirtsResults filtering out any duplicates. 
                Object.keys(shirtsPageResults).forEach(function (ob) {                    
                    if (!filterShirts(shirtsPageResults[ob], shirtsResults)) {
                        shirtsResults.push(shirtsPageResults[ob]);
                    }
                });

                //shirtsResults to CSV
                createCSV(shirtsResults);
            }
        });


    }



    //Check directory and run content scraper
    checkDirectory("./data/", function (response) {
        if (response === 'EEXIST' || response === 'DONE') {
            // run x-ray content scraper
            console.log("Running content scraper.");
            contentScraper();           
        } else {
            //There was an error
             console.log("Content scraping aborted, there was an error:", response.message);
             logErrors( response.message);
        }
    });

} ());


