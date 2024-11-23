const express = require('express');
const {generateHTMLContent}=require('./generateHTMLContent')
const amqp = require('amqplib'); // ספריית RabbitMQ
const app = express();
app.use(express.json());
const RABBITMQ_URL = 'amqp://localhost'; // כתובת RabbitMQ
const ENGINE_QUEUE = 'email_queue'; // שם התור להעברת הודעות ל-Accessor

// התחברות ל-RabbitMQ ושליחת הודעה לתור
async function publishToQueue(message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(ENGINE_QUEUE, { durable: true });

  channel.sendToQueue(ENGINE_QUEUE, Buffer.from(JSON.stringify(message)));
  console.log('Message sent to queue:', message);

  await channel.close();
  await connection.close();
}

// מסלול לשליחת בקשות
app.post('/send-news', async (req, res) => {
  const { toEmail, toName, newsItems } = req.body;

  if (!toEmail || !Array.isArray(newsItems)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    const newsItemsHTML=generateHTMLContent(newsItems)
    const message = { toEmail, toName, newsItemsHTML };
    await publishToQueue(message);
    res.status(200).json({ message: 'Request sent to EmailAccessor successfully' });
  } catch (error) {
    console.error('Error sending request to queue:', error.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(3000, () => {
  console.log('EmailEngine service is running on port 3000');
});
