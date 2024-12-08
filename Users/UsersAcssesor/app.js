const express = require('express');
const app = express();
const { getUser, addUser, updateUser, getUserByName } = require('./operationDB'); // Import functions for DB operations
app.use(express.json());

// Route to get user by email and password
app.post('/getUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Get user from the database
        getUser(email, password, (user) => {
            if (user) {
                console.log({ user });
                return res.status(201).json(user); // Return user details if found
            } else {
                res.status(202).json(null); // No user found
            }
        });
    } catch (err) {
        console.log({ err });
        res.status(500).json({ message: 'Error fetching users', error: err.message }); // Handle error
    }
});
app.post('/getUserByName', async (req, res) => {
    const { email, name } = req.body;
    try {
        // Get user from the database
        getUserByName(email, name, (user) => {
            if (user) {
                console.log({ user });
                return res.status(201).json(user); // Return user details if found
            } else {
                res.status(202).json(null); // No user found
            }
        });
    } catch (err) {
        console.log({ err });
        res.status(500).json({ message: 'Error fetching users', error: err.message }); // Handle error
    }
});

// Route to add a new user
app.post('/addUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country, category } = req.body;
    await addUser(userId, name, email, password, keywords, language, country, category, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding user', error: err.message }); // Handle error
        }
        return res.status(201).json({ message: `User ${userId} added successfully` }); // Success message
    });
});

// Route to update an existing user's details
app.post('/updateUser', async (req, res) => {
    const { name, email, password, keywords, language, country, category } = req.body;

    try {
        // First, get the user to ensure they exist
        await getUser(email, password, (user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' }); // If user not found
            }
            const userId = user.userId; // Get user ID from existing user details

            // Update the user with the new details
            updateUser(userId, name, email, password, keywords, language, country, category, (err, response) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating user', error: err.message }); // Handle error
                }
                return res.json({ message: response }); // Return success message
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message }); // Handle error
    }
});

// Start the Express server on port 3001
app.listen(3001, () => {
    console.log('usersAccessor service is running on port 3001'); // Log server start
});
