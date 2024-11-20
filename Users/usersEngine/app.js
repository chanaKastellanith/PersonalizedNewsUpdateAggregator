const express = require('express');
const { generateToken, verifyToken, getToken } = require('./tokenGenerator');
const { validateNewUser, validateUserExists } = require('./usersValidation')
const { DaprClient, HttpMethod } = require('@dapr/dapr'); // הייבוא של Dapr SDK
const app = express();
app.use(express.json());
const daprClient = new DaprClient('127.0.0.1', 3500);
const serviceName = 'usersAccessor';
app.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log({ user });
        console.log(user.password, { password });
        if (user.password !== password) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        if (user.userId) {
            // מבצע קריאה אסינכרונית לקבלת הטוקן
            getToken(user.userId, async (token) => {
                if (token) {
                    try {
                        verifyToken(token);  // בדיקת הטוקן
                        return res.json({ message: 'User authenticated successfully',  token });
                    } catch (error) {
                        return res.status(401).json({ message: 'Invalid or expired token' });
                    }
                } else {
                    // אם אין טוקן, ניצור טוקן חדש
                    const newToken = generateToken(user.userId);
                    return res.json({ message: 'User authenticated successfully', token: newToken });
                }
            });
        } else {
            // אם אין userId, יש לוח return רגיל
            return res.json({ message: 'User authenticated successfully', user });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});
app.post('/createUser', async (req, res) => {
    const { userId, name, email, password } = req.body;
    console.log({ userId });
    const newUser = await validateUserExists(userId);
    const validate = await validateNewUser(userId, name, email, password);
    console.log({ newUser });
    if (validate === true && newUser === true) {
        try {
            // שליחת בקשה ל-usersAccessor להוספת המשתמש
            await daprClient.invoker.invoke(serviceName, 'addUser', HttpMethod.POST, { userId, name, email, password });
            const token = generateToken(userId);
            console.log({token});
            
            return res.status(201).json({ message: `User ${userId} created successfully`, token: token });
        } catch (err) {
            res.status(500).json({ message: 'Error creating user', error: err.message });
        }
    }
    else {
        return res.status(400).json({message:{validate, newUser}} );
    }
});
// ניתוב לעדכון משתמש
app.put('/updateUser', async (req, res) => {
    const { userId, name, email, password } = req.body;
    console.log({ userId, name, email, password });
    try {
        const validate = await validateNewUser(userId, name, email, password)
        console.log({validate});
        
        if (validate === true) {
            // שליחת בקשה ל-usersAccessor לבדוק אם המשתמש קיים
            await daprClient.invoker.invoke(serviceName, 'updateUser', HttpMethod.POST, { userId, name, email, password });
            return res.json({ message: `User ${userId} updated successfully` });
        }
        else {
            return res.status(404).json({ validate });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});
app.listen(3002, () => {
    console.log('UsersEngine service is running on port 3002');
});
