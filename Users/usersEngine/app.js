const express = require('express');
const { generateToken, verifyToken, getToken } = require('./tokenGenerator');
const { validateNewUser, validateUserExists } = require('./usersValidation')
const { DaprClient, HttpMethod } = require('@dapr/dapr');
const app = express();
app.use(express.json());
const daprClient = new DaprClient('127.0.0.1', 3500);
const serviceName = 'usersAccessor';
app.get('/',(req, res) => {
   return res.send('true');
})
app.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;    
    try {
        const user = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email ,password});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        if (user.userId) {
            getToken(user.userId, async (token) => {
                if (token) {
                    try {
                        verifyToken(token); 
                        return res.json({ message: 'User authenticated successfully',  token ,user});
                    } catch (error) {
                        return res.status(401).json({ message: 'Invalid or expired token' });
                    }
                } else {
                   
                    const newToken = generateToken(user.userId);
                    return res.json({ message: 'User authenticated successfully', token: newToken });
                }
            });
        } else {
           
            return res.json({ message: 'User authenticated successfully', user });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
});
app.post('/getUser', async (req, res) => {
    const {  email, password} = req.body;
    const newUser = await validateUserExists(email,password);
    if ( newUser) {
        try {
            const user=await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, {  email, password});
            return res.status(201).json({ user });
        } catch (err) {
            res.status(500).json({ message: 'Error get user', error: err.message });
        }
    }
    else {
        return res.status(400).json({message:{ newUser}} );
    }
});
app.post('/createUser', async (req, res) => {
    const { userId, name, email, password, keywords, language, country,category } = req.body;
    const newUser = await validateUserExists(email,password);
    const validate = await validateNewUser( name, email, password);
    if (validate === true && newUser === true) {
        try {
            await daprClient.invoker.invoke(serviceName, 'addUser', HttpMethod.POST, { userId, name, email, password, keywords, language, country,category});
            const token = generateToken(userId);            
            return res.status(201).json({ message: `User ${userId} created successfully`, token: token });
        } catch (err) {
            res.status(500).json({ message: 'Error creating user', error: err.message });
        }
    }
    else {
        return res.status(400).json({message:{validate, newUser}} );
    }
});

app.put('/updateUser', async (req, res) => {
    const { name, email, password, keywords, language, country,category } = req.body;
    try {
        const validate = await validateNewUser(name, email, password)
        if (validate === true) {
            await daprClient.invoker.invoke(serviceName, 'updateUser', HttpMethod.POST, {  name, email, password, keywords, language, country,category });
            return res.json({ message: `User ${name} updated successfully` });
        }
        else {
            return res.status(404).json({ validate });
        }
    } catch (err) {
        
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});
app.listen(3002,`0.0.0.0`, () => {
    console.log('UsersEngine service is running on port 3002');
});
