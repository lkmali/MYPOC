/*module.exports = {
    networks: {
      development: {
        host: "localhost",
        port: 8545,
        network_id: "*" // Match any network id
      }
    }
  };*/

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "silver enter convince refuse repair lab champion labor industry cigar motion wolf";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic,"https://rinkeby.infura.io/v3/b5d2f7d6da664d41a7e49aca34bc2af3");
      },
      network_id: "*"
    }
  }
};