const express = require('express');
const app = express();
const { getUser, addUser, updateUser } = require('./operationDB'); 
app.use(express.json());

app.post('/getUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        getUser(email, password, (user) => {
            if (user) {
                return res.status(201).json(user);
            } else {
                res.status(202).json(null);
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});


app.post('/addUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country, category } = req.body;
    await addUser(userId, name, email, password, keywords, language, country, category, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding user', error: err.message });
        }
        return res.status(201).json({ message: `User ${userId} added successfully` });
    });
});

app.post('/updateUser', async (req, res) => {
    const { name, email, password, keywords, language, country, category } = req.body;

    try {
       await getUser(email, password, (user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userId = user.userId;
            updateUser(userId, name, email, password, keywords, language, country, category, (err, response) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating user', error: err.message });
                }
                
                return res.json({ message: response });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});

app.listen(3001, () => {
    console.log('usersAccessor service is running on port 3001');
});
