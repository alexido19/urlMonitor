/*
*
Library for storing and editing data
*/


// Dependencies
const fs = require('fs');
var path = require('path');
const helpers = require('./helpers');


// Container for the module (TO be exported)
var lib = {};

// Base directory for the data folder 
lib.baseDir = path.join(__dirname,'../.data/');

// Write data to a file

lib.create = function(dir,file,data,callback){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to string
            var stringData = JSON.stringify(data);

            // Write to file and close it 
            fs.writeFile(fileDescriptor,stringData,function(err){
                if(!err) {
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error closing to new file')
                        }
                    })
                }else {
                    callback('Error writing to new file');
                }
            })
        }else {
            callback('Could not create new file, It may already exist!')
        }
    })

};

//Read data from a file

lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if(!err && data){
            const parsedData = helpers.parseJsonToObject(data);
            callback(false,parsedData);
        }else {
            callback(err,data);
        }
    })
};


// Update data from a new file

lib.update = function(dir,file,data,callback){
    //Open the file for writing

    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            var stringData= JSON.stringify(data);

            //Truncate the file before writing

            fs.ftruncate(fileDescriptor,function(err){
                if(!err){
                    //Write to the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false);
                                }else {
                                    callback('Error closing existing file!')
                                }
                            })
                        }else {
                            callback('Error writing to existing file')
                        }
                    });
                }else {
                    callback('Error Truncating file')
                }
            });
        }else {
            callback('Could not open file for updating! May not exist yet')
        }
    });
};

// Delete a file!

lib.delete = function(dir,file,callback){


    // Unlink: Removing the file from the file system

    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false)
        }else {
            callback('Error deleting file!')
        }
    })
}





// Export the module
module.exports = lib;