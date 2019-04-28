const config = require("../config/config");
const indy = require('indy-sdk');
const helper = require("../utility/shared");
const walletData = require(config.walletConfigurationPath);

async function run() {

    console.log("Delete data");


    await indy.deleteWallet({'id': walletData["PROVIDER"]["steward"].WalletId}, {'key': walletData["PROVIDER"]["steward"].key});
   // await indy.deleteWallet({'id': walletData["government"].WalletId}, {'key': walletData["government"].key});

    let issuers = walletData["ISSUER"];
    for (let issuer in issuers) {
        if (issuers.hasOwnProperty(issuer)) {
            await indy.deleteWallet({'id': issuers[issuer].WalletId}, {'key': issuers[issuer].key});
        }
    }

    //  await indy.deleteWallet( {'id': "ushamali13242@gmail.com"}, {'key': "gxhxibmzhxbadyq"});
    // await indy.deleteWallet( {'id': "maweddi@gmail.com"}, {'key': "wjpmmlzluxbqaap"});


    await indy.deletePoolLedgerConfig(config.poolName);


}


if (require.main.filename == __filename) {
    run()
}

module.exports = {
    run: run
}
