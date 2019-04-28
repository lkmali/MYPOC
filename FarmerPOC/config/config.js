const util = require('../utility/util');
var path = require('path');

module.exports = {
    poolName: "pool1",
    version: 2, 
    schemaConfigurationPath: path.join(__dirname, "schemaConfiguration.json"),
    walletConfigurationPath: path.join(__dirname, "walletConfiguration.json"),
   userType: {
       Farmer: "Farmer",
       Consumer: "Consumer",
       Supplier: "Supplier"
   },
    mongoDbUrl: "mongodb://127.0.0.1:27017/indyDb",
    dbname: "indyDb"

};