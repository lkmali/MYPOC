"use strict";

const indy = require('indy-sdk');

const config = require("../config/config");
const util = require("../utility/util");
const helper = require("../utility/shared");
async function createProviderWallet(){
  let poolHandle =  await helper.getPoolHelender();

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
  console.log("stewardDid", stewardDid);
  await indy.closeWallet(stewardWallet);
  await indy.closePoolLedger(poolHandle);
    return stewardDid;
}

async function createIssuerWallet(stewardDid){
    let poolHandle =  await helper.getPoolHelender();
    let governmentWalletConfig = {'id': config.governmentWallet}
    let governmentWalletCredentials = {'key': config.government_key}

    let stewardWalletConfig = {'id': config.stewardWalletName}
    let stewardWalletCredentials = {'key': config.steward_key}

    let stewardWallet = await indy.openWallet(stewardWalletConfig, stewardWalletCredentials);
    console.log("------------------------------------> IN createIssuerWallet1 ")
    //let [governmentWallet, stewardGovernmentKey, governmentStewardDid, governmentStewardKey] = await onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, "Government", null, governmentWalletConfig, governmentWalletCredentials);
    let [governmentWallet, stewardGovernmentKey, governmentStewardDid, governmentStewardKey] = await helper.onboarding(poolHandle, config.sovrin, stewardWallet, stewardDid, config.govtName , null, governmentWalletConfig, governmentWalletCredentials);

console.log("------------------------------------> IN createIssuerWallet2 ")


    let governmentDid = await helper.getVerinym(poolHandle, config.sovrin, stewardWallet, stewardDid,
        stewardGovernmentKey,config.govtName, governmentWallet, governmentStewardDid,
        governmentStewardKey, 'TRUST_ANCHOR');

        console.log("------------------------------------> IN createIssuerWallet3")

        console.log("governmentDid", governmentDid);

        await indy.closeWallet(stewardWallet);
        await indy.closeWallet(governmentWallet);
        await indy.closePoolLedger(poolHandle);

        return governmentDid;

}


async function createRequesterWallet(stewardDid){
   let poolHandle =  await helper.getPoolHelender();
   let acmeWalletConfig = {'id': config.acmeWallet}
    let acmeWalletCredentials = {'key': config.acme_key}


    let stewardWalletConfig = {'id': config.stewardWalletName}
    let stewardWalletCredentials = {'key': config.steward_key}

    let stewardWallet = await indy.openWallet(stewardWalletConfig, stewardWalletCredentials);

    let [acmeWallet, stewardAcmeKey, acmeStewardDid, acmeStewardKey] = await helper.onboarding(poolHandle, config.sovrin, stewardWallet, stewardDid, config.acme, null, acmeWalletConfig, acmeWalletCredentials);
    let acmeDid = await helper.getVerinym(poolHandle, config.sovrin, stewardWallet, stewardDid, stewardAcmeKey,
        config.acme, acmeWallet, acmeStewardDid, acmeStewardKey, 'TRUST_ANCHOR');

        console.log("acmeDid", acmeDid);

        await indy.closeWallet(stewardWallet);
        await indy.closeWallet(acmeWallet)
        await indy.closePoolLedger(poolHandle);

      return  acmeDid; 
}


module.exports = {
    createRequesterWallet: createRequesterWallet,
    createIssuerWallet: createIssuerWallet,
    createProviderWallet: createProviderWallet

}