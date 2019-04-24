
   const config = require("../config/config");
   const indy = require('indy-sdk');


   async function run (){
    console.log("\"Sovrin Steward\" -> Create wallet");
    let stewardWalletConfig = {'id': config.stewardWalletName};
    let stewardWalletCredentials = {'key': config.steward_key};
    let governmentWalletConfig = {'id': config.governmentWallet}
    let governmentWalletCredentials = {'key': config.government_key}
    let acmeWalletConfig = {'id': config.acmeWallet}
    let acmeWalletCredentials = {'key': config.acme_key}
 
 
 
    console.log(" \"Sovrin Steward\" -> Close and Delete wallet");
   //  await indy.closeWallet(stewardWallet);
     await indy.deleteWallet(stewardWalletConfig, stewardWalletCredentials);
 
     console.log("\"Government\" -> Close and Delete wallet");
     await indy.closeWallet(governmentWallet);
     await indy.deleteWallet(governmentWalletConfig, governmentWalletCredentials);
 
  
 
     console.log("\"Acme\" -> Close and Delete wallet");
  //   await indy.closeWallet(acmeWallet);
     await indy.deleteWallet(acmeWalletConfig, acmeWalletCredentials);
 
     console.log("Close and Delete pool");
    await indy.closePoolLedger(poolHandle);
     await indy.deletePoolLedgerConfig(poolName);
   }


   run();
