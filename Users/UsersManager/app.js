const express = require('express');
const { DaprClient, HttpMethod } = require('@dapr/dapr'); // הייבוא של Dapr SDK
const app = express();
app.use(express.json());

const daprClient = new DaprClient('127.0.0.1', 3501); // חיבור ל-DAPR עם הכתובת והפורט המתאימים
const serviceName = 'usersEngine'; // שם השירות שאליו נשלחו הבקשות

// ניתוב לאימות משתמש
app.post('/v1.0/invoke/usersEngine/method/authenticateUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        // שליחת בקשה ל-DAPR לקבלת המשתמש לפי אימייל
        const user = await daprClient.invoker.invoke(serviceName, 'authenticateUser', HttpMethod.POST, { email ,password});
        // אם יש, מחזירים את המידע על המשתמש
        return res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});

// ניתוב ליצירת משתמש חדש
app.post('/v1.0/invoke/usersEngine/method/createUser', async (req, res) => {
    const { userId, name, email, password } = req.body;
    try {
        // שליחת בקשה ל-DAPR להוסיף את המשתמש החדש
       const response= await daprClient.invoker.invoke(serviceName, 'createUser', HttpMethod.POST, { userId, name, email, password });
        return res.status(201).json({ response });
    } catch (err) {
        console.log(err.message);
        
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});

// ניתוב לעדכון פרטי משתמש
app.put('/v1.0/invoke/usersEngine/method/updateUser', async (req, res) => {
    const { userId, name, email, password } = req.body;
    try {
        // שליחת בקשה ל-DAPR לעדכון פרטי המשתמש
       const response= await daprClient.invoker.invoke(serviceName, 'updateUser', HttpMethod.PUT, { userId, name, email, password });
        return res.json({ response });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});
app.listen(3003, () => {
    console.log('USERMANAGER service is running on port 3003');
});
