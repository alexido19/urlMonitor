/* Primary file for API
*
*
*/

// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
// The server should respond to all request with a string



// Instantiate the HTTP server
 const httpServer = http.createServer(function(req, res){

    unifiedServer(req, res);

 });


// Start the server

httpServer.listen(config.httpPort,function(){
    console.log("Server is listening on port "+config.httpPort)
});


// Instantiate HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions,function(req, res){
    unifiedServer(req, res);
})

// Start the server

httpsServer.listen(config.httpsPort,function(){
    console.log('Server is listen on port '+config.httpsPort)
});


// All server logic for the http and https server

var unifiedServer = function(req,res) {
    // Get the the url and parse it
    const parsedUrl = url.parse(req.url,true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object

    var queryStringObject = parsedUrl.query;

    //Get http method
    const method = req.method.toLowerCase();

    // Get the headers as an object

    const headers = req.headers;

    // Get the payload,if any
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    })

    req.on('end',function(){
        buffer += decoder.end();

        // Choose the hanlder for request

        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        
        var data  = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        //Route Request to the handler specified in the router

        chosenHandler(data,function(statusCode,payload){
            // Use the status code called back by the handler or default to 200

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            //Use the payload called back the handler or default to the object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert then payload to a string

            var payloadString = JSON.stringify(payload);

            //Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response:', statusCode,payloadString);
        })


 // Log the request path

 
    })
};


// Define a request router

const router = {
    'ping' : handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens
}