let mongoClient;
 
async function connectToDatabase() {
    const { MongoClient } = require('mongodb');
 
    const uri = 'mongodb://localhost:27017';
    const options = { useNewUrlParser: true };
 
    mongoClient = new MongoClient(uri, options);
 
    try {
        await mongoClient.connect();
        console.log('Connected successfully to MongoDB server with user "chana"');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}
 
function getMongoClient() {
    if (!mongoClient) {
        throw new Error('MongoClient is not connected. Call connectToDatabase first.');
    }
    return mongoClient;
}
 
module.exports = { connectToDatabase, getMongoClient };