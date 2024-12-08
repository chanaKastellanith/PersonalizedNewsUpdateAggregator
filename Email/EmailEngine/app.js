const express = require('express');
const { generateHTMLContent } = require('./generateHTMLContent');
const amqp = require('amqplib'); 
const app = express();
app.use(express.json());
let RABBITMQ_URL;

// Checks if the app is running inside Docker and adjusts the RabbitMQ URL accordingly
(async () => {
  const isDocker = (await import('is-docker')).default;
  RABBITMQ_URL = isDocker() ? 'amqp://rabbitmq' : 'amqp://localhost';
  console.log(`Using RabbitMQ URL: ${RABBITMQ_URL}`);
  listenToQueue(); // Starts listening for messages after determining the RabbitMQ URL
})();

const NEWS_MANAGER_EMAIL_ENGINE = 'news_manager_email_engine';
const SEND_EMAIL_QUEUE = 'engine_response_queue'; 
const ENGINE_QUEUE = 'email_queue'; 

// Sends a message to the RabbitMQ queue
async function publishToQueue(message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ENGINE_QUEUE, { durable: true });

  channel.sendToQueue(ENGINE_QUEUE, Buffer.from(JSON.stringify(message)));
  console.log('Message sent to ENGINE_QUEUE:', message);

  await channel.close();
  await connection.close();
}

// Listens for messages in the RabbitMQ queue and processes them
async function listenToQueue() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(NEWS_MANAGER_EMAIL_ENGINE, { durable: true });

  console.log(`Listening for messages in ${SEND_EMAIL_QUEUE}. To exit press CTRL+C`);

  channel.consume(
    NEWS_MANAGER_EMAIL_ENGINE,
    async (msg) => {
      try {
        const message = JSON.parse(msg.content.toString());  // Parse the message

        // Destructure the user information and news items from the message
        const { user, result, ...newsItems } = message;
        const { name, email } = user;

        // Checks if the user data is valid
        if (!name || !email) {
          console.error('Invalid message structure:', msg.content.toString());
          return channel.ack(msg); 
        }

        // Converts the news items into an array
        const newsItemsArray = Object.values(newsItems);

        // Generates HTML content for the news items
        const newsItemsHTML = generateHTMLContent(name, newsItemsArray, result);

        // Creates the processed message to be forwarded
        const processedMessage = { email, name, newsItemsHTML };
        await publishToQueue(processedMessage);
        console.log('Processed and forwarded message:', processedMessage);

        channel.ack(msg); // Acknowledges the message receipt
      } catch (error) {
        console.error('Error processing message:', error.message);
      }
    },
    { noAck: false } // Does not automatically acknowledge; explicitly done later
  );
}

app.listen(3031, () => {
  console.log('EmailEngine service is running on port 3001');
});
