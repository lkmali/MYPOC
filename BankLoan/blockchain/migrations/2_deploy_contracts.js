const Banks = artifacts.require("Bank");
module.exports = function(deployer) {
  deployer.deploy(Banks);
};
