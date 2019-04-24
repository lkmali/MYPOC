
"use strict";
var govtTranscriptCredDefJson =  "GGqGVEertTJMMZZ9y7UDg1:3:CL:74:TAG9"
const indy = require('indy-sdk');
var config = require("../config/config");
var helper = require("../utility/shared")
var userRequest = {
    transcriptCredValues: {
        "first_name": {"raw": "laxman", "encoded": "1139481716457488690172217916278103335"},
        "last_name": {"raw": "Mali", "encoded": "5321642780241790123587902456789123452"},
        "degree": {"raw": "Bachelor of Science, Marketing", "encoded": "12434523576212321"},
        "status": {"raw": "graduated", "encoded": "2213454313412354"},
        "ssn": {"raw": "123-45-6789", "encoded": "3124141231422543541"},
        "year": {"raw": "2015", "encoded": "2015"},
        "average": {"raw": "5", "encoded": "5"}
    },
    id: "laxmanasawa9312@gmail.com",
    key: "laxmanMali",
    userName: "laxmanMali",
  


}



async  function createUserAccount(request) {

    try {
        let aliceWalletConfig = {'id': request.id}
        let aliceWalletCredentials = {'key': request.key}
        let governmentWalletConfig = {'id': config.governmentWallet}
        let governmentWalletCredentials = {'key': config.government_key}
      let poolHandle =  await helper.getPoolHelender();
        let governmentWallet = await indy.openWallet(governmentWalletConfig, governmentWalletCredentials);
        let [aliceWallet, governmentAliceKey, aliceGovernmentDid, aliceGovernmentKey, governmentAliceConnectionResponse] = await helper.onboarding(poolHandle, config.govtName, governmentWallet, config.govtDid, request.userName, null, aliceWalletConfig, aliceWalletCredentials);
    
        console.log("==============================");
        console.log("== Getting Transcript with government - Getting Transcript Credential ==");
        console.log("------------------------------");
    
        console.log("\"government\" -> Create \"Transcript\" Credential Offer for Alice");
       // console.log("govtTranscriptCredDefJson", govtTranscriptCredDefJson);

let transcriptCredOfferJson = await indy.issuerCreateCredentialOffer(governmentWallet, config.acmeJobCertificateCredDefId);
    
        console.log("\"government\" -> Get key for Alice did");
        let aliceGovernmentVerkey = await indy.keyForDid(poolHandle, governmentWallet, governmentAliceConnectionResponse['did']);
    
        console.log("\"government\" -> Authcrypt \"Transcript\" Credential Offer for Alice");
        let authcryptedTranscriptCredOffer = await indy.cryptoAuthCrypt(governmentWallet, governmentAliceKey, aliceGovernmentVerkey, Buffer.from(JSON.stringify(transcriptCredOfferJson),'utf8'));
    
        console.log("\"government\" -> Send authcrypted \"Transcript\" Credential Offer to Alice");
    
        console.log("\"Alice\" -> Authdecrypted \"Transcript\" Credential Offer from government");
        let [governmentAliceVerkey, authdecryptedTranscriptCredOfferJson, authdecryptedTranscriptCredOffer] = await helper.authDecrypt(aliceWallet, aliceGovernmentKey, authcryptedTranscriptCredOffer);
    
        console.log("\"Alice\" -> Create and store \"Alice\" Master Secret in Wallet");
        let aliceMasterSecretId = await indy.proverCreateMasterSecret(aliceWallet, null);
    
        console.log("\"Alice\" -> Get \"government Transcript\" Credential Definition from Ledger");
        let governmentTranscriptCredDef, governmentTranscriptCredDefId;
        [governmentTranscriptCredDefId, governmentTranscriptCredDef] = await helper.getCredDef(poolHandle, aliceGovernmentDid, authdecryptedTranscriptCredOffer['cred_def_id']);
    
        console.log("\"Alice\" -> Create \"Transcript\" Credential Request for government");
        let [transcriptCredRequestJson, transcriptCredRequestMetadataJson] = await indy.proverCreateCredentialReq(aliceWallet, aliceGovernmentDid, authdecryptedTranscriptCredOfferJson, governmentTranscriptCredDef, aliceMasterSecretId);
    
        console.log("\"Alice\" -> Authcrypt \"Transcript\" Credential Request for government");
        let authcryptedTranscriptCredRequest = await indy.cryptoAuthCrypt(aliceWallet, aliceGovernmentKey, governmentAliceVerkey, Buffer.from(JSON.stringify(transcriptCredRequestJson),'utf8'));
    
        console.log("\"Alice\" -> Send authcrypted \"Transcript\" Credential Request to government");
    
        console.log("\"government\" -> Authdecrypt \"Transcript\" Credential Request from Alice");
        let authdecryptedTranscriptCredRequestJson;
        [aliceGovernmentVerkey, authdecryptedTranscriptCredRequestJson] = await helper.authDecrypt(governmentWallet, governmentAliceKey, authcryptedTranscriptCredRequest);
    
        console.log("\"government\" -> Create \"Transcript\" Credential for Alice");
        // note that encoding is not standardized by Indy except that 32-bit integers are encoded as themselves. IS-786
    
    
     let [transcriptCredJson] = await indy.issuerCreateCredential(governmentWallet, transcriptCredOfferJson, authdecryptedTranscriptCredRequestJson, request.transcriptCredValues, null, -1);
    
        console.log("\"government\" -> Authcrypt \"Transcript\" Credential for Alice");
        let authcryptedTranscriptCredJson = await indy.cryptoAuthCrypt(governmentWallet, governmentAliceKey, aliceGovernmentVerkey, Buffer.from(JSON.stringify(transcriptCredJson),'utf8'));
    
        console.log("\"government\" -> Send authcrypted \"Transcript\" Credential to Alice");
    
        console.log("\"Alice\" -> Authdecrypted \"Transcript\" Credential from government");
        let [, authdecryptedTranscriptCredJson] = await helper.authDecrypt(aliceWallet, aliceGovernmentKey, authcryptedTranscriptCredJson);
    
        console.log("\"Alice\" -> Store \"Transcript\" Credential from government");
        await indy.proverStoreCredential(aliceWallet, null, transcriptCredRequestMetadataJson,
            authdecryptedTranscriptCredJson, governmentTranscriptCredDef, null);

            await indy.closeWallet(aliceWallet);
            await indy.closeWallet(governmentWallet);
            await indy.closePoolLedger(poolHandle);


          return [aliceGovernmentDid, request.id, request.key, request.userName];  
    } catch (error) {
        await indy.closeWallet(aliceWallet);
        await indy.closeWallet(governmentWallet);
        await indy.closePoolLedger(poolHandle);
        throw error;
    }
   
}


async  function ValidateRequest(request) {
    let aliceWalletConfig = {'id': request.id}
    let aliceWalletCredentials = {'key': request.key}

    try {
        let poolHandle =  await helper.getPoolHelender();

    let acmeWalletConfig = {'id': config.acmeWallet}
    let acmeWalletCredentials = {'key': config.acme_key}

    let aliceWallet = await indy.openWallet(aliceWalletConfig,aliceWalletCredentials);
    let acmeWallet = await indy.openWallet(acmeWalletConfig, acmeWalletCredentials);
    let acmeAliceKey, aliceAcmeDid, aliceAcmeKey, acmeAliceConnectionResponse;

    [aliceWallet, acmeAliceKey, aliceAcmeDid, aliceAcmeKey, acmeAliceConnectionResponse] = await helper.onboarding(poolHandle, config.acme, acmeWallet, config.acmeDid, request.userName, aliceWallet, aliceWalletConfig, aliceWalletCredentials);

    console.log("==============================");
    console.log("== Apply for the job with Acme - Transcript proving ==");
    console.log("------------------------------");

    console.log("\"Acme\" -> Create \"Job-Application\" Proof Request");
    console.log("\"Acme\" -> Create \"Job-Application\" Proof Request");

 
    console.log("\"Acme\" -> Get key for Alice did");
    let aliceAcmeVerkey = await indy.keyForDid(poolHandle, acmeWallet, acmeAliceConnectionResponse['did']);

    console.log("\"Acme\" -> Authcrypt \"Job-Application\" Proof Request for Alice");
    let authcryptedJobApplicationProofRequestJson = await indy.cryptoAuthCrypt(acmeWallet, acmeAliceKey, aliceAcmeVerkey,Buffer.from(JSON.stringify(request.jobApplicationProofRequestJson),'utf8'));

    console.log("\"Acme\" -> Send authcrypted \"Job-Application\" Proof Request to Alice");

    console.log("\"Alice\" -> Authdecrypt \"Job-Application\" Proof Request from Acme");
    let [acmeAliceVerkey, authdecryptedJobApplicationProofRequestJson] = await helper.authDecrypt(aliceWallet, aliceAcmeKey, authcryptedJobApplicationProofRequestJson);

    console.log("\"Alice\" -> Get credentials for \"Job-Application\" Proof Request");
    let searchForJobApplicationProofRequest = await indy.proverSearchCredentialsForProofReq(aliceWallet, authdecryptedJobApplicationProofRequestJson, null)

    let credentials = await indy.proverFetchCredentialsForProofReq(searchForJobApplicationProofRequest, 'attr1_referent', 100)
    let credForAttr1 = credentials[0]['cred_info'];

    console.log("credForAttr1", credForAttr1);

    await indy.proverCloseCredentialsSearchForProofReq(searchForJobApplicationProofRequest)

    let credsForJobApplicationProof = {};
    credsForJobApplicationProof[`${credForAttr1['referent']}`] = credForAttr1;

    let [schemasJson, credDefsJson, revocStatesJson] = await helper.proverGetEntitiesFromLedger(poolHandle, request.aliceGovernmentDid, credsForJobApplicationProof, request.userName);
    console.log("schemasJson", schemasJson);
    console.log("credDefsJson", credDefsJson);
    console.log("revocStatesJson", revocStatesJson);
    await indy.closeWallet(aliceWallet);
    await indy.closeWallet(acmeWallet);
    await indy.closePoolLedger(poolHandle);
    return credForAttr1;
    } catch (error) {
        await indy.closeWallet(aliceWallet);
        await indy.closeWallet(acmeWallet);
        await indy.closePoolLedger(poolHandle); 
        console.log("HHHHHHHHHHHHHHHHHHHHHHHHh", error);
        throw error;
    }
    
}


module.exports = {
    createUserAccount: createUserAccount,
    ValidateRequest: ValidateRequest
}