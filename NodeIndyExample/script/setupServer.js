var pool = require("./createPool");
var createSchma = require("./createSchma");
var createwalletScript = require("./createwalletScript");
const indy = require('indy-sdk');
//var pool = require("./createPool");



async  function done (){

    await  pool.createPool();

    //await indy.setProtocolVersion(2)

  //  let poolHandle = await indy.openPoolLedger("pool1");
var stewardDid= await createwalletScript.createProviderWallet() ;

var governmentDid =  await createwalletScript.createIssuerWallet(stewardDid) ;
var acmeDid = await createwalletScript.createRequesterWallet(stewardDid) ;

var acmeJobCertificateCredDefId = await createSchma.createJObApplicationSchma(governmentDid, acmeDid);

console.log("stewardDid", stewardDid);
console.log("governmentDid", governmentDid);
console.log("acmeDid", acmeDid);
console.log("acmeJobCertificateCredDefId", acmeJobCertificateCredDefId);
}


done();