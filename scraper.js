var fs = require('fs');
var json2csv = require('json2csv');

//Check for data folder, create folder if it doesn't already exist.
function checkDirectory(directory, callback) {
    fs.stat(directory, function (err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err && err.errno === -4058) {
            //Create the directory, call the callback.
            fs.mkdir(directory, callback);
        } else {
            //just in case there was a different error:
            callback(err)
        }
    });
}

checkDirectory("./data/", function (error) {
    if (error) {
        console.log("Error:", error);
        //log error
    } else {
        // run x-ray content scraper
        contentScraper();

    }
});

function contentScraper() {

    //https://runkit.com/npm/x-ray

    var Xray = require('x-ray');
    var x = Xray();

    x('http://shirts4mike.com', 'ul.products li', [{
        url: 'a@href',
        image: 'img@src',
        price: x('a@href', '.price'),
        title: x('a@href', '.shirt-details h1')
    }])(function (err, result) {
        //Create CSV 
        if (err) {
            // display message, write to log file
            var error = err.code;
        } else {
            createCSV(result);
        }
    });

}




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
        if (err) throw err;
        console.log('file saved');
    });

    // save/overwite csv file.

}




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



/*
-- Create a scraper.js file. This should be the file that runs every day.

-- The scraper should create a folder called data, if a folder called data doesn't already exist (it should check for the folder).

-- The information from the site you scrape should be stored in a CSV file named after today's date: 2016-01-29.csv.

Use a third party npm package to scrape content from the site. As part of this assignment, you'll need to explain why you chose this package.

-- The scraper should be able to visit the website http://shirts4mike.com and follow links to all t-shirts.

-- The scraper should get the price, title, url and image url from the product page and save it in the CSV.

Use a third party npm package to create an CSV file. As part of this assignment, you’ll need to explain why you chose this package.

-- The column headers should be in this order: Title, Price, ImageURL, URL and Time. ‘Time’ should be the time the scrape happened. The columns must be in order (if we were really populating a database, the columns would need to be in order correctly populate the database).

If the site is down, an error message describing the issue should appear in the console. You can test your error by disabling the wifi on your computer.

-- If the data file for today’s date already exists, your program should overwrite the file.

Don't forget to document your code!

Use a linting tool like ESLint to check your code for syntax errors and to ensure general code quality. You should be able to run npm run lint to check your code.

When an error occurs log it to a file scraper-error.log . It should append to the bottom of the file with a time stamp and error e.g. [Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>
*/