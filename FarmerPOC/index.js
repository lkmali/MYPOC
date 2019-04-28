var user = require("./server/user");
var  express =  require('express');
var bodyParser =  require('body-parser');
let helper = require("./utility/shared");
const mongoDb = require("./dblayer/mongoDbconnection");
let requestBuilder = require("./server/requestBuilder");
// Set up the express app
const app = express();
// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(allowCrossDomain);
app.post('/createUser', async (req, res) => {
try {
  let response  = await  user.createUser(req.body);
  return res.status(201).send(response);
} catch (error) {
  return res.status(400).send({
    error: error
  })
}

  });

  app.post('/approveUser', async (req, res) => {
    try {
      let getRequest = await requestBuilder.createGetRequest(req.body);
      if(!helper.isObjectEmpty(getRequest)){
        let userRes = await  user.ValidateRequest(getRequest);
        return res.status(201).send({
          userRes: userRes
        })


      }else {
        return res.status(400).send({
          error: "INVALID REQUEST"
        })
      }

    } catch (error) {
      return res.status(400).send({
        error: error
      })
    }
   });




app.post('/testUser', async (req, res) => {
  try {
    let getRequest = await requestBuilder.createTestRequest(req.body);
    if(!helper.isObjectEmpty(getRequest)){
      let userRes = await  user.ValidateRequest(getRequest);
      return res.status(201).send({
        userRes: userRes
      })


    }else {
      return res.status(400).send({
        error: "INVALID REQUEST"
      })
    }

  } catch (error) {
    return res.status(400).send({
      error: error
    })
  }
});

  try {
    const PORT = 3000;
    app.listen(PORT, async () => {
      console.log(`server running on port ${PORT}`)
    });
  }catch (e) {
    console.log("Something going in your server")
  }

