const express = require('express');
const amqp = require('amqplib/callback_api');  // הוספת ספריית RabbitMQ
const app = express();
app.use(express.json());

// הגדרת RabbitMQ connection
const RABBITMQ_URL = 'amqp://localhost';  // כתובת RabbitMQ
const ACCESSOR_QUEUE = 'newsqueue';  // תור ה-Accessor

// שליחת הודעה ל-RabbitMQ
function sendToQueue(message) {
    return new Promise((resolve, reject) => {
        amqp.connect(RABBITMQ_URL, (error0, connection) => {
            if (error0) {
                reject('Error connecting to RabbitMQ:', error0);
                return;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    reject('Error creating RabbitMQ channel:', error1);
                    return;
                }
                channel.assertQueue(ACCESSOR_QUEUE, {
                    durable: true  // אם אתה רוצה שהתור ישרוד את אתחול ה-RabbitMQ
                });

                // פרסום הודעה לתור
                channel.sendToQueue(ACCESSOR_QUEUE, Buffer.from(JSON.stringify(message)), {
                    persistent: true // אם ברצונך שההודעות ישרדו את אתחול ה-RabbitMQ
                });

                console.log(' [x] Sent message to ACCESSOR queue:', message);
                resolve();
            });
        });
    });
}

// Endpoint לקבלת בקשה
app.post('/newsrequest', async (req, res) => {
    const { category, keywords, country, channel } = req.body;
    try {
        const message = { category, keywords, country, channel };
        await sendToQueue(message);  // שליחה ל-RabbitMQ
        res.status(200).send({ message: 'News request added to queue successfully' });
    } catch (error) {
        console.error('Error adding request to queue:', error);
        res.status(500).send({ message: 'Error adding request to queue' });
    }
});

const PORT = 3022;
app.listen(PORT, () => console.log(`NEWSMANAGER is running on port ${PORT}`));
