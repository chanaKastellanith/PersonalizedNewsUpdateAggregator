const { getMongoClient, connectToDatabase } = require('./connectDB'); // Import MongoDB connection utilities

// Function to connect to MongoDB database
const connectDB = async () => {
    try {
        await client.connect(); // Establish connection
        db = client.db(dbName); // Select the database
        console.log('Connected to MongoDB database.');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message); // Handle error
    }
};

// Function to add a new user to the database
const addUser = async (userId, name, email, password, keywords, language, country, category, callback) => {
    try {
        await connectToDatabase(); // Ensure the DB is connected
        const mongoClient = getMongoClient(); // Get MongoDB client

        // Insert new user into the 'users' collection
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
        callback(null, `User ${userId} added successfully`); // Return success
    } catch (err) {
        console.error('Error inserting user:', err.message);
        callback(err); // Return error if any
    }
};

// Function to update an existing user's details
const updateUser = async (userId, name, email, password, keywords, language, country, category, callback) => {
    try {
        const fields = { name, email, password, keywords, language, country, category };
        
        // Filter out undefined or null fields to avoid unnecessary updates
        const updates = Object.entries(fields).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) acc[key] = value;
            return acc;
        }, {});

        // If no valid fields to update, return a message
        if (Object.keys(updates).length === 0) {
            return callback(null, `No valid fields to update for user ${userId}`);
        }

        await connectToDatabase(); // Ensure DB is connected
        const mongoClient = getMongoClient(); // Get MongoDB client

        // Update user in the 'users' collection based on userId
        const result = await mongoClient.db('admin').collection('users').updateOne(
            { userId }, // Search by userId
            { $set: updates } // Update the specified fields
        );
        console.log({ result });

        if (result.matchedCount === 0) {
            callback(null, `User ${userId} not found`); // If no matching user is found
        } else {
            console.log(`User ${userId} updated successfully`);
            callback(null, `User ${userId} updated successfully`); // Success message
        }
    } catch (err) {
        console.error('Error updating user:', err.message);
        callback(err); // Return error if any
    }
};

// Function to get a user by email and password
const getUser = async (email, password, callback) => {
    try {
        await connectToDatabase(); // Ensure DB is connected
        const mongoClient = getMongoClient(); // Get MongoDB client

        // Find the user based on email and password
        const user = await mongoClient.db('admin').collection('users').findOne({ email, password });
        console.log({ user });
        callback(user); // Return user data
    } catch (err) {
        console.error('Error fetching user:', err.message);
        callback(null); // Return null if user is not found
    }
};
const getUserByName = async (email, name, callback) => {
    try {
        await connectToDatabase(); // Ensure DB is connected
        const mongoClient = getMongoClient(); // Get MongoDB client
        // Find the user based on email and password
        const user = await mongoClient.db('admin').collection('users').findOne({ email, name });
        console.log({ user });
        callback(user); // Return user data
    } catch (err) {
        console.error('Error fetching user:', err.message);
        callback(null); // Return null if user is not found
    }
};

// Function to close the database connection
const closeDB = async () => {
    try {
        await client.close(); // Close the connection
        console.log('MongoDB connection closed successfully.');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err.message); // Handle error
    }
};

// Export the database functions for use in other parts of the application
module.exports = {
    connectDB,
    addUser,
    updateUser,
    getUser,
    getUserByName,
    closeDB
};
