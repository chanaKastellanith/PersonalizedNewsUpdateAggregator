const express = require('express');
const { DaprClient, HttpMethod } = require('@dapr/dapr'); // הייבוא של Dapr SDK
const { message } = require('statuses');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // מאפשר גישה מכל מקור
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // מאפשר את שיטות הבקשה
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // מאפשר את כותרות הבקשה
    next();
  });
const daprClient = new DaprClient('127.0.0.1', 3501); // חיבור ל-DAPR עם הכתובת והפורט המתאימים
const serviceName = 'usersEngine'; // שם השירות שאליו נשלחו הבקשות

// ניתוב לאימות משתמש
app.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;
    console.log({email,password});
    
    try {
        // שליחת בקשה ל-DAPR לקבלת המשתמש לפי אימייל
        const user = await daprClient.invoker.invoke(serviceName, 'authenticateUser', HttpMethod.POST, { email ,password});
        console.log({user});
        
        // אם יש, מחזירים את המידע על המשתמש
        return res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});
app.post('/v1.0/invoke/usersEngine/method/getUser', async (req, res) => {
    const { email, password } = req.body;
    console.log({email,password});
    try {
        // שליחת בקשה ל-DAPR לקבלת המשתמש לפי אימייל
        const user = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email ,password});
        // אם יש, מחזירים את המידע על המשתמש
        return res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});
// ניתוב ליצירת משתמש חדש
app.post('/v1.0/invoke/usersEngine/method/createUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country,category } = req.body;
    try {
        // שליחת בקשה ל-DAPR להוסיף את המשתמש החדש
       const response= await daprClient.invoker.invoke(serviceName, 'createUser', HttpMethod.POST, { userId,name, email, password, keywords, language, country,category });
       console.log({response});
       
        return res.status(201).json({message:'המשתמש נוסף בהצלחה' });
    } catch (err) {
        console.log(err.message);
        
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});

// ניתוב לעדכון פרטי משתמש
app.put('/v1.0/invoke/usersEngine/method/updateUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country,category } = req.body;
    console.log(userId, name, email, password, keywords, language, country,category);
    try {
        // שליחת בקשה ל-DAPR לעדכון פרטי המשתמש
       const response= await daprClient.invoker.invoke(serviceName, 'updateUser', HttpMethod.PUT, { userId,name, email, password, keywords, language, country,category});
       console.log({response});
       
        return res.json({message:`המשתמש ${userId} עודכן בהצלחה`});
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});
app.listen(3003, `0.0.0.0`,() => {
    console.log('USERMANAGER service is running on port 3003');
});
