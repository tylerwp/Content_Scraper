var Xray = require('x-ray');
var shirtsResults = null;
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
        shirtsResults = result.HomepageShirts;
        shirtsPageResults = result.shirtsMenu[0].shirtsLink.shirtsPage;

        // Loop through Shirt page results and add to shirtsResults filtering out any duplicates. 
        Object.keys(shirtsPageResults).forEach(function(o,ob){
            var test = shirtsPageResults[ob];
            if(!filterShirts(shirtsPageResults[ob],shirtsResults)){
                shirtsResults.push(shirtsPageResults[ob]);
            }
        });
        

    }
});


function filterShirts(shirt,shirtsResults){
    var hasShirt = false;
     Object.keys(shirtsResults).forEach(function(o,ob){
            if(shirtsResults[ob].title == shirt.title){
                hasShirt = true;           
            }
        });
        return hasShirt;
}


