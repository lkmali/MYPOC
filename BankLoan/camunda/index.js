var Worker = require('camunda-worker-node');
var Backoff = require('camunda-worker-node/lib/backoff');
var Logger = require('camunda-worker-node/lib/logger');
var blockChaion = require("../blockChainService/blockChainService.js");
var engineEndpoint = 'http://localhost:8080/engine-rest';

var worker = Worker(engineEndpoint, {
  workerId: 'some-worzker-id',
  use: [
    Backoff, Logger
  ]
});

console.log("I am start ");
// a work subscription may access and modify process variables
worker.subscribe('SendUserInfo', ["name", "amount", "address", "userEmail"], async  (context)=> {
   var name = context.variables.name;
  var amount = context.variables.amount;
  var address = context.variables.address;
  var userEmail = context.variables.userEmail;
  console.log("SendUserInfo ");
  console.log("name ", name);
  console.log("amount ", amount);
  console.log("address ", address);
  console.log("userEmail ", userEmail);

  blockChaion.insertData(userEmail, name, amount,  (err, data)=> {
    if (err || data.length == 0) {
      console.log("I AM HERE ", err);
      return {
        variables: {
          blockChainError: true
        }
      }
  //  process.exit(0);
    } else {
      blockChaion.getData(userEmail, (err, userData)=> {
        if (err) {
          return {
            variables: {
              blockChainError: true,
              error: false
            }
          }
        } else {
          blockChaion.getUserAmount(userEmail,  (errrr, data) =>{
            if (errrr) {
              return {
                variables: {
                  blockChainError: true
                }
              }
            } else {
              return {
                variables: {
                  name: userData[1],
                  blockChainError: false,
                  amount: data.toNumber(),
                  address: address,
                  userEmail: userData[0]
                }
              }

            }

          });
        }

      });



    }
  })







  // complete with update variables
});
// a work subscription may access and modify process variables
worker.subscribe('TestService', ["messageByAgent", "getMessageByAgent"], async function (context) {

  var messageByAgent = context.variables.messageByAgent;
  var getMessageByAgent = context.variables.getMessageByAgent;
  console.log("AgentInformation ");
  console.log("messageByAgent ", messageByAgent);
  console.log("getMessageByAgent ", getMessageByAgent);

  if (getMessageByAgent) {
    return {
      variables: {
        messageByAgent: messageByAgent,
        getMessageByAgent: true
      }
    }
  } else {
    return {
      variables: {
        messageByAgent: messageByAgent,
        getMessageByAgent: false
      }
    }
  }






  // complete with update variables
});
// a work subscription may access and modify process variables
worker.subscribe('AgentInformation', ["messageByAgent"], async function (context) {

  var messageByAgent = context.variables.messageByAgent;
  console.log("AgentInformation ");
  console.log("messageByAgent ", messageByAgent);


  return {
    variables: {
      messageByAgent: messageByAgent,
      getMessageByAgent: true
    }
  }




  // complete with update variables
});
// a work subscription may access and modify process variables
worker.subscribe('finalUserTask', ["approveRequest", "message"], async function (context) {

  var approveRequest = context.variables.approveRequest;
  var message = context.variables.message;
  console.log("finalUserTask ");
  console.log("message ", message);
  console.log("approveRequest ", approveRequest);

  if (approveRequest) {
    return {
      variables: {
        message: message,
        CustomMessage: "congratulation You Wil get loan in a month"
      }
    }

  } else {
    return {
      variables: {
        message: message,
        CustomMessage: "Sorry you are not eligible for loan"
      }
    }
  }




  // complete with update variables
});
