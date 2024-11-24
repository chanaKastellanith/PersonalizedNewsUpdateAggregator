const express = require('express');
const { generateHTMLContent } = require('./generateHTMLContent');
const amqp = require('amqplib'); // ספריית RabbitMQ
const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost'; // כתובת RabbitMQ
const SEND_EMAIL_QUEUE = 'engine_response_queue'; // שם התור לקבלת בקשות
const ENGINE_QUEUE = 'email_queue'; // שם התור להעברת הודעות ל-Accessor

// התחברות ל-RabbitMQ ושליחת הודעה לתור
async function publishToQueue(message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ENGINE_QUEUE, { durable: true });

  channel.sendToQueue(ENGINE_QUEUE, Buffer.from(JSON.stringify(message)));
  console.log('Message sent to ENGINE_QUEUE:', message);

  await channel.close();
  await connection.close();
}

// התחברות ל-RabbitMQ והאזנה ל-send_email_queue
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
        console.log({newsItems});
        console.log({name,email});
        
        
        if (!name || !email ) {
          console.error('Invalid message structure:', msg.content.toString());
          return channel.ack(msg); // מאשר את ההודעה כדי למנוע עיבוד מחדש
        }
        const newsItemsArray = Object.values(newsItems);

        const newsItemsHTML = generateHTMLContent(newsItemsArray);
        const processedMessage = { email, name, newsItemsHTML };

        // שליחת המידע המעובד לתור השני
        await publishToQueue(processedMessage);
        console.log('Processed and forwarded message:', processedMessage);

        channel.ack(msg); // מאשר את ההודעה
      } catch (error) {
        console.error('Error processing message:', error.message);
        // לא מאשר את ההודעה כדי להחזיר אותה לתור (או אפשר להגדיר טיפול נוסף)
      }
    },
    { noAck: false } // דורש אישור ידני כדי למנוע איבוד הודעות
  );
}

// התחלת האזנה לתור
listenToQueue();

app.listen(3031, () => {
  console.log('EmailEngine service is running on port 3001');
});
