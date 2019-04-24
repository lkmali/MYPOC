var config = require("../config/BlockChainconfig.js");
var ethereumjs = require('ethereumjs-tx')
var Web3 = require('web3')
var bankAbi = require('../blockchain/build/contracts/Bank.json').abi;

var web3 = new Web3(new Web3.providers.HttpProvider(config.dev.blockChainNetworkUrl));

var contractInstance = web3.eth.contract(bankAbi).at(config.dev.contractAddress);

exports.insertData = function(userEmail, userName, userAmount, next){
    var data = contractInstance.createUserRequest.getData(userEmail, userName, userAmount);
    blockChainTransectionProcess(data, next);
}

exports.getData = (userEmail, next) =>{
    contractInstance.getUserInfo.call(userEmail, next);
}
exports.getUserAmount = (userEmail, next) => {
    contractInstance.getUserAmount.call(userEmail, next);
}

exports.updateUserAmount = (userEmail, amount,next) => {
    var data = contractInstance.UpdateAmountRequest.getData(userEmail,amount);
    blockChainTransectionProcess(data, next);
}
    
var blockChainTransectionProcess = (data, next) => {
    web3.eth.getTransactionCount(config.dev.accountKey, (error, nonce)=> {
        if(error){
         console.log("blockChainTransectionProcess----> getTransactionCount---->", error);
         return next(error, null);
        }else {
          var tx = new ethereumjs({
            nonce: nonce,
            gasPrice: web3.toHex(web3.toWei(config.dev.gasPrice, 'gwei')),
            gasLimit: config.dev.gasLimit,
            to: config.dev.contractAddress,
            value: 0,
            data: data,
          });
        
          var txData = new Buffer(config.dev.accountPrivateKey, 'hex');
          tx.sign(txData);
          var raw = '0x' + tx.serialize().toString('hex');
         web3.eth.sendRawTransaction(raw,  (err, transactionHash) =>{
             if(err){
              console.log("blockChainTransectionProcess----> sendRawTransaction---->", err);
                 return next(err, null);
             }
  
             waitForReceipt(transactionHash, (ReceiptError, data) => {
              if(error){
                  console.log("blockChainTransectionProcess----> waitForReceipt---->", err);
                  return next(ReceiptError, null);
              }
             /// console.log("blockChainTransectionProcess----> data---->", data);
             return  next(null, data.logs);
             })
          });

        }  
        
      
      
      
      });
}

function waitForReceipt(hash, cb) {
  web3.eth.getTransactionReceipt(hash, function (err, receipt) {
    if (err) {
        cb(err, null);
    }

    if (receipt !== null) {
      // Transaction went through
      if (cb) {
        cb(null,receipt);
      }
    } else {
      // Try again in 1 second
      setTimeout(function () {
        waitForReceipt(hash, cb);
      }, 100);
    }
  });
}


