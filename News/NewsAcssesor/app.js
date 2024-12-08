const express = require('express');
const amqp = require('amqplib'); 
const { getNews } = require('./apiNews'); // Import the function to fetch news
const app = express();
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

// Queue names for communication
const NEWS_MANAGER_ACSSESOR = 'news_managerer_acssesor'; 
const NEWS_ACSSESOR_AI_ENGINE = 'news_acssesor_ai_engine';

// Listens for messages in the RabbitMQ queue and processes them
async function listenToQueue() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(NEWS_MANAGER_ACSSESOR, { durable: true });
    await channel.assertQueue(NEWS_ACSSESOR_AI_ENGINE, { durable: true });

    console.log(`Accessor is waiting for messages in ${NEWS_MANAGER_ACSSESOR}. To exit press CTRL+C`);

    // Consumes messages from the queue
    channel.consume(NEWS_MANAGER_ACSSESOR, async (msg) => {
        const { name, email, category, keywords, country } = JSON.parse(msg.content.toString()); // Extracts user data
        try {
            // Calls the API to fetch news based on user preferences
            const news = await getNews(category, keywords, country);
            const userNews = {
                ...news, // Combines fetched news with user data
                user: {
                  name: name, 
                  email: email, 
                },
              };
              
              console.log({ userNews });

              // Sends the user’s news data to another queue for further processing
              channel.sendToQueue(NEWS_ACSSESOR_AI_ENGINE, Buffer.from(JSON.stringify({ userNews })), {
                persistent: true, // Ensures message durability
              });
            console.log('Response sent to ENGINE queue');

        } catch (err) {
            console.error('Error fetching news:', err.message);
        }
    }, { noAck: true }); // Acknowledges the message automatically
}

// Starts the Express server and listens on port 3020
app.listen(3020, () => {
    console.log('Accessor service is running on port 3020');
});
