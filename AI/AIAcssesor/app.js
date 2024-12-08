const express = require('express');
const amqp = require('amqplib');
const app = express();
const { sendMessage } = require('./AI')
app.use(express.json());
let RABBITMQ_URL; // Global variable to hold the RabbitMQ URL

// Immediately invoked async function to check if the app is running inside a Docker container
(async () => {
    const isDocker = (await import('is-docker')).default; // Dynamically import 'is-docker' to check for Docker environment
    RABBITMQ_URL = isDocker() ? 'amqp://rabbitmq' : 'amqp://localhost'; // Set RabbitMQ URL based on the environment
    console.log(`Using RabbitMQ URL: ${RABBITMQ_URL}`); // Log the RabbitMQ URL being used

    // Start listening to the RabbitMQ queue after setting the URL
    listenToQueue();
})();

const AI_ENGINE_ACSSESOR = 'ai_engine_acssesor';

async function listenToQueue() {
    const connection = await amqp.connect(RABBITMQ_URL); // Connect to RabbitMQ using the determined URL
    const channel = await connection.createChannel(); // Create a channel to interact with RabbitMQ
    await channel.assertQueue(AI_ENGINE_ACSSESOR, { durable: true }); // Ensure the queue exists with durability enabled
    console.log(`Accessor is waiting for messages in ${AI_ENGINE_ACSSESOR}. To exit press CTRL+C`);

    channel.consume(
        AI_ENGINE_ACSSESOR, // The queue to consume messages from
        async (msg) => { // Callback function to handle incoming messages
            const { user, ...newsItems } = JSON.parse(msg.content.toString()); // Parse the message content and extract user and news items
            try {
                // Create a summary of the news items
                const newsSummaries = Object.values(newsItems)
                    .map((item, index) =>
                        `News ${index + 1}:\nTitle: ${item.title}\nDescription: ${item.description}\nURL: ${item.url}\n`
                    )
                    .join("\n");

                // Send the news  to the AI service
                const result = await sendMessage(`Give me a summary from news:\n\n${newsSummaries}`);
                if (msg.properties.replyTo) { // If there is a replyTo property in the message, send a reply
                    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({ user, result, newsItems })), {
                        correlationId: msg.properties.correlationId, // Include the correlationId for response matching
                    });
                }

                channel.ack(msg); // Acknowledge that the message has been processed
            } catch (error) {
                console.error('Error processing message:', error.message); // Log any errors during message processing
            }
        },
        { noAck: false } // Ensure the message is acknowledged after processing
    );
}
// Start the Express server on port 3042
app.listen(3042, () => {
    console.log('EmailAccessor service is running on port 3001');
});
