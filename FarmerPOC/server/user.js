"use strict";
const indy = require('indy-sdk');
const config = require("../config/config");
let helper = require("../utility/shared");
let mongoDb = require("../dblayer/mongoDbconnection");
let requestBuilder = require("../server/requestBuilder");


async function insertDataIntoDb(data) {
    try {
        await mongoDb.insertData(data);
    } catch (e) {
        await indy.deleteWallet({'id': data.WalletId}, {'key': data.key});

        throw e;
    }
}

/**
 *
 * @param userRequest: {id, key, issuerWalletId, issuerWalletKey,
 *  issuerName ,issuerDid, userName, transcriptCredValues,userSchemaId } , ,
 * @returns {Promise<*[]>}
 * @constructor
 */
async function createUserIdentity(userRequest) {
    let userWalletConfig = {'id': userRequest.id};
    let userWalletCredentials = {'key': userRequest.key};
    let issuerWalletConfig = {'id': userRequest.issuerWalletId};
    let issuerWalletCredentials = {'key': userRequest.issuerWalletKey};
    let issuerWallet, poolHandle, userWallet;

    let issuerUserKey, userIssuerDid, userIssuerKey, issuerUserConnectionResponse, userVerificationDid;

    try {
        poolHandle = await helper.getPoolHelender();
        console.log("MYPOOL ID ", poolHandle);
    } catch (error) {
        throw error;
    }
    try {
        issuerWallet = await indy.openWallet(issuerWalletConfig, issuerWalletCredentials);
    } catch (error) {
        await indy.closePoolLedger(poolHandle);
        throw error;
    }

    try {
        [userWallet, issuerUserKey, userIssuerDid, userIssuerKey, issuerUserConnectionResponse] = await helper.onboarding(poolHandle, userRequest.issuerName, issuerWallet, userRequest.issuerDid, userRequest.userName, null, userWalletConfig, userWalletCredentials);

        console.log("USER WALLET", userWallet);
    } catch (error) {
        await indy.closeWallet(issuerWallet);
        await indy.closePoolLedger(poolHandle);
        throw error;
    }

    try {


        console.log("\"issuer\" -> Create \"Transcript\" Credential Offer for User");

        let transcriptCredOfferJson = await indy.issuerCreateCredentialOffer(issuerWallet, userRequest.userSchemaId);

        console.log("\"issuer\" -> Get key for User did");
        let userIssuerVerkey = await indy.keyForDid(poolHandle, issuerWallet, issuerUserConnectionResponse['did']);

        console.log("\"issuer\" -> Authcrypt \"Transcript\" Credential Offer for User");
        let authcryptedTranscriptCredOffer = await indy.cryptoAuthCrypt(issuerWallet, issuerUserKey, userIssuerVerkey, Buffer.from(JSON.stringify(transcriptCredOfferJson), 'utf8'));


        console.log("\"User\" -> Authdecrypted \"Transcript\" Credential Offer from issuer");
        let [issuerUserVerkey, authdecryptedTranscriptCredOfferJson, authdecryptedTranscriptCredOffer] = await helper.authDecrypt(userWallet, userIssuerKey, authcryptedTranscriptCredOffer);

        console.log("\"User\" -> Create and store \"User\" Master Secret in Wallet");
        let userMasterSecretId = await indy.proverCreateMasterSecret(userWallet, null);

        console.log("\"User\" -> Get \"issuer Transcript\" Credential Definition from Ledger");
        let issuerTranscriptCredDef, issuerTranscriptCredDefId;
        [issuerTranscriptCredDefId, issuerTranscriptCredDef] = await helper.getCredDef(poolHandle, userIssuerDid, authdecryptedTranscriptCredOffer['cred_def_id']);

        console.log("\"User\" -> Create \"Transcript\" Credential Request for issuer");
        let [transcriptCredRequestJson, transcriptCredRequestMetadataJson] = await indy.proverCreateCredentialReq(userWallet, userIssuerDid, authdecryptedTranscriptCredOfferJson, issuerTranscriptCredDef, userMasterSecretId);

        console.log("\"User\" -> Authcrypt \"Transcript\" Credential Request for issuer");
        let authcryptedTranscriptCredRequest = await indy.cryptoAuthCrypt(userWallet, userIssuerKey, issuerUserVerkey, Buffer.from(JSON.stringify(transcriptCredRequestJson), 'utf8'));

        console.log("\"User\" -> Send authcrypted \"Transcript\" Credential Request to issuer");

        console.log("\"issuer\" -> Authdecrypt \"Transcript\" Credential Request from User");
        let authdecryptedTranscriptCredRequestJson;
        [userIssuerVerkey, authdecryptedTranscriptCredRequestJson] = await helper.authDecrypt(issuerWallet, issuerUserKey, authcryptedTranscriptCredRequest);

        console.log("\"issuer\" -> Create \"Transcript\" Credential for User");
        // note that encoding is not standardized by Indy except that 32-bit integers are encoded as themselves. IS-786


        let [transcriptCredJson] = await indy.issuerCreateCredential(issuerWallet, transcriptCredOfferJson, authdecryptedTranscriptCredRequestJson, userRequest.transcriptCredValues, null, -1);

        console.log("\"issuer\" -> Authcrypt \"Transcript\" Credential for User");
        let authcryptedTranscriptCredJson = await indy.cryptoAuthCrypt(issuerWallet, issuerUserKey, userIssuerVerkey, Buffer.from(JSON.stringify(transcriptCredJson), 'utf8'));

        console.log("\"issuer\" -> Send authcrypted \"Transcript\" Credential to User");

        console.log("\"User\" -> Authdecrypted \"Transcript\" Credential from issuer");
        let [, authdecryptedTranscriptCredJson] = await helper.authDecrypt(userWallet, userIssuerKey, authcryptedTranscriptCredJson);

        console.log("\"User\" -> Store \"Transcript\" Credential from issuer");
        await indy.proverStoreCredential(userWallet, null, transcriptCredRequestMetadataJson,
            authdecryptedTranscriptCredJson, issuerTranscriptCredDef, null);
        await indy.closeWallet(userWallet);
        await indy.closeWallet(issuerWallet);
        await indy.closePoolLedger(poolHandle);


        return [userIssuerDid, userRequest.id, userRequest.key, userRequest.userName];
    } catch (error) {
        await indy.closeWallet(userWallet);
        await indy.closeWallet(issuerWallet);
        await indy.closePoolLedger(poolHandle);
        throw error;
    }

}


async function createUser(request) {

    console.log("CRETDJKJHKDJHKJDHJJJJJJJJJJJJJJJJJJJJJJJJJJJ", request);
    let  response = await createUserIdentity(await requestBuilder.createInsertRequest(request.userData, request.userType));
    let [userIssuerDid, id, key, userName] = response;
    let finalResponse = {
        userIssuerDid: userIssuerDid,
        userWalletId: id,
        userWalletKey: key,
        userWalletName: userName,
        userType: request.userType
    };
    await insertDataIntoDb(finalResponse);
    return finalResponse;

}

/**
 *
 * @param validateRequest: {id, key, requesterWalletId, requesterWalletKey, requesterName, requesterDid, userName
 *  proofRequestJson, userIssuerDid}
 * @returns {Promise<*>}
 * @constructor
 */

async function ValidateRequest(validateRequest) {
    let requesterWallet, poolHandle, userWallet;
    try {
        let userWalletConfig = {'id': validateRequest.id};
        let userWalletCredentials = {'key': validateRequest.key};
        let requesterWalletConfig = {'id': validateRequest.requesterWalletId};
        let requesterWalletCredentials = {'key': validateRequest.requesterWalletKey};
        poolHandle = await helper.getPoolHelender();
        requesterWallet = await indy.openWallet(requesterWalletConfig, requesterWalletCredentials);
        userWallet = await indy.openWallet(userWalletConfig, userWalletCredentials);
        let requesterUserKey, userRequesterDid, userRequesterKey, requesterUserConnectionResponse;

        [userWallet, requesterUserKey, userRequesterDid, userRequesterKey, requesterUserConnectionResponse] = await helper.onboarding(poolHandle, validateRequest.requesterName, requesterWallet, validateRequest.requesterDid, validateRequest.userName, userWallet, userWalletConfig, userWalletCredentials);


        console.log("\"Requester\" -> Create \"Job-Application\" Proof Request");


        console.log("\"Requester\" -> Get key for User did");
        let userRequesterVerkey = await indy.keyForDid(poolHandle, requesterWallet, requesterUserConnectionResponse['did']);

        console.log("\"Requester\" -> Authcrypt \"Job-Application\" Proof Request for User");
        let authcryptedJobApplicationProofRequestJson = await indy.cryptoAuthCrypt(requesterWallet, requesterUserKey, userRequesterVerkey, Buffer.from(JSON.stringify(validateRequest.proofRequestJson), 'utf8'));

        console.log("\"Requester\" -> Send authcrypted \"Job-Application\" Proof Request to User");

        console.log("\"User\" -> Authdecrypt \"Job-Application\" Proof Request from Requester");
        let [requesterUserVerkey, authdecryptedJobApplicationProofRequestJson] = await helper.authDecrypt(userWallet, userRequesterKey, authcryptedJobApplicationProofRequestJson);

        console.log("\"User\" -> Get credentials for \"Job-Application\" Proof Request");
        let searchForJobApplicationProofRequest = await indy.proverSearchCredentialsForProofReq(userWallet, authdecryptedJobApplicationProofRequestJson, null)

        let credentials = await indy.proverFetchCredentialsForProofReq(searchForJobApplicationProofRequest, 'attr1_referent', 100)
        let credForAttr1 = credentials[0]['cred_info'];

        console.log("credForAttr1", credForAttr1);

        await indy.proverCloseCredentialsSearchForProofReq(searchForJobApplicationProofRequest)

        let credsForJobApplicationProof = {};
        credsForJobApplicationProof[`${credForAttr1['referent']}`] = credForAttr1;

        let [schemasJson, credDefsJson, revocStatesJson] = await helper.proverGetEntitiesFromLedger(poolHandle, validateRequest.userIssuerDid, credsForJobApplicationProof, validateRequest.userName);
        console.log("schemasJson", schemasJson);
        console.log("credDefsJson", credDefsJson);
        console.log("revocStatesJson", revocStatesJson);
        await indy.closeWallet(userWallet);
        await indy.closeWallet(requesterWallet);
        await indy.closePoolLedger(poolHandle);
        return credForAttr1;
    } catch (error) {
        indy.closeWallet(userWallet);
        indy.closeWallet(requesterWallet);
        indy.closePoolLedger(poolHandle);
        throw error;
    }

}


module.exports = {
    ValidateRequest: ValidateRequest,
    createUser: createUser
};