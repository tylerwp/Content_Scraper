var Xray = require('x-ray');
var shirtsHomeResults = null;
var shirtsPageResults = null;
var x = new Xray();
x('http://shirts4mike.com', {
    // lists: x('div', [{
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
    // }])
})(function (err, result) {
    //Create CSV
    if (err) {
        // display message, write to log file
        var error = err.message;
        console.log(error);

    } else {
        shirtsHomeResults = result.HomepageShirts;
        shirtsPageResults = result.shirtsMenu[0].shirtsLink.shirtsPage;

    }
});