const config = require("../config/config");
const util = require("../utility/util");
const helper = require("../utility/shared");
const indy = require('indy-sdk');


async function createJObApplicationSchma(governmentDid, acmeDid){

  //  let acmeWalletConfig = {'id': config.acmeWallet}
  //  let acmeWalletCredentials = {'key': config.acme_key}

    let poolHandle =  await helper.getPoolHelender();
    let governmentWalletConfig = {'id': config.governmentWallet};
    let governmentWalletCredentials = {'key': config.government_key};

    let acmeWalletConfig = {'id': config.acmeWallet}
    let acmeWalletCredentials = {'key': config.acme_key}

    let governmentWallet = await indy.openWallet(governmentWalletConfig, governmentWalletCredentials);

    let  acmeWallet = await indy.openWallet(acmeWalletConfig, acmeWalletCredentials);


    let transcriptSchemaId, transcriptSchema;
    try {
      [transcriptSchemaId, transcriptSchema] = await indy.issuerCreateSchema(governmentDid, 'OfbizDemo', '1.4',
     ['first_name', 'last_name']);
 console.log("\"Government\" -> Send \"Transcript\" Schema to Ledger"); 
 
 await helper.sendSchema(poolHandle, governmentWallet, governmentDid, transcriptSchema);
    } catch (error) {
        console.log("error1", error);
    }
 
  
 
     [, transcriptSchema] = await helper.getSchema(poolHandle, acmeDid, transcriptSchemaId);
 
     console.log("transcriptSchema", transcriptSchema);
     console.log("\"Acme\" -> Create and store in Wallet \"Acme Job-Certificate\" Credential Definition");
     let acmeJobCertificateCredDefId, govtTranscriptCredDefJson;
 
     try {
          [acmeJobCertificateCredDefId, govtTranscriptCredDefJson] = await indy.issuerCreateAndStoreCredentialDef(governmentWallet, governmentDid, transcriptSchema, 'TAG11', 'CL', '{"support_revocation": false}'); 
     } catch (error) {
         console.log("MYFFFFFFFFFFFFFFFFFF", error);
     }
     console.log("\"Faber\" -> Create and store in Wallet \"Faber Transcript\" Credential Definition", acmeJobCertificateCredDefId);
 
 
 
     console.log("\"Acme\" -> Send \"Acme Job-Certificate\" Credential Definition to Ledger");
     await helper.sendCredDef(poolHandle, governmentWallet, governmentDid, govtTranscriptCredDefJson);


     await indy.closeWallet(governmentWallet);
     await indy.closeWallet(acmeWallet)

     console.log("acmeJobCertificateCredDefId", acmeJobCertificateCredDefId);
     return acmeJobCertificateCredDefId;

}


module.exports = {
    createJObApplicationSchma: createJObApplicationSchma

}