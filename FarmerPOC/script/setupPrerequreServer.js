var pool = require("./createPool");
var createSchma = require("./createSchma");
var deleteData = require("./delete");
var createwalletScript = require("./createWallet");



async  function done (){

  try{
    await  pool.createPool();
    await createwalletScript.createWallet();
    await createSchma.createSchema();
  }catch(e){
    console.log("EORORHFFH------------>", e);
    console.log("Somthing Going Wrong so We are deleting all data");
    deleteData.run();
  }
 
}


done();