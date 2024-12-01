const express = require('express');
const amqp = require('amqplib'); 
const app = express();
const {sendEmailWithNews}=require('./emailApi')
app.use(express.json());
let RABBITMQ_URL; // הגדרה גלובלית של המשתנה

(async () => {
  const isDocker = (await import('is-docker')).default;
  RABBITMQ_URL = isDocker() ? 'amqp://rabbitmq' : 'amqp://localhost';
  console.log(`Using RabbitMQ URL: ${RABBITMQ_URL}`);

  // התחלת האזנה לתור לאחר קביעת ה-URL
  listenToQueue();
})();



// const RABBITMQ_URL = 'amqp://rabbitmq';  // במקום 'localhost'
const ACCESSOR_QUEUE = 'email_queue';


async function listenToQueue() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ACCESSOR_QUEUE, { durable: true });

  console.log(`Accessor is waiting for messages in ${ACCESSOR_QUEUE}. To exit press CTRL+C`);
  channel.consume(
    ACCESSOR_QUEUE,
    async (msg) => {
      
      const { email, name, newsItemsHTML } = JSON.parse(msg.content.toString());
      try {
        sendEmailWithNews(email, name, newsItemsHTML);
        channel.ack(msg); 
      } catch (error) {
        console.error('Error processing message:', error.message);
      }
    },
    { noAck: false } 
  );
}


app.listen(3032, () => {
  console.log('EmailAccessor service is running on port 3001');
});
