const express = require('express');
const amqp = require('amqplib/callback_api'); // Importing RabbitMQ client
const { DaprClient, HttpMethod, LogLevel } = require('@dapr/dapr'); // Dapr client for invoking services
const app = express();
app.use(express.json());

// Middleware to allow CORS for all origins and specific HTTP methods
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const RABBITMQ_URL = 'amqp://localhost'; // URL for RabbitMQ
const NEWS_MANAGER_ACSSESOR = 'news_managerer_acssesor'; // Queue for news requests
const AI_ENGINE_NEWS_MANAGER = 'ai_engine_news_manager'; // Queue for AI engine responses
const NEWS_MANAGER_EMAIL_ENGINE = 'news_manager_email_engine'; // Queue for sending news emails
const daprClient = new DaprClient('127.0.0.1', 3502); // Dapr client instance
const serviceName = 'usersEngine'; // Service name for Dapr invocations

// Function to send a message to a specified RabbitMQ queue
function sendToQueue(queueName, message) {
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
                channel.assertQueue(queueName, { durable: true });
                channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
                console.log(` Sent message to ${queueName}:`, message);
                resolve();
            });
        });
    });
}
// Function to listen to the response queue for processed AI engine messages
function listenToResponseQueue() {
    amqp.connect(RABBITMQ_URL, (error0, connection) => {
        if (error0) {
            console.error('Error connecting to RabbitMQ:', error0);
            return;
        }
        connection.createChannel((error1, channel) => {
            if (error1) {
                console.error('Error creating RabbitMQ channel:', error1);
                return;
            }
            channel.assertQueue(AI_ENGINE_NEWS_MANAGER, { durable: true });

            console.log(`Listening for responses in ${AI_ENGINE_NEWS_MANAGER}`);

            // Consumes messages from the AI engine queue
            channel.consume(
                AI_ENGINE_NEWS_MANAGER,
                (msg) => {
                    try {
                        const response = JSON.parse(msg.content.toString());
                        console.log('Received response from AI Engine:', response);
                        // Send the response to the Email Engine queue
                        sendToQueue(NEWS_MANAGER_EMAIL_ENGINE, response)
                            .then(() => {
                                console.log('Response sent to EmailEngine');
                            })
                            .catch((error) => {
                                console.error('Error sending response to EmailEngine:', error);
                            });
                    } catch (error) {
                        console.error('Error processing response message:', error.message);
                    }
                },
                { noAck: true } // Automatically acknowledges the message
            );
        });
    });
}

// Start listening to the response queue
listenToResponseQueue();

// Route for submitting a news request
app.post('/newsrequest', async (req, res) => {
    console.log('new manager');

    const { name, email, password } = req.body;
    console.log({ name, email, password });
    
    let user;
    try {
        if (!password) {
            console.log({password});
            // Authenticate the user via Dapr invocation
             user = await daprClient.invoker.invoke(serviceName, 'authenticateUser', HttpMethod.POST, { email, name });
           console.log({ user });
        }
        else{
             user = await daprClient.invoker.invoke(serviceName, 'getUser', HttpMethod.POST, { email, password });
           console.log({ user });
        }
        const { category, keywords, country, channel } = user.user;
        console.log({ category, keywords, country, channel });
        
        // Prepare the message to be sent to the news request queue
        const message = { name, email, category, keywords, country, channel };
        await sendToQueue(NEWS_MANAGER_ACSSESOR, message);

        res.status(200).send({ message: 'בקשתך התקבלה. כבר תקבל את החדשות למייל לפי העדפותיך' });
    } catch (error) {
        console.error('Error adding request to queue:', error);
        res.status(500).send({ message: 'Error adding request to queue' });
    }
});

// Start the server on port 3022
const PORT = 3022;
app.listen(PORT, () => console.log(`NEWSMANAGER is running on port ${PORT}`));
