const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // to link the key we define the key in dev.env
// sgMail.send({
//   // to send an individual email
//   to: "",
//   from: "",
//   subject: "This is my first creation!",
//   text: "I hope this one actually get to you .",
// });
//L132
const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    // to send an individual email
    to: email,
    from: "omaralsaleh1129@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along wit the app.`, // you should use this quotes to make this method for variables
    //html: // to send html code
  });
};
const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "omaralsaleh1129@gmail.com",
    subject: "cancellation message",
    text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
  });
};
module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
