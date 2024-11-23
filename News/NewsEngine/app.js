const express = require('express');
const amqp = require('amqplib'); // ספריית RabbitMQ
const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost'; // כתובת RabbitMQ
const ENGINE_QUEUE = 'engine_response_queue'; // תור ה-Engine

// התחברות ל-RabbitMQ והאזנה לתור התשובות
async function listenToQueue() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(ENGINE_QUEUE, { durable: true });

    console.log(`ENGINE is waiting for messages in ${ENGINE_QUEUE}. To exit press CTRL+C`);

    channel.consume(ENGINE_QUEUE, async (msg) => {
        const response = JSON.parse(msg.content.toString());
        console.log('Received response from Accessor:', response);


       
        const processedResponse = `Processed: ${JSON.stringify(response)}`;

        console.log('Final processed response:', processedResponse);
    }, { noAck: true });
}

// התחלת האזנה
listenToQueue();

app.listen(3021, () => {
    console.log('NewsEngine service is running on port 3021');
});
