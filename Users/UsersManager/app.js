const express = require('express');
const { DaprClient, HttpMethod } = require('@dapr/dapr'); // Importing Dapr client and HTTP method constants
const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests

// CORS setup to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header
    next(); // Move to the next middleware
});

const daprClient = new DaprClient('127.0.0.1', 3501); // Create a Dapr client connected to localhost:3501
const serviceName = 'usersEngine'; // Service name for user-related operations

// Simple health check route
app.get('/', (req, res) => {
    return res.json(true); // Return 'true' for health check
});

// Route to authenticate user by email and password
app.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body; // Extract email and password from request body
    console.log({ email, password }); // Log the credentials for debugging

    try {
        // Call the 'authenticateUser' method on the 'usersEngine' service using Dapr
        const user = await daprClient.invoker.invoke(serviceName, 'authenticateUser', HttpMethod.POST, { email, password });
        console.log({ user }); 

        return res.json({ user }); // Return user data as response
    } catch (err) {
        // Handle errors and return appropriate message
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});

// Route to get a user by email and password (similar to authentication)
app.post('/v1.0/invoke/usersEngine/method/getUser', async (req, res) => {
    const { email, password } = req.body; 
    try {
        // Call 'getUser' method on the 'usersEngine' service
        const user = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email, password });
        return res.json({ user }); // Return user details
    } catch (err) {
        // Handle errors
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});

// Route to create a new user
app.post('/v1.0/invoke/usersEngine/method/createUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country, category } = req.body; // Extract new user data
    try {
        console.log('Attempting to create user');
        // Call the 'createUser' method on the 'usersEngine' service to create a new user
        const response = await daprClient.invoker.invoke(serviceName, 'createUser', HttpMethod.POST, { userId, name, email, password, keywords, language, country, category });
        console.log({ response }); 
        return res.status(201).json({ message: 'User added successfully' }); // Return success response
    } catch (err) {
        console.log({ err }); 
        res.status(500).json({ message: 'Error creating user', error: err.message }); // Return error message
    }
});

// Route to update an existing user's details
app.put('/v1.0/invoke/usersEngine/method/updateUser', async (req, res) => {
    const { name, email, password, keywords, language, country, category } = req.body; // Extract updated user data
    try {
        // Call 'updateUser' method on the 'usersEngine' service to update the user's details
        await daprClient.invoker.invoke(serviceName, 'updateUser', HttpMethod.PUT, { name, email, password, keywords, language, country, category });
        return res.json({ message: `User ${name} updated successfully` }); // Return success message
    } catch (err) {
        console.log(err.message); // Log error
        res.status(500).json({ message: 'Error updating user', error: err.message }); // Return error message
    }
});

// Start the server and listen on port 3003
app.listen(3003, `0.0.0.0`, () => {
    console.log('USERMANAGER service is running on port 3003');
});
