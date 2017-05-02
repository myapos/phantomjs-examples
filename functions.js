function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};
function checkFiles(files){


    var page = require('webpage').create(), loadInProgress = false, fs = require('fs');
    phantom.waitFor = function(callback) {
      do {
        // Clear the event queue while waiting.
        // This can be accomplished using page.sendEvent()
        this.page.sendEvent('click');
      } while (!callback());
    }
    var pageindex = 0;
    //console.log('log:', files[1]);
    page.onAlert = function(msg) {
      console.log(msg);
    };
    page.onResourceReceived = function(response) {
        if (response.stage !== "end") return;
        console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + response.url);
    };
    page.onResourceRequested = function(requestData, networkRequest) {
        console.log('Request (#' + requestData.id + '): ' + requestData.url);
    };

    page.onLoadStarted = function() {
        loadInProgress = true;
        console.log('page ' + (pageindex + 1) + ' load started for '+files[pageindex]);
    };
    page.onLoadFinished = function(status) {
        console.log('Load Finished: ' + status);
        loadInProgress = false;
        loadRules (page.content,page.url,page);
        pageindex++;
    }
    page.onNavigationRequested = function(url, type, willNavigate, main) {
      if (url !== page.url) {
          console.log('Trying to navigate to: ' + url);
          console.log('Caused by: ' + type);
          console.log('Will actually navigate: ' + willNavigate);
          console.log('Sent from the page\'s main frame: ' + main);
          clearTimeout(waitTimeout);
      }
    }
    page.onUrlChanged = function(targetUrl) {
      console.log('New URL: ' + targetUrl);
    };
    var interval = setInterval(function() {
        if (!loadInProgress && pageindex < files.length) {
            //console.log("image " + (pageindex + 1));
            //page.open(files[pageindex]);
            console.log('log:', files[pageindex]);
            page.open(files[pageindex]);
            phantom.waitFor(function() {return !page.loading;});
            // Step 2: Click on first panel and wait for it to show
            // page.evaluate(function() { 
            //     document.getElementById('testClick').click();
            //     //document.body.click();
            // });
            // phantom.waitFor(function() {
            //    return page.evaluate(function() {
            //     return document.getElementById('testClick');
            //     //return document.body;
            //     })
            // });
            console.log('READY!');
            phantom.exit();
        }
        if (pageindex === files.length) {
            console.log("Files loading completed!");
            phantom.exit();
        }
    }, 250);
   
}

function loadRules (content, url, p){
    console.log('checking for adman js script.....');
    var admanJsCheck = content.match(/<script src=\"https:\/\/static.adman.gr\/adman.js"><\/script>/);
    var clickTagCheck = content.match(/window.open\(Adman.html5API.get\('click'\)\)/);

    if (admanJsCheck) {
        console.log('admanJsCheck:', admanJsCheck);
        console.log('Found admanjs script in ', url);
    } else console.log('No admanjs script is found in ', url);

    if (clickTagCheck) {
        console.log('clickTagCheck:', clickTagCheck);
        console.log('ClickTag is found in ', url);
        var title = p.evaluate(function() {
            return document.title;
          });
        var bodyOnClickF = p.evaluate(function() {
          return document.body.getAttribute('onclick');
        });
        var body = p.evaluate(function() {
          //document.body.click();
          return document.body;
        });    
        p.evaluate(function() { 
            document.getElementById('testClick').click();
            //document.body.click();
        });
        phantom.waitFor(function() {
           return p.evaluate(function() {
            return document.getElementById('testClick');
            //return document.body;
            })
        });
    } else console.log('No clickTag is found in ', url);

    if(typeof body !== 'undefined' &&
        typeof bodyOnClickF !== 'undefined' &&
        bodyOnClickF.match(/window.open\(Adman.html5API.get\('click'\)\)/)){
        console.log('Simulating click event in body.......................................');
        // p.evaluate(function(){
        //     // click
        //     var e = document.createEvent('MouseEvents');
        //     e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        //     document.body.dispatchEvent(e);
        // });
        // Step 2: Click on first panel and wait for it to show
        p.evaluate(function() { 
            document.getElementById('testClick').click();
            //document.body.click();
        });
        phantom.waitFor(function() {
           return p.evaluate(function() {
            return document.getElementById('testClick');
            //return document.body;
            })
        });
        // setTimeout(function(){
        //     phantom.exit();
        // }, 10000);
        // p.sendEvent('click');
        // handle_page(p);
        //clickBody();
        //var clickRes = p.sendEvent('click');
        // console.log('clickRes:', clickRes);
    } else {
        console.log('No clickTag found in body');
    }
    
}

module.exports = {
    checkFiles: checkFiles
};