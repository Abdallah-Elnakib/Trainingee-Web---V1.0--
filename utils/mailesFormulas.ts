import mailSender from './mailSender';

export async function sendVerificationEmail(email: string, token: string) {
    try {
      const resetPasswordUrl = `http://auth-service:3000/reset-password?token=${token}`;
      const mailResponse = await mailSender(
        email,
        "Reset Password",
        `<h1>Reset Your Password</h1>
         <p>Click the button below to reset your password:</p>
         <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">Reset Password</a>`
      );
  
  } catch (error) {
      console.log("Error occurred while sending email: ", error);
      throw error;
    }
}