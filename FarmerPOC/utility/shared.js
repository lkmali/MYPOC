"use strict";

const indy = require('indy-sdk');
const config = require('../config/config');
const fs = require('fs');


async function writeData(filePath, data){
    try {
        let result = JSON.stringify(data);  
        fs.writeFileSync(filePath, result);  

        return "sucess";
    } catch (error) {
       throw error; 
    }
 
}

async function getPoolHelender(){
    try {
        await indy.setProtocolVersion(config.version);
        return await indy.openPoolLedger(config.poolName);
    }catch (e) {
      throw e;
    }

}
/**
 * We are creating Wallet bases on 
 * @param {{issuerWalletId: *, issuerName: *, issuerDid: *, requesterName: *, requesteWalletId: *, requestereWalletKey: *, issuerWalletKey: *}} request
 * @return  requesterDid
 */

async function createNewWallet(request) {
    console.log("I am createting " + request.requesterName+ "And My Requaet"+ JSON.stringify(request));
    console.log("I am createting " + request.requesterName);
   let poolHandle =  await getPoolHelender();
   let requesterWalletConfig = {'id': request.requesteWalletId};
   let requesterWalletCredentials = {'key': request.requestereWalletKey};


    let issuerWalletConfig = {'id': request.issuerWalletId};
    let issuerWalletCredentials = {'key': request.issuerWalletKey};

    let issuerWallet = await indy.openWallet(issuerWalletConfig, issuerWalletCredentials);
    let [requesterWallet, issuerRequesterKey, requesterIssuerDid, requesterIssuerKey] = await onboarding(poolHandle, request.issuerName, issuerWallet, request.issuerDid, request.requesterName, null, requesterWalletConfig, requesterWalletCredentials);
    let requesterDid = await getVerinym(poolHandle, request.issuerName, issuerWallet, request.issuerDid, issuerRequesterKey,
        request.requesterName, requesterWallet, requesterIssuerDid, requesterIssuerKey, 'TRUST_ANCHOR');

        console.log("createting walletSucessFully" + request.requesterName);
        console.log(request.requesterName + "'s Did " + requesterDid);
        await indy.closeWallet(issuerWallet);
        await indy.closeWallet(requesterWallet)
        await indy.closePoolLedger(poolHandle);

    return  requesterDid; 
}
/**
 * 
 * @param {providerWalletId, providerWalletKey, providerDid, schemaName, schemaVersion, schma, tag} request 
 */
async function createSchema(request){
    console.log("I am createting Scma of " + request.schemaName+ "And My Requaet"+ JSON.stringify(request));
    let poolHandle =  await getPoolHelender();
    let providerWalletConfig = {'id': request.providerWalletId};
    let providerWalletCredentials = {'key': request.providerWalletKey};
    let providerWallet = await indy.openWallet(providerWalletConfig, providerWalletCredentials);

    let  [transcriptSchemaId, transcriptSchema] = await indy.issuerCreateSchema(request.providerDid, request.schemaName, request.schemaVersion,request.schemaField);

    console.log("\"provider\" -> Send \"Transcript\" Schema to Ledger"); 
    await sendSchema(poolHandle, providerWallet, request.providerDid, transcriptSchema);
    [, transcriptSchema] = await getSchema(poolHandle,  request.providerDid, transcriptSchemaId);
 
     console.log("\"Acme\" -> Create and store in Wallet \"Acme Job-Certificate\" Credential Definition");
     let providerSchmaDid, providerTranscriptCredDefJson;
 
     try {
          [providerSchmaDid, providerTranscriptCredDefJson] = await indy.issuerCreateAndStoreCredentialDef(providerWallet,  request.providerDid, transcriptSchema,  request.tag, 'CL', '{"support_revocation": false}'); 
     } catch (error) {
        throw error;
     }
  
      await sendCredDef(poolHandle, providerWallet, request.providerDid, providerTranscriptCredDefJson);
      await indy.closeWallet(providerWallet);
      await indy.closePoolLedger(poolHandle);
      console.log("createting Scheam SucessFully" + request.schemaName);
      console.log(request.schemaName+ "'s Did " + providerSchmaDid);
     return providerSchmaDid;

}
/**
 * 
 * @param {{seed: SVGAnimatedNumber, providerId: *, providerkey: *}} request
 */
async function createProviderWallet(request) {
    let poolHandle =  await getPoolHelender();
      console.log("\"Sovrin Steward\" -> Create wallet");
      let stewardWalletConfig = {'id': request.providerId}
      let stewardWalletCredentials = {'key': request.providerkey}
      let stewardWallet;
      try {
          await indy.createWallet(stewardWalletConfig, stewardWalletCredentials)
      } catch(e) {
          if(e.message !== "WalletAlreadyExistsError") {
              throw e;
          }
      }
      stewardWallet = await indy.openWallet(stewardWalletConfig, stewardWalletCredentials);
      console.log("\"Sovrin Steward\" -> Create and store in Wallet DID from seed");
      let stewardDidInfo = {
          'seed': request.seed
      };
  
    let [stewardDid, stewardKey] = await indy.createAndStoreMyDid(stewardWallet, stewardDidInfo);
   // console.log("stewardDid", stewardDid);
     await indy.closeWallet(stewardWallet);
     await indy.closePoolLedger(poolHandle);

     console.log("createtingSovrin Steward");
     console.log("'s Did " + stewardDid);
      return stewardDid;
  }


async function onboarding(poolHandle, From, fromWallet, fromDid, to, toWallet, toWalletConfig, toWalletCredentials) {
    console.log(`\"${From}\" > Create and store in Wallet \"${From} ${to}\" DID`);
    let [fromToDid, fromToKey] = await indy.createAndStoreMyDid(fromWallet, {});

    console.log(`\"${From}\" > Send Nym to Ledger for \"${From} ${to}\" DID`);
    await sendNym(poolHandle, fromWallet, fromDid, fromToDid, fromToKey, null);

    console.log(`\"${From}\" > Send connection request to ${to} with \"${From} ${to}\" DID and nonce`);
    let connectionRequest = {
        did: fromToDid,
        nonce: 123456789
    };

    if (!toWallet) {
        console.log(`\"${to}\" > Create wallet"`);
        try {
            await indy.createWallet(toWalletConfig, toWalletCredentials)
        } catch(e) {
            if(e.message !== "WalletAlreadyExistsError") {
                throw e;
            }
        }
        toWallet = await indy.openWallet(toWalletConfig, toWalletCredentials);
    }

    console.log(`\"${to}\" > Create and store in Wallet \"${to} ${From}\" DID`);
    let [toFromDid, toFromKey] = await indy.createAndStoreMyDid(toWallet, {});

    console.log(`\"${to}\" > Get key for did from \"${From}\" connection request`);
    let fromToVerkey = await indy.keyForDid(poolHandle, toWallet, connectionRequest.did);

    console.log(`\"${to}\" > Anoncrypt connection response for \"${From}\" with \"${to} ${From}\" DID, verkey and nonce`);
    let connectionResponse = JSON.stringify({
        'did': toFromDid,
        'verkey': toFromKey,
        'nonce': connectionRequest['nonce']
    });
    let anoncryptedConnectionResponse = await indy.cryptoAnonCrypt(fromToVerkey, Buffer.from(connectionResponse, 'utf8'));

    console.log(`\"${to}\" > Send anoncrypted connection response to \"${From}\"`);

    console.log(`\"${From}\" > Anondecrypt connection response from \"${to}\"`);
    let decryptedConnectionResponse = JSON.parse(Buffer.from(await indy.cryptoAnonDecrypt(fromWallet, fromToKey, anoncryptedConnectionResponse)));

    console.log(`\"${From}\" > Authenticates \"${to}\" by comparision of Nonce`);
    if (connectionRequest['nonce'] !== decryptedConnectionResponse['nonce']) {
        throw Error("nonces don't match!");
    }

    console.log(`\"${From}\" > Send Nym to Ledger for \"${to} ${From}\" DID`);
    await sendNym(poolHandle, fromWallet, fromDid, decryptedConnectionResponse['did'], decryptedConnectionResponse['verkey'], null);

    return [toWallet, fromToKey, toFromDid, toFromKey, decryptedConnectionResponse];
}

async function getVerinym(poolHandle, From, fromWallet, fromDid, fromToKey, to, toWallet, toFromDid, toFromKey, role) {
    console.log(`\"${to}\" > Create and store in Wallet \"${to}\" new DID"`);
    let [toDid, toKey] = await indy.createAndStoreMyDid(toWallet, {});

    console.log(`\"${to}\" > Authcrypt \"${to} DID info\" for \"${From}\"`);
    let didInfoJson = JSON.stringify({
        'did': toDid,
        'verkey': toKey
    });
    let authcryptedDidInfo = await indy.cryptoAuthCrypt(toWallet, toFromKey, fromToKey, Buffer.from(didInfoJson, 'utf8'));

    console.log(`\"${to}\" > Send authcrypted \"${to} DID info\" to ${From}`);

    console.log(`\"${From}\" > Authdecrypted \"${to} DID info\" from ${to}`);
    let [senderVerkey, authdecryptedDidInfo] =
        await indy.cryptoAuthDecrypt(fromWallet, fromToKey, Buffer.from(authcryptedDidInfo));

    let authdecryptedDidInfoJson = JSON.parse(Buffer.from(authdecryptedDidInfo));
    console.log(`\"${From}\" > Authenticate ${to} by comparision of Verkeys`);
    let retrievedVerkey = await indy.keyForDid(poolHandle, fromWallet, toFromDid);
    if (senderVerkey !== retrievedVerkey) {
        throw Error("Verkey is not the same");
    }

    console.log(`\"${From}\" > Send Nym to Ledger for \"${to} DID\" with ${role} Role`);
    await sendNym(poolHandle, fromWallet, fromDid, authdecryptedDidInfoJson['did'], authdecryptedDidInfoJson['verkey'], role);

    return toDid
}

async function sendNym(poolHandle, walletHandle, Did, newDid, newKey, role) {
    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
}

async function sendSchema(poolHandle, walletHandle, Did, schema) {
    // schema = JSON.stringify(schema); // FIXME: Check JSON parsing
    let schemaRequest = await indy.buildSchemaRequest(Did, schema);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)
}

async function sendCredDef(poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await indy.buildCredDefRequest(did, credDef);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
}

async function getSchema(poolHandle, did, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    return await indy.parseGetSchemaResponse(getSchemaResponse);
}

async function getCredDef(poolHandle, did, schemaId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    return await indy.parseGetCredDefResponse(getCredDefResponse);
}

async function proverGetEntitiesFromLedger(poolHandle, did, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revStates = {};

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        console.log(`\"${actor}\" -> Get Schema from Ledger`);
        let [receivedSchemaId, receivedSchema] = await getSchema(poolHandle, did, item['schema_id']);
        schemas[receivedSchemaId] = receivedSchema;

        console.log(`\"${actor}\" -> Get Claim Definition from Ledger`);
        let [receivedCredDefId, receivedCredDef] = await getCredDef(poolHandle, did, item['cred_def_id']);
        credDefs[receivedCredDefId] = receivedCredDef;

        if (item.rev_reg_seq_no) {
            // TODO Create Revocation States
        }
    }

    return [schemas, credDefs, revStates];
}


async function verifierGetEntitiesFromLedger(poolHandle, did, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revRegDefs = {};
    let revRegs = {};

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        console.log(`"${actor}" -> Get Schema from Ledger`);
        let [receivedSchemaId, receivedSchema] = await getSchema(poolHandle, did, item['schema_id']);
        schemas[receivedSchemaId] = receivedSchema;

        console.log(`"${actor}" -> Get Claim Definition from Ledger`);
        let [receivedCredDefId, receivedCredDef] = await getCredDef(poolHandle, did, item['cred_def_id']);
        credDefs[receivedCredDefId] = receivedCredDef;

        if (item.rev_reg_seq_no) {
            // TODO Get Revocation Definitions and Revocation Registries
        }
    }

    return [schemas, credDefs, revRegDefs, revRegs];
}

async function authDecrypt(walletHandle, key, message) {
    let [fromVerkey, decryptedMessageJsonBuffer] = await indy.cryptoAuthDecrypt(walletHandle, key, message);
    let decryptedMessage = JSON.parse(decryptedMessageJsonBuffer);
    let decryptedMessageJson = JSON.stringify(decryptedMessage);
    return [fromVerkey, decryptedMessageJson, decryptedMessage];
}


async function convert(length, possibleValue){
    let text = "";
    for (let index = 0; index < length; index++)
      text += possibleValue.charAt(Math.floor(Math.random() * possibleValue.length));
    return text;
}


async function createRequest(request){
   let updateRequest = {};
   let transcriptCredValues = {};

   for (let mykey in request ) {
       if(request.hasOwnProperty(mykey)){
           let mydata = {raw: request[mykey] , encoded: await convert(16, "0123456789")} ;
           transcriptCredValues[mykey] = mydata;
       }
   }
    updateRequest["transcriptCredValues"] = transcriptCredValues;
    updateRequest["id"] = request.email;
    updateRequest["key"] = await convert(10, "abcdefghijklmnopqrstuvwxyz");
    updateRequest["userName"] =request.email;
    return updateRequest;
}

function isObjectEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}





module.exports = {
    isObjectEmpty: isObjectEmpty,
    getVerinym: getVerinym,
    authDecrypt: authDecrypt,
    proverGetEntitiesFromLedger: proverGetEntitiesFromLedger,
    getCredDef: getCredDef,
    writeData: writeData,
    createNewWallet: createNewWallet,
    createProviderWallet: createProviderWallet,
    convert: convert,
    createSchema: createSchema,
    onboarding: onboarding,
    getPoolHelender: getPoolHelender};