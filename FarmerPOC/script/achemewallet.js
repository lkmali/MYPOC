const helper = require("../utility/shared");
const config = require("../config/config");
const walletData = require(config.walletConfigurationPath);


async function createWallet(){

    let stewardRequest =    {
        providerId: walletData["steward"].WalletId,
        providerkey: walletData["steward"].key,
        seed: walletData["steward"].seed
    }  ;
    let stewardDId = "Th7MpTaRZVRYnPiabds81Y";
    let governmentRequest = {
        requesteWalletId: walletData["acheme"].WalletId,
        requestereWalletKey: walletData["acheme"].key,
        issuerWalletId: walletData["steward"].WalletId,
        issuerWalletKey: walletData["steward"].key,
        issuerName: walletData["steward"].name,
        issuerDid: stewardDId,
        requesterName: walletData["acheme"].name,
    };
    let governmentDid = await helper.createNewWallet(governmentRequest);

    console.log("ACHEMEDID", governmentDid);

}
createWallet();