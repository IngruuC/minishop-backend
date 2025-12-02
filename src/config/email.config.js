// Función para enviar email de recuperación
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"MiniShop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Recuperación de contraseña - MiniShop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛒 MiniShop</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Recuperación de Contraseña</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Has solicitado resetear tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block;
                      font-weight: bold;
                      font-size: 16px;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Resetear Contraseña
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <strong>⏰ Este enlace expirará en 1 hora.</strong>
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 15px;">
            Si no solicitaste este cambio, ignora este email y tu contraseña permanecerá sin cambios.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 MiniShop. Todos los derechos reservados.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendResetPasswordEmail };