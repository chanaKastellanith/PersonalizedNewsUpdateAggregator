const express = require('express');
const amqp = require('amqplib');
const app = express();
app.use(express.json());
let RABBITMQ_URL;

(async () => {
    const isDocker = (await import('is-docker')).default;
    RABBITMQ_URL = isDocker() ? 'amqp://rabbitmq' : 'amqp://localhost'; // Determines RabbitMQ URL based on whether it's running in Docker or not
    console.log(`Using RabbitMQ URL: ${RABBITMQ_URL}`);

    listenToQueue(); // Starts listening to the message queue
})();

const NEWS_ACSSESOR_AI_ENGINE = 'news_acssesor_ai_engine';
const AI_ENGINE_ACSSESOR = 'ai_engine_acssesor';
const AI_ENGINE_NEWS_MANAGER = 'ai_engine_news_manager'; 

// Publishes a message to  AI_ENGINE_ACSSESOR queue and waits for a response
async function publishToQueueAndWaitForResponse(message) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const responseQueue = 'response_queue'; // Queue to receive the response
    const correlationId = generateUuid(); // Generates a unique ID to track the message and response

    await channel.assertQueue(responseQueue, { durable: true });
    await channel.assertQueue(AI_ENGINE_ACSSESOR, { durable: true });

    console.log('Publishing message to AI_ENGINE_ACSSESOR and waiting for response...');
    
    // Sends the message to the AI engine for processing
    channel.sendToQueue(AI_ENGINE_ACSSESOR, Buffer.from(JSON.stringify(message)), {
        replyTo: responseQueue, // Specifies the queue to get the response from
        correlationId, // Links the request and response with the unique ID
    });

    return new Promise((resolve, reject) => {
        channel.consume(
            responseQueue, // Listens to the response queue
            (msg) => {
                if (msg.properties.correlationId === correlationId) { // Matches the response with the request
                    console.log('Received response:', msg.content.toString());
                    resolve(JSON.parse(msg.content.toString())); // Resolves with the response content
                    channel.close();
                    connection.close();
                }
            },
            { noAck: true } // Automatically acknowledges the message once it's processed
        );
    });
}

// Publishes the processed response to the news manager queue
async function publishToNewsManagerQueue(response) {
    console.log({response});
    
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(AI_ENGINE_NEWS_MANAGER, { durable: true });

    console.log('Publishing response to AI_ENGINE_NEWS_MANAGER...');
    // Sends the response to the news manager for further processing
    channel.sendToQueue(AI_ENGINE_NEWS_MANAGER, Buffer.from(JSON.stringify(response)));

    await channel.close();
    await connection.close();
}

// Generates a unique identifier for correlation between request and response
function generateUuid() {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

// Listens for incoming messages and processes them
async function listenToQueue() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(NEWS_ACSSESOR_AI_ENGINE, { durable: true });
    console.log(`Accessor is waiting for messages in ${NEWS_ACSSESOR_AI_ENGINE}. To exit press CTRL+C`);

    // Consumes messages from the queue, processes them, and sends the response to the next stage
    channel.consume(
        NEWS_ACSSESOR_AI_ENGINE,
        async (msg) => {
            try {
                const { userNews } = JSON.parse(msg.content.toString()); // Extracts the user news from the message
                console.log({userNews});
                
                const response = await publishToQueueAndWaitForResponse(userNews); // Processes the user news with AI

                console.log('Processed response:', response);

                await publishToNewsManagerQueue(response); // Sends the processed response to the news manager

                channel.ack(msg); // Acknowledges that the message has been processed
            } catch (error) {
                console.error('Error processing message:', error.message);
            }
        },
        { noAck: false } // Ensures messages are acknowledged after processing
    );
}

app.listen(3040, () => {
    console.log('AI engine service is running on port 3040');
});
