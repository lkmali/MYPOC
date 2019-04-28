const helper = require("../utility/shared");
const config = require("../config/config");
const indy = require('indy-sdk');
const schemaData = require(config.schemaConfigurationPath);
const walletData = require(config.walletConfigurationPath);

async function createSchema(){

    if( walletData["ISSUER"]["government"] && walletData["ISSUER"]["government"].did){
        for(let schema in schemaData){
            if(schemaData.hasOwnProperty(schema)){
                let request =    {
                    schemaName: schemaData[schema].schemaName,
                    schemaVersion: schemaData[schema].schemaVersion,
                    schemaField: schemaData[schema].schemaField,
                    tag: schemaData[schema].tag
                };
                request["providerWalletId"] = walletData["ISSUER"][schemaData[schema].issuer].WalletId;
                request["providerWalletKey"] = walletData["ISSUER"][schemaData[schema].issuer].key;
                request["providerDid"] = walletData["ISSUER"][schemaData[schema].issuer].did;
                schemaData[schema]["schemaId"] = await helper.createSchema(request);
        
            }
    }
    return await helper.writeData(config.schemaConfigurationPath, schemaData);
}else {
    return "First Create Wallet";
}

}


if (require.main.filename == __filename) {
    createSchema();
}

module.exports = {
    createSchema: createSchema
};