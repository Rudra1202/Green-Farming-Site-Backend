const nodemailer = require("nodemailer")

const sendEmail = async(subject,message,send_to,sent_from,reply_to) =>{
    var transporter = nodemailer.createTransport({
        service :"gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });
      const option = {
        from: sent_from,
        to: send_to,
        subject: subject, // Subject line
        replyTo: reply_to, // plain text body
        html: message, // html body
      }; 
      transporter.sendMail(option,function (err,info) {
        if (err) {
            console.log(err);
        }
        else console.log(info);
      })
}

module.exports =  sendEmail;