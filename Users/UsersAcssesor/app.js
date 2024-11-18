const express = require('express');
const app = express();
const { getUser, addUser, updateUser, deleteUser, getAllUsersAsync } = require('./userDB'); // הייבוא מ-usersDB
app.use(express.json());
// ניתוב לקבלת משתמש לפי מזהה
app.post('/getUser', async (req, res) => {
    const { userId, email } = req.body;
    try {
        getUser(userId, email, (user) => {
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

// ניתוב להוספת משתמש חדש
app.post('/addUser', async (req, res) => {
    const { userId, name, email, password } = req.body;
    console.log({ userId, name, email, password });
    await addUser(userId, name, email, password, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding user', error: err.message });
        }
        return res.status(201).json({ message: `User ${userId} added successfully` });
    });
});

// ניתוב לעדכון פרטי משתמש
app.post('/updateUser', async (req, res) => {
    console.log('/updateUser');
    const { userId, name, email, password } = req.body;
    console.log({ userId, name, email, password });
    try {
        getUser(userId, email, (user) => {
            if (!user)
                return res.status(404).json({ message: 'User not found' });
        });
        updateUser(userId, name, email, password, (err, response) => {
            if (err) {
                console.error('Error updating user:', err.message);
                console.log({response});
                return res.status(500).json({ message: 'Error updating user', error: err.message });
            }});
         
            
        res.json({ message: `User ${userId} updated successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});

// ניתוב למחיקת משתמש
app.listen(3001, () => {
    console.log('usersAcssesor service is running on port 3001');
});
