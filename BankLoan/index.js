var blockChaion = require("./blockChainService/blockChainService.js");


blockChaion.getUserAmount("Laxman@gmail.com", function(err, data){
    console.log("getUserAmountgetDataError",err );
    console.log("getUserAmountError",data.toNumber() );
})

blockChaion.insertData("tesr@gmail.com", "test", 10000, function(err, data){
    console.log("getUserAmountgetDataError",err );
    console.log("getUserAmountError",data );
});




