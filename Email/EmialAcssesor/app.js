const express = require('express');
const amqp = require('amqplib'); 
const app = express();
const { sendEmailWithNews } = require('./emailApi'); // Import the email sending function
app.use(express.json());
let RABBITMQ_URL; // Global variable for RabbitMQ URL

// Determines the RabbitMQ URL based on whether the app is running in Docker or locally
(async () => {
  const isDocker = (await import('is-docker')).default;
  RABBITMQ_URL = isDocker() ? 'amqp://rabbitmq' : 'amqp://localhost';
  console.log(`Using RabbitMQ URL: ${RABBITMQ_URL}`);

  // Start listening to the queue after determining the RabbitMQ URL
  listenToQueue();
})();

const ACCESSOR_QUEUE = 'email_queue';

// Listens for messages in the RabbitMQ queue and processes them
async function listenToQueue() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ACCESSOR_QUEUE, { durable: true });

  console.log(`Accessor is waiting for messages in ${ACCESSOR_QUEUE}. To exit press CTRL+C`);
  
  // Consumes messages from the queue
  channel.consume(
    ACCESSOR_QUEUE,
    async (msg) => {
      try {
        const { email, name, newsItemsHTML } = JSON.parse(msg.content.toString()); // Extracts email data

        // Sends email with the news items to the recipient
        sendEmailWithNews(email, name, newsItemsHTML);
        channel.ack(msg); // Acknowledges that the message was successfully processed
      } catch (error) {
        console.error('Error processing message:', error.message);
      }
    },
    { noAck: false } // Acknowledges the message explicitly after processing
  );
}

// Starts the Express server and listens on port 3032
app.listen(3032, () => {
  console.log('EmailAccessor service is running on port 3031');
});
