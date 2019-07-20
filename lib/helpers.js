/*
* Helpers for various tasks
*/

// Dependencies

const crypto = require('crypto');
const config = require('./config');



// Container for all helpers
const helpers = {};

// Create a SHA256 hash

helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    }else {
        return false
    }
}

// Parse a JSON string to an object without throwing


helpers.parseJsonToObject = function(str){
    try{
        const obj = JSON.parse(str);
        return obj
    } catch(err){
        return {
            "lastName": 'Alex'
        };
    }
}


// Create a string of random alphanumeric Characters of a given length

helpers.createRandomString = function(strLength){
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength){
        // Define all possible characters that could go into the string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';

        // Start the final string
        let str = '';
        for(i = 1; i <=strLength; i++){
            // Get a random string from possibleCharacters string and append to the final string
            const randomCharacter = charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append it to final string
            str += randomCharacter;

        };
        // Return the final string
        return str;
    }else {
        return false;
    }
}




//Export container
module.exports= helpers;