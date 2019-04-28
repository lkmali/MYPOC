const helper = require("../utility/shared");
const config = require("../config/config");
const walletData = require(config.walletConfigurationPath);

async function createWallet() {

    let stewardRequest = {
        providerId: walletData["PROVIDER"]["steward"].WalletId,
        providerkey: walletData["PROVIDER"]["steward"].key,
        seed: walletData["PROVIDER"]["steward"].seed
    };
    let stewardDId = await helper.createProviderWallet(stewardRequest);
    walletData["PROVIDER"]["steward"]["did"] = stewardDId;
    let issuers = walletData["ISSUER"];
    for (let issuer in issuers) {
        if (issuers.hasOwnProperty(issuer)) {
            let requester = {
                requesteWalletId: issuers[issuer].WalletId,
                requestereWalletKey: issuers[issuer].key,
                issuerWalletId: walletData["PROVIDER"]["steward"].WalletId,
                issuerWalletKey: walletData["PROVIDER"]["steward"].key,
                issuerName: walletData["PROVIDER"]["steward"].name,
                issuerDid: stewardDId,
                requesterName: issuers[issuer].name,
            };
            walletData["ISSUER"][issuer]["did"] = await helper.createNewWallet(requester);
        }
    }
    return await helper.writeData(config.walletConfigurationPath, walletData);

}


if (require.main.filename == __filename) {
    createWallet();
}

module.exports = {
    createWallet: createWallet
};