"use strict";
let helper = require("../utility/shared");
const mongoDb = require("../dblayer/mongoDbconnection");
const config = require("../config/config");
const schemaData = require(config.schemaConfigurationPath);
const walletData = require(config.walletConfigurationPath);

/**
 *
 * @param request
 * @returns {Promise<void>}
 */
async function createInsertRequest(request, userType) {
    let updateRequest = {};
    let transcriptCredValues = {};

    for (let mykey in request) {
        if (request.hasOwnProperty(mykey)) {
            transcriptCredValues[mykey] = {raw: request[mykey], encoded: await helper.convert(16, "0123456789")};
        }
    }
    updateRequest["transcriptCredValues"] = transcriptCredValues;
    updateRequest["id"] = request.email;
    updateRequest["key"] = await helper.convert(15, "abcdefghijklmnopqrstuvwxyz");
    updateRequest["userName"] = request.email;
    updateRequest["issuerWalletKey"] = walletData["ISSUER"][schemaData[userType].issuer].key;
    updateRequest["issuerWalletId"] = walletData["ISSUER"][schemaData[userType].issuer].WalletId;
    updateRequest["issuerDid"] = walletData["ISSUER"][schemaData[userType].issuer].did;
    updateRequest["issuerName"] = walletData["ISSUER"][schemaData[userType].issuer].name;
    updateRequest["userSchemaId"] = schemaData[userType].schemaId;
    return updateRequest;
}

/**
 *id, key, requesterWalletId, requesterWalletKey, requesterName, requesterDid, userName
 *  proofRequestJson, userIssuerDid
 * @param request
 * @returns {Promise<void>}
 */
async function createGetRequest(request) {
    let getRequest = {};
    if (request && request.userIssuerDid) {
        let user = await mongoDb.getData({userIssuerDid: request.userIssuerDid});
        getRequest["id"] = user.userWalletId;
        getRequest["key"] = user.userWalletKey;
        getRequest["userName"] = user.userWalletName;
        getRequest["requesterWalletId"] = walletData["ISSUER"][schemaData[user.userType].issuer].WalletId;
        getRequest["requesterWalletKey"] = walletData["ISSUER"][schemaData[user.userType].issuer].key;
        getRequest["requesterName"] = walletData["ISSUER"][schemaData[user.userType].issuer].name;
        getRequest["requesterDid"] = walletData["ISSUER"][schemaData[user.userType].issuer].did;
        getRequest["proofRequestJson"] = request.proofRequestJson;
        getRequest["userIssuerDid"] = request.userIssuerDid;
    }

    return getRequest;
}


async function createWareHouseRequest(request, userType) {
    let updateRequest = {};
    let transcriptCredValues = {};

    for (let mykey in request) {
        if (request.hasOwnProperty(mykey)) {
            transcriptCredValues[mykey] = {raw: request[mykey], encoded: await helper.convert(16, "0123456789")};
        }
    }
    updateRequest["transcriptCredValues"] = transcriptCredValues;
    updateRequest["id"] = request.email;
    updateRequest["key"] = await helper.convert(15, "abcdefghijklmnopqrstuvwxyz");
    updateRequest["userName"] = request.email;
    updateRequest["issuerWalletKey"] = walletData["acheme"].key;
    updateRequest["issuerWalletId"] = walletData["acheme"].WalletId;
    updateRequest["issuerDid"] = walletData["acheme"].did;
    updateRequest["issuerName"] = walletData["acheme"].name;
    updateRequest["userSchemaId"] = schemaData[userType].schemaId;
    return updateRequest;
}

async function createTestRequest(request) {
    let getRequest = {};
    if (request && request.userIssuerDid && request.requesterDid) {
        let user = await mongoDb.getData(request.userIssuerDid);
        //      let requester = await mongoDb.getData(request.requesterDid);
        getRequest["id"] = user.UserWalletId;
        getRequest["key"] = user.UserWalletKey;
        getRequest["userName"] = user.UserWalletName;
        getRequest["requesterWalletId"] = "acheme_wallet";
        getRequest["requesterWalletKey"] = "acheme_wallet_key";
        getRequest["requesterName"] = "ACHEME";
        getRequest["requesterDid"] = request.requesterDid;
        getRequest["proofRequestJson"] = request.proofRequestJson;
        getRequest["userIssuerDid"] = request.userIssuerDid;
    }

    return getRequest;
}

module.exports = {
    createGetRequest: createGetRequest,
    createTestRequest: createTestRequest,
    createInsertRequest: createInsertRequest,
    createWareHouseRequest: createWareHouseRequest
};