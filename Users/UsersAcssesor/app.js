const express = require('express');
const app = express();
const { getUser, addUser, updateUser} = require('./userDB'); 
app.use(express.json());
// ניתוב לקבלת משתמש לפי מזהה
app.post('/getUser', async (req, res) => {
    const { email, password } = req.body;
    console.log({email,password});
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

// ניתוב להוספת משתמש חדש
app.post('/addUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country,category } = req.body;
    console.log({ userId, name, email, password, keywords, language, country,category });
    await addUser(userId, name, email, password, keywords, language, country,category, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding user', error: err.message });
        }
        return res.status(201).json({ message: `User ${userId} added successfully` });
    });
});
app.post('/updateUser', async (req, res) => {
    console.log('/updateUser');
    const { name, email, password, keywords, language, country, category } = req.body;

    try {
        getUser(email, password, (user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userId = user.userId;
            updateUser(userId, name, email, password, keywords, language, country, category, (err, response) => {
                if (err) {
                    console.error('Error updating user:', err.message);
                    return res.status(500).json({ message: 'Error updating user', error: err.message });
                }
              return  res.json({ message: `User ${userId} updated successfully` });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});
app.listen(3001, () => {
    console.log('usersAcssesor service is running on port 3001');
});
