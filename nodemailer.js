const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config/config.env' });
const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: process.env.USERNAME, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
    },
  });

  let mailOptions = {
    from: process.env.SENDER, // sender address
    to: `"EDEK Moving" < ${process.env.RECEIVER}>`, // list of receivers
    subject: 'New Quote Request',
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
