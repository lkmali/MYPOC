var MongoClient = require('mongodb').MongoClient;
const config = require("../config/config");

module.exports = {
    getData: async (query) => {
        let db, client;
        try {
            client = await MongoClient.connect(config.mongoDbUrl, { useNewUrlParser: true });
            db = client.db(config.dbname);
            return await db.collection("user").findOne(query);
        } finally {
            client.close();
        }
    },
    insertData: async (data) => {
        let db, client;
        try {
            client = await MongoClient.connect(config.mongoDbUrl, { useNewUrlParser: true });
            db = client.db(config.dbname);
            return await db.collection("user").insertOne(data);
        } finally {
            client.close();
        }
    }
};
