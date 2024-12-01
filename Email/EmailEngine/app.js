const express = require('express');
const { generateHTMLContent } = require('./generateHTMLContent');
const amqp = require('amqplib'); 
const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://rabbitmq';  // במקום 'localhost'
const SEND_EMAIL_QUEUE = 'engine_response_queue'; // שם התור לקבלת בקשות
const ENGINE_QUEUE = 'email_queue'; // שם התור להעברת הודעות ל-Accessor

async function publishToQueue(message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ENGINE_QUEUE, { durable: true });

  channel.sendToQueue(ENGINE_QUEUE, Buffer.from(JSON.stringify(message)));
  console.log('Message sent to ENGINE_QUEUE:', message);

  await channel.close();
  await connection.close();
}

async function listenToQueue() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(SEND_EMAIL_QUEUE, { durable: true });

  console.log(`Listening for messages in ${SEND_EMAIL_QUEUE}. To exit press CTRL+C`);

  channel.consume(
    SEND_EMAIL_QUEUE,
    async (msg) => {
      try {
        const { user, ...newsItems } = JSON.parse(msg.content.toString());
        const { name: name, email: email } = user;
        
        
        if (!name || !email ) {
          console.error('Invalid message structure:', msg.content.toString());
          return channel.ack(msg); 
        }
        const newsItemsArray = Object.values(newsItems);

        const newsItemsHTML = generateHTMLContent(newsItemsArray);
        const processedMessage = { email, name, newsItemsHTML };

        await publishToQueue(processedMessage);
        console.log('Processed and forwarded message:', processedMessage);

        channel.ack(msg); 
      } catch (error) {
        console.error('Error processing message:', error.message);
      }
    },
    { noAck: false } 
  );
}

listenToQueue();
app.listen(3031, () => {
  console.log('EmailEngine service is running on port 3001');
});
