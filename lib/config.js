    // Create and export config variables





    // Conatiner for all environments

    var environments = {};

    // Staging (default ) environment

    environments.staging = {
        'httpPort' : 3000,
        'httpsPort' : 3001,
        'envName': 'staging',
        'hashingSecret': 'thisIsASecret'
    };

    //Production Environment

    environments.production = {
        'httpPort' : 5000,
        'httpsPort' : 5001,
        'envName': 'production',
        'hashingSecret': 'thisIsASecret'
    };

    // Determine which environment was passed as a command-line argument

    var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

    // Determine the current environment is the one above, if not, default to staging
    var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

    // Export the module

    module.exports = environmentToExport;



