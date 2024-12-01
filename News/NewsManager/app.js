const express = require('express');
const amqp = require('amqplib/callback_api');
const { DaprClient, HttpMethod } = require('@dapr/dapr');   
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
const RABBITMQ_URL = 'amqp://localhost'; 
const ACCESSOR_QUEUE = 'newsqueue'; 
const daprClient = new DaprClient('127.0.0.1', 3502); 
const serviceName = 'usersManager';
function sendToQueue(message) {
    return new Promise((resolve, reject) => {
        amqp.connect(RABBITMQ_URL, (error0, connection) => {
            if (error0) {
                reject('Error connecting to RabbitMQ:', error0);
                return;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    reject('Error creating RabbitMQ channel:', error1);
                    return;
                }
                channel.assertQueue(ACCESSOR_QUEUE, {
                    durable: true  
                });

                channel.sendToQueue(ACCESSOR_QUEUE, Buffer.from(JSON.stringify(message)), {
                    persistent: true 
                });

                console.log(' [x] Sent message to ACCESSOR queue:', message);
                resolve();
            });
        });
    });
}

app.post('/newsrequest', async (req, res) => {
    const {name,email,password} = req.body;
    try {
        const user = await daprClient.invoker.invoke(serviceName, 'authenticateUser', HttpMethod.POST, { email ,password}); 
        
        const { category, keywords, country, channel } = user.user.user;
        
        const message = {name,email, category, keywords, country, channel };
        await sendToQueue(message); 
        res.status(200).send({ message: 'בקשתך התקבלה , כבר תקבל את החדשות היומיות למייל לפי העדפותיך' });
    } catch (error) {
        console.error('Error adding request to queue:', error);
        res.status(500).send({ message: 'Error adding request to queue' });
    }
});

const PORT = 3022;
app.listen(PORT, () => console.log(`NEWSMANAGER is running on port ${PORT}`));
