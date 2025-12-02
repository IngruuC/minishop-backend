const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  try {
    await resend.emails.send({
      from: 'MiniShop <onboarding@resend.dev>', // Email por defecto de Resend
      to: email,
      subject: 'Recuperar Contraseña - MiniShop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">MiniShop</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Recuperar Contraseña</h2>
            <p style="color: #666;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.</p>
            <p style="color: #999; font-size: 12px;">Link: ${resetUrl}</p>
          </div>
        </div>
      `
    });
    console.log('✅ Email enviado correctamente a:', email);
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};

module.exports = { sendResetPasswordEmail };