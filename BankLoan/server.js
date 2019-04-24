var address = "0x8ed250ead356A6dD5Ed47eae6540196ad10968f9";

const Web3 = require('web3')
var abi = require('./blockchain/build/contracts/Bank.json').abi;
const  ethereumjs = require('ethereumjs-tx')
var account = "0x008CaE700Bd838E859430aeB07Eb688012Be804A";
var privateKey = "A562C73B8424A3704CE48EDA828D77B3FDFF4D8F468D2A06B4862F3081831CC6";


var web3 = new Web3(new Web3.providers.HttpProvider(
  "https://rinkeby.infura.io/v3/b5d2f7d6da664d41a7e49aca34bc2af3"));
  var contractI = web3.eth.contract(abi).at(address);


  
web3.eth.getTransactionCount(account, async function (err, nonce) {
  var data = contractI.createUserRequest.getData(4,"laxman@akeo.com", "laxman", 104400);
  var tx = new ethereumjs({
    nonce: nonce,
    gasPrice: web3.toHex(web3.toWei('60', 'gwei')),
    gasLimit: 1000000,
    to: address,
    value: 0,
    data: data,
  });

  var txData = new Buffer(privateKey, 'hex');
  tx.sign(txData);

  var raw = '0x' + tx.serialize().toString('hex');
  
  web3.eth.sendRawTransaction(raw,  (err, transactionHash) =>{
    console.log(transactionHash);
    console.log(transactionHash);

    contractI.getUserInfo.call(4, (err, result) => {
        console.log("JJJJJJJJJJJJJ", err);
        console.log("  var value = ", result);
        });
        contractI.getUserAmount.call(4, (err, result) => {
            console.log("getUserAmount", err);
            console.log("  var getUserAmount = ", result);
            });
  });
 });

 var blockChainTransectionProcess = (data, next) => {
  web3.eth.getTransactionCount(config.dev.accountKey, (error, nonce)=> {
      if(error){
          console.log("blockChainTransectionProcess----> getTransactionCount---->", error);
       return next(error, null);
      }  
      var tx = new ethereumjs({
        nonce: nonce,
        gasPrice: web3.toHex(web3.toWei('60', 'gwei')),
        gasLimit: config.dev.gasLimit,
        to: address,
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
          console.log("blockChainTransectionProcess----> data---->", data);
          next(null, data);
         })
      });
    
    
    
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
      window.setTimeout(function () {
        waitForReceipt(hash, cb);
      }, 100);
    }
  });
}