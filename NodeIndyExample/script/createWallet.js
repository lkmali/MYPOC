"use strict";

const indy = require('indy-sdk');
const util = require('../utility/util');
const config = require('../config/config');
const assert = require('assert');

async function run() {

    console.log("gettingStarted.js -> started");

    let poolName = 'pool1';
    console.log(`Open Pool Ledger: ${poolName}`);
    let poolGenesisTxnPath = await util.getPoolGenesisTxnPath(poolName);
    let poolConfig = {
        "genesis_txn": poolGenesisTxnPath
    };
    try {
        await indy.createPoolLedgerConfig(poolName, poolConfig);
    } catch(e) {
        if(e.message !== "PoolLedgerConfigAlreadyExistsError") {
            throw e;
        }
    }

    await indy.setProtocolVersion(2)

    let poolHandle = await indy.openPoolLedger(poolName);

    console.log("==============================");
    console.log("=== Getting Trust Anchor credentials for Faber, Acme, Thrift and Government  ==");
    console.log("------------------------------");

    console.log("\"Sovrin Steward\" -> Create wallet");
    let stewardWalletConfig = {'id': config.stewardWalletName}
    let stewardWalletCredentials = {'key': config.steward_key}
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
        'seed': '000000000000000000000000Steward1'
    };

  let [stewardDid, stewardKey] = await indy.createAndStoreMyDid(stewardWallet, stewardDidInfo);
//let stewardDid = "Th7MpTaRZVRYnPiabds81Y";
//let stewardKey = "FYmoFw55GeQH7SRFa37dkx1d2dZ3zUF8ckg7wmL7ofN4";
console.log("stewardDid", stewardDid);
    let governmentWalletConfig = {'id': config.governmentWallet}
    let governmentWalletCredentials = {'key': config.government_key}
    let [governmentWallet, stewardGovernmentKey, governmentStewardDid, governmentStewardKey] = await onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, "Government", null, governmentWalletConfig, governmentWalletCredentials);



   let governmentDid = await getVerinym(poolHandle, "Sovrin Steward", stewardWallet, stewardDid,
        stewardGovernmentKey, "Government", governmentWallet, governmentStewardDid,
        governmentStewardKey, 'TRUST_ANCHOR');
        //let governmentDid = "GGqGVEertTJMMZZ9y7UDg1";
        console.log("governmentDid", governmentDid);

    let acmeWalletConfig = {'id': config.acmeWallet}
    let acmeWalletCredentials = {'key': config.acme_key}
    let [acmeWallet, stewardAcmeKey, acmeStewardDid, acmeStewardKey] = await onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, "Acme", null, acmeWalletConfig, acmeWalletCredentials);

  

 let acmeDid = await getVerinym(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, stewardAcmeKey,
        "Acme", acmeWallet, acmeStewardDid, acmeStewardKey, 'TRUST_ANCHOR');

       // let acmeDid = "EwqFcTB4kVxp1wSPtVyPcV";
        console.log("acmeDid",acmeDid);
let transcriptSchemaId, transcriptSchema;
   try {
     [transcriptSchemaId, transcriptSchema] = await indy.issuerCreateSchema(governmentDid, 'Transcript', '1.2',
    ['first_name', 'last_name', 'degree', 'status',
        'year', 'average', 'ssn']);
console.log("\"Government\" -> Send \"Transcript\" Schema to Ledger"); 

await sendSchema(poolHandle, governmentWallet, governmentDid, transcriptSchema);
   } catch (error) {
       console.log("error1", error);
   }

 

    [, transcriptSchema] = await getSchema(poolHandle, acmeDid, transcriptSchemaId);

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
    await sendCredDef(poolHandle, governmentWallet, governmentDid, govtTranscriptCredDefJson);





 






    console.log("Getting started -> done")
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
if (require.main.filename == __filename) {
    run()
}
module.exports = {
    run
}
