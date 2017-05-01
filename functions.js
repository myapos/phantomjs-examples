function checkFiles(page, files){
    var pageindex = 0;
    var interval = setInterval(function() {
        if (!loadInProgress && pageindex < files.length) {
            //console.log("image " + (pageindex + 1));
            page.open(files[pageindex]);
        }
        if (pageindex === files.length) {
            console.log("Files loading completed!");
            phantom.exit();
        }
    }, 250);
    page.onLoadStarted = function() {
        loadInProgress = true;
        console.log('page ' + (pageindex + 1) + ' load started');
    };
    page.onLoadFinished = function() {
        loadInProgress = false;
        loadRules (page.content,page.url);
        pageindex++;
    }
};

function loadRules (content, url){
    console.log('checking for adman js script.....');
    if (content.match(/<script src=\"https:\/\/static.adman.gr\/adman.js"><\/script>/)) {
        console.log('Found admanjs script in ', url);
    } else console.log('No admanjs script is found in ', url);
    if (content.match(/window.open\(Adman.html5API.get\('click'\)\)/)) {
        console.log('ClickTag is found in ', url);
    } else console.log('No clickTag is found in ', url);

}

module.exports = {
    checkFiles: checkFiles
};