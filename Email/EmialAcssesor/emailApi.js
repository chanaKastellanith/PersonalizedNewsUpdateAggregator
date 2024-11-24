const Mailjet = require('node-mailjet');
// התחברות ל-API של Mailjet עם המפתחות שלך
const mailjet = Mailjet.apiConnect(
  '8e065c70d0fcaf55b13e8ced06669f38',
  '72f51c5ee8edfe5082f6fc0a81ac48d1'
);

// שליחת אימייל מעוצב
const sendEmailWithNews = (toEmail, toName, newsItems) => {
  if (!toEmail || !newsItems || newsItems.length === 0) {
    console.error("Missing required parameters: 'toEmail' or 'newsItems'");
    return;
  }


  const request = mailjet
    .post('send', { version: 'v3.1' })
    .request({
      Messages: [
        {
          From: {
            Email: '4163233@gmail.com',
            Name: 'Chana Kastellanitz',
          },
          To: [
            {
              Email: toEmail,
              Name: toName || 'Recipient',
            },
          ],
          Subject: 'Your Daily News Update',
          HTMLPart: newsItems,
          CustomID: 'NewsUpdateEmail',
        },
      ],
    });

  request
    .then((result) => {
        console.log('Email sent successfully:', result.body.Messages[0].To);
        return 'Email sent successfully:'
    })
    .catch((err) => {
      console.error('Error sending email:', err.statusCode, err.message);
      return err.message;
    });
};

module.exports={sendEmailWithNews}
