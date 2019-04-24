"use strict";

const indy = require('indy-sdk');

var config = require("../config/config");
var util = require("../utility/util");
var helper = require("../utility/shared")

async function createPool() {
    console.log("gettingStarted.js -> started");
    console.log(`Open Pool Ledger: ${config.poolName}`);
    let poolGenesisTxnPath = await util.getPoolGenesisTxnPath(config.poolName);
    let poolConfig = {
        "genesis_txn": poolGenesisTxnPath
    };
    try {
        await indy.createPoolLedgerConfig(config.poolName, poolConfig);
    } catch(e) {
        if(e.message !== "PoolLedgerConfigAlreadyExistsError") {
            throw e;
        }
    }

   // await indy.setProtocolVersion(config.version);

}

module.exports = {
    createPool: createPool

}



