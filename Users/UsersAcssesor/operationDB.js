const { getMongoClient,connectToDatabase } = require('./connectDB');

const connectDB = async () => {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB database.');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
    }
};

const addUser = async (userId, name, email, password, keywords, language, country, category, callback) => {
    try {
        await connectToDatabase()
        const mongoClient = getMongoClient();
        await mongoClient.db('admin').collection('users').insertOne({
            userId,
            name,
            email,
            password,
            keywords,
            language,
            country,
            category
        });
        console.log(`User ${userId} added successfully`);
        callback(null, `User ${userId} added successfully`);
    } catch (err) {
        console.error('Error inserting user:', err.message);
        callback(err);
    }
};

const updateUser = async (userId, name, email, password, keywords, language, country, category, callback) => {
    try {
        const fields = { name, email, password, keywords, language, country, category };
        const updates = Object.entries(fields).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) acc[key] = value;
            return acc;
        }, {});

        if (Object.keys(updates).length === 0) {
            return callback(null, `No valid fields to update for user ${userId}`);
        }
        await connectToDatabase()
        const mongoClient = getMongoClient();

        const result = await mongoClient.db('admin').collection('users').updateOne(
            { userId },
            { $set: updates }
        );
        console.log({result});
        
        if (result.matchedCount === 0) {
            callback(null, `User ${userId} not found`);
        } else {
            console.log(`User ${userId} updated successfully`);
            callback(null, `User ${userId} updated successfully`);
        }
    } catch (err) {
        console.error('Error updating user:', err.message);
        callback(err);
    }
};
const getUser = async (email, password, callback) => {
    try {
        await connectToDatabase()
        const mongoClient = getMongoClient();
        const user = await mongoClient.db('admin').collection('users').findOne({ email, password });
        console.log({ user });
        callback(user);
    } catch (err) {
        console.error('Error fetching user:', err.message);
        callback(null);
    }
};

const closeDB = async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed successfully.');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
    }
};
module.exports = {
    connectDB,
    addUser,
    updateUser,
    getUser,
    closeDB
};