import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

const mailSender = async (options: MailOptions) => {
  const mailOptions = {
    from: options.from || process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default mailSender;