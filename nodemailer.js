const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config/config.env' });
const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport({
    host: process.env.MAILJET_HOST,
    port: 587,
    auth: {
      user: process.env.MAILJET_USERNAME, // generated ethereal user
      pass: process.env.MAILJET_PASSWORD, // generated ethereal password
    },
  });

  let message = {
    from: process.env.MAIL_SENDER, // sender address
    to: `"EDEK Moving" < ${process.env.MAIL_RECEIVER}>`, // list of receivers
    subject: 'Your Quote', // Subject line
    // text: 'hello', // plain text body
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
