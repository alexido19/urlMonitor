/*
* Request Handlers
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');



// Define handlers
var handlers = {};

//Users
handlers.users = function(data,callback){
    const acceptableMethods = ['post','get','put','delete'];

    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    }else {
        callback(405);
    }
};

// Container for users Sub-methods

handlers._users = {};

// Users-post
// Required Data: FirstName, LastName, Phone, Password, tosAgreement
//Optional data: None!
handlers._users.post = function(data,callback){
    // Check the all required fileds are filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; 
    const lasttName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lasttName && phone && password && tosAgreement){
        // Make sure the user doesn't already exist

        _data.read('users',phone,function(err,data){
            if(err){
                //Creating user: Hash the passowrd
                const hashedPassword = helpers.hash(password);

                if(hashedPassword){
                //Create the user object


                const userObject = {
                    'firstName': firstName,
                    'lastName': lasttName,
                    'phone': phone,
                    'password': hashedPassword,
                    'tosAgreement': true                
                };

                    // Store the user 

                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        }else {
                            console.log(err);
                            callback(500,{'Error:': 'Could nto create new user'})
                        }
                    });
                }else {
                    callback(500,{'Error': 'Could not hash User'});
                }

            }else{
                callback(400,{'Error': 'A user with that phone numebr already exists!'})
            }
        })
    }else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// Users-get
// Required Data: Phone
// Optional Data: None!
//@TODO Only let authenticated user access their object!
handlers._users.get = function(data,callback){
    // Check the Phone is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;
    if(phone){
        _data.read('users',phone,function(err,data){
            if(!err && data){
                // Remove the hashed password before returning it 
                delete data.hashedPassword;
                callback(200,data);
            }else {
                callback(404)
            }
        })
    }else {
        callback(400, {'Error' : 'Missing required field'});
    }
};

// Users-put
// Required Data: Phone
// Optional data: firstName, lastName, Phone,password
//@TODO only let an authenticated user update only their object! 
handlers._users.put = function(data,callback){
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim(): false;

    // Check for Optional Data
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; 
    const lasttName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    // Error if phone is invalid

    if(phone) {
        if(firstName || lasttName || password){
            // Look for user
            _data.read('users',phone,function(err,userData){
                if(!err && userData){
                    // Update neccessary fields
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lasttName){
                        userData.lastName = lasttName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }

                    // Store the new updates
                    _data.update('users',phone,userData,function(err){
                        if(!err){
                            callback(200)
                        }else {
                            console.log(err);
                            callback(500,{'Error': 'Could not update the user'})
                        }
                    })
                }else {
                    callback(400,{'Error': 'The specified user does not exist!'})
                }
            })
        }else {
            callback(400,{'Error': 'Missing required field'})
        }
    } else {
        callback(400,{'Error:': 'Missing required fields!'})
    }
};

// Users-delete
//Required fields: Phone
//@TODO Only authenticated user should delet only their object!
//@TODO Cleanup (delete) any other data associated with this user 
handlers._users.delete = function(data,callback){
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;
    // Check if phone valid
    if(phone){
        _data.read('users',phone,function(err,data){
            if(!err && data){
                _data.delete('users',phone,function(err,data){
                    if(!err){
                        callback(200);
                    }else {
                        callback(500,{'Error': 'Could not delete user!'})
                    }
                });
            }else {
                callback(400, {'Error': 'Could not find specified user!'});
            }
        });

    }else {
        callback(400,{'Error': 'Misiing required fileds!'})
    }
};

// Tokens

handlers.tokens = function(data,callback){
    const acceptableMethods = ['post','get','put','delete'];

    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    }else {
        callback(405);
    }
};

// Container for all tokens 

handlers._tokens = {};

// Toekn_post
// Required data: Phone, password
handlers._tokens.post = function(data,callback){
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password){
        // Look up the user with phone number
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                // Hash the sent password and compare to it the password stored in user object
                const hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // if valid create new random token, Set expiration 
                    const tokenId = helpers.createRandomString(20);

                    const expires = Date.new() * 1000 * 60 * 60;

                    const tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject)
                        }else {
                            callback(500,{'Error': 'Could not create token'})
                        }
                    });
                }else {
                    callback(400, {"Error": 'Password did not match specified user password!'})
                }
            }else {
                callback(400, {'Error': 'Could not find specified user!'})
            }
        })
    }else {
        callback(400,{'Error': 'Missing required field(s)'})
    }
};

// Token_get
handlers._tokens.get = function(data,callback){
    
};

// TOken_put
handlers._tokens.put = function(data,callback){

};

// Token_delete

handlers._tokens.delete = function(data,callback){

};









//Ping handler
handlers.ping = function(data, callback){
   callback(200);
     
};

// Define Not found

handlers.notFound = function(data, callback){
     callback(404)
}

//export Handlers
module.exports = handlers;