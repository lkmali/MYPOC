var user = require("./server/user");
var helper = require("./utility/shared")
var  express =  require('express');
var bodyParser =  require('body-parser');
// Set up the express app
const app = express();
// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// get all todos
app.post('/createUser', async (req, res) => {
try {
  var [aliceGovernmentDid, id, key, userName]  = await  user.createUserAccount(await helper.createRequest(req.body));
  return res.status(201).send({
    aliceGovernmentDid: aliceGovernmentDid,
    id: id,
    key: key,
    userName: userName
  })
} catch (error) {
  return res.status(400).send({
    error: error
  })
}

  });

  app.post('/approveUser', async (req, res) => {
    try {
      var userRes = await  user.ValidateRequest(req.body);
      return res.status(201).send({
        userRes: userRes
      })
    } catch (error) {
      return res.status(400).send({
        error: error
      })
    }
   });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
