const express = require('express');
const amqp = require('amqplib'); // גרסה החדשה של amqplib
const { getNews } = require('./apiNews'); // הייבוא של הפונקציה שמביאה חדשות
const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const ACCESSOR_QUEUE = 'newsqueue';
const ENGINE_QUEUE = 'engine_response_queue';

// התחברות ל-RabbitMQ והאזנה לתור
async function listenToQueue() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(ACCESSOR_QUEUE, { durable: true });
    await channel.assertQueue(ENGINE_QUEUE, { durable: true });

    console.log(`Accessor is waiting for messages in ${ACCESSOR_QUEUE}. To exit press CTRL+C`);

    channel.consume(ACCESSOR_QUEUE, async (msg) => {
        const {name,email, category, keywords, country } = JSON.parse(msg.content.toString());
        console.log('Received request from Manager:', { category, keywords, country });

        try {
            // קריאה ל-API כדי לקבל חדשות
            const news = await getNews(category, keywords, country);
            console.log('News fetched:', news);
            const userNews = {
                ...news, // תוכן החדשות
                user: {
                  name: name, // השם של המשתמש
                  email: email, // האימייל של המשתמש
                },
              };
              
              channel.sendToQueue(ENGINE_QUEUE, Buffer.from(JSON.stringify(userNews)), {
                persistent: true,
              });
            console.log('Response sent to ENGINE queue');

        } catch (err) {
            console.error('Error fetching news:', err.message);
        }
    }, { noAck: true });
}
// התחלת האזנה
listenToQueue();

app.listen(3020, () => {
    console.log('Accessor service is running on port 3020');
});
