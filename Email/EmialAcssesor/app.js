const express = require('express');
const amqp = require('amqplib'); // ספריית RabbitMQ
const app = express();
const {sendEmailWithNews}=require('./emailApi')
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost'; // כתובת RabbitMQ
const ACCESSOR_QUEUE = 'email_queue'; // שם התור

// התחברות ל-RabbitMQ והאזנה להודעות בתור
async function listenToQueue() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ACCESSOR_QUEUE, { durable: true });

  console.log(`Accessor is waiting for messages in ${ACCESSOR_QUEUE}. To exit press CTRL+C`);
  channel.consume(
    ACCESSOR_QUEUE,
    async (msg) => {
      console.log('aaa');
      
      const { email, name, newsItemsHTML } = JSON.parse(msg.content.toString());
      console.log('Received message:', { email, name, newsItemsHTML });

      try {
        sendEmailWithNews(email, name, newsItemsHTML);
        channel.ack(msg); // מאשר את ההודעה כדי להסיר אותה מהתור
      } catch (error) {
        console.error('Error processing message:', error.message);
      }
    },
    { noAck: false } // דורש אישור ידני להודעות
  );
}

// התחלת האזנה לתור
listenToQueue();

app.listen(3032, () => {
  console.log('EmailAccessor service is running on port 3001');
});
