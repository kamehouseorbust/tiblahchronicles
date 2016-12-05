//This program I run through node once a day to tweet the next year's events
//The next two lines are importing the Node.js packages
var TwitterPackage = require('twitter');
var fs = require('fs');

//Twitter keys necessary for posting
var secret = {
    consumer_key: 'RXCckPMz5Mz9hysSD3MQ147a7',
    consumer_secret: 'peFQ47iY92JKcIJD3HpmJU5ZJumxWlaHilSI6SSQ9SZJ2UgPtp',
    access_token_key: '803094390650585088-unR787YvkQSAT9Duij4rpmNz84XKlTM',
    access_token_secret: 'W2VQcsmOxDikeF0W21lZ4tNjlhyHfKv9ZQgSQ8TTvjMYK'
}
//Necessary Twitter variables
var Twitter = new TwitterPackage(secret);
//Importing year1 of data into string variable
var file = fs.readFileSync("year1.txt", "utf8");
var fileStrings = [];
//Spliting imported string into an array of strings, each entry separated by an enter in the original .txt file
fileStrings = file.split("\n");

//Same as for year1 occurences, but this time for locations
var locations = fs.readFileSync("locations.txt", "utf8");
var locationStrings = [];
locationStrings = locations.split("\n");

//Same as for year1 occurences, but this time for civilizations
var civilizations = fs.readFileSync("civilizations.txt", "utf8");
var civilizationStrings = [];
civilizationStrings = civilizations.split("\n");

//Same as for year1 occurences, but this time for governments
var governments = fs.readFileSync("governments.txt", "utf8");
var governmentStrings = [];
governmentStrings = governments.split("\n");

//Variables for use in turning each line from the filesStrings array into Tweet ready text and then Tweeting it
var yearhash = " ";
var i = 0;
var h = 0;
//Loop that reads entire array, converts text into Tweet ready text, and then Tweets each entry.
(function tweetLoop(i){
    setTimeout(function(){
            var line = fileStrings[h];
            tweet(line);
            h++;
        if(--i&&h<fileStrings.length){
            tweetLoop(i)
        }
    },3000);
})(0);
function tweet(line){    
    var linelength = line.length;
    //Turns the "yearhash" variable into the approriate string for the Tweet, in this case "#year1
    if(line.match(fileStrings[0])){
        yearhash = yearhash.concat(line);
    }
    else{
        //Ignores any line that features the word "null" (These are outliers from the procedural generation that don't make sense)
        if(line.includes("null")){
            return;
        }
        //Checks if line is too long to be Tweeted
        else if(linelength>139){
            var toolong = [];
            toolong = line.split(".");
            for(line of toolong){
                if(line.includes("UNKNOWN")){
                    line = fixUnknown(line);
                    line = addHash(line);
                    line = cleanUp(line);
                }
                else{
                    line = addHash(line);
                    line = cleanUp(line);
                }
            } 
        }
        //Checks if line uncludes "Unknown"
        else{
            //Checks if line uncludes "Unknown," if so, it runs a program that replaces all instances of unknown with a hashtag and alternate text. Also adds necessary hashtags and "cleans up" line for Tweeting.
            if(line.includes("UNKNOWN")){
                line = fixUnknown(line);
                line = addHash(line);
                line = cleanUp(line);
            }
            else{
            //Same as unknown check, but if there is no "unknown" within the line
                line = addHash(line);
                line = cleanUp(line);
            }
        }
    }
    var finlength = line.length;
    //If the Tweet is longer than 10 and less than 139 characters, it Tweets the line.
    if(finlength>10&&finlength<139){
        Twitter.post('statuses/update', {status: line},  function(error, tweet, response){
            if(error){
                console.log(error);
            }
            console.log(tweet);  // Tweet body.
            console.log(response);  // Raw response object.
        });
    }
    //Else it attempts to fix the length of the Tweet, if it fails the next time, it simply goes to the next line, this is to keep the program running efficiently.
    else if(finlength>139){
        var toolonglength = line.length;
        var half = toolonglength/2;
        var tweet1 = line.substr(0,half);
        tweet1 = cleanUp(tweet1);
        tweet1.concat(" pt 1");
        if(tweet1.length>139){
            return;
        }
        else{
            Twitter.post('statuses/update', {status: tweet1},  function(error, tweet, response){
        if(error){
            console.log(error);
        }
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
            });
        }
        var tweet2 = line.substr(half+1,toolonglength-1);
        tweet2.concat(" pt 2");
        if(tweet2.length>139){
            return;
        }
        else{
            Twitter.post('statuses/update', {status: tweet2},  function(error, tweet, response){
        if(error){
            console.log(error);
        }
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
        });
        }
    }
    //Safety parameter that continues program if other ifs are not triggered.
    else{
        return;
    }
}
//Twitter post template kept in code for copy/paste purposes.
/*Twitter.post('statuses/update', {status: line},  function(error, tweet, response){
        if(error){
            console.log(error);
        }
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
    });*/
//Function receives line, trims whitespace off, checks for any instances of lines from locationStrings, civilizationStrings, and governmentStrings. If any matches occur, the text it matches is replaced with a hashtag for that parameter. The final text is returned.
function addHash(text){
    var hash = "#";
    for(line of locationStrings){
        line = line.trim();
        if (text.includes(line)){
            fin = line.replace(/ /g,"");
            fin = hash.concat(fin);
            text = text.replace(line,fin);
        }
        else{
            continue;
        }
    }
    for(line of civilizationStrings){
        line = line.trim();
        if (text.includes(line)){
            fin = line.replace(/ /g,"");
            fin = hash.concat(fin);
            text = text.replace(line,fin);
        }
        else{
            continue;
        }
    }
    for(line of governmentStrings){
        line = line.trim();
        if (text.includes(line)){
            fin = line.replace(/ /g,"");
            fin = hash.concat(fin);
            text = text.replace(line,fin);
        }
        else{
            continue;
        }
    }
    return text;
}
//Function receives line containing "UKNOWN..." and replaces that text with a placeholder hashtag that can be used to trace these mysterious instances. The unknown plays into the narrative of Dwarf Fortress.
function fixUnknown(line){
    var figure = line.includes("UNKNOWN HISTORICAL FIGURE");
    var occupation = line.includes("UNKNOWN JOB");
    var structure = line.includes("UNKNOWN STRUCTURE");
    var building = line.includes("UNKNOWN BUILDING");
    var festival = line.includes("UNKNOWN FESTIVAL");
    
    if(figure>-1){
        line = line.replace(/UNKNOWN HISTORICAL FIGURE/g,"#Anamelessperson");
    }
    if(occupation>-1){
        line = line.replace(/UNKNOWN JOB/g,"#secretjob");
    }
    if(structure>-1){
        line = line.replace(/UNKNOWN STRUCTURE/g,"#hiddenstrcture");
    }
    if(building>-1){
        line = line.replace(/UNKNOWN BUILDING/g,"#hiddenbuilding");
    }
    if(festival>-1){
        line = line.replace(/UNKNOWN FESTIVAL/g,"#secretfestival");
    }
    return line;
}
//Function that removes all numbers, underscores, parantheses, and extraneous spaces, as well as trims whitespace off of text. This then returns the text.
function cleanUp(text){
    if (text.includes("0")){
        text = text.replace(/0/g,"");
    }
    if (text.includes("1")){
        text = text.replace(/1/g,"");
    }
    if (text.includes("2")){
        text = text.replace(/2/g,"");
    }
    if (text.includes("3")){
        text = text.replace(/3/g,"");
    }
    if (text.includes("4")){
        text = text.replace(/4/g,"");
    }
    if (text.includes("5")){
        text = text.replace(/5/g,"");
    }
    if (text.includes("6")){
        text = text.replace(/6/g,"");
    }
    if (text.includes("7")){
        text = text.replace(/7/g,"");
    }
    if (text.includes("8")){
        text = text.replace(/8/g,"");
    }
    if (text.includes("9")){
        text = text.replace(/9/g,"");
    }
    text = text.trim();
    text = text.replace(/_/g," ");
    text = text.replace("()"," ");
    text = text.concat(yearhash);
    text = text.replace(/  /g," ");
    text = text.replace(/   /g," ");
    return text;
}
