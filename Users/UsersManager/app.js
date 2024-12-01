const express = require('express');
const { DaprClient, HttpMethod } = require('@dapr/dapr');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
const daprClient = new DaprClient('127.0.0.1', 3501);
const serviceName = 'usersEngine';
app.get('/', (req, res) => {
    return res.json(true);
})
app.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await daprClient.invoker.invoke(serviceName, 'authenticateUser', HttpMethod.POST, { email, password });
        return res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});
app.post('/v1.0/invoke/usersEngine/method/getUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email, password });
        return res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});
app.post('/v1.0/invoke/usersEngine/method/createUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country, category } = req.body;
    try {
        const response = await daprClient.invoker.invoke(serviceName, 'createUser', HttpMethod.POST, { userId, name, email, password, keywords, language, country, category });
        return res.status(201).json({ message: 'המשתמש נוסף בהצלחה' });
    } catch (err) {

        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});
app.put('/v1.0/invoke/usersEngine/method/updateUser', async (req, res) => {
    const { name, email, password, keywords, language, country, category } = req.body;
    try {
        await daprClient.invoker.invoke(serviceName, 'updateUser', HttpMethod.PUT, { name, email, password, keywords, language, country, category });
        return res.json({ message: `המשתמש ${name} עודכן בהצלחה` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});
app.listen(3003, `0.0.0.0`, () => {
    console.log('USERMANAGER service is running on port 3000');
});
