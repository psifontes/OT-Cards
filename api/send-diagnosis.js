const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Extraer datos de la estructura de payload solicitada
    const { lead, result, priority, data } = body;
    
    if (!lead || !lead.email) {
      return res.status(400).json({ error: 'El email es obligatorio en el objeto lead' });
    }

    const name = lead.name || 'Usuario';
    const email = lead.email;
    const whatsapp = lead.wa || 'No proporcionado';
    const business = data?.biz || 'Negocio no especificado';
    
    const score = result?.global || 'N/A';
    const band = result?.band || 'Evaluando';
    const top3 = result?.top3 || [];
    const priorityText = priority || 'General';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #0B1B3B; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8E6DF; border-radius: 12px;">
        <h2 style="color: #d4af37; text-align: center;">OT Cards™</h2>
        <p style="text-align: center; color: #6B7790; font-size: 14px; margin-top: -10px;">Tu Identidad Conectada</p>
        
        <h1 style="font-size: 22px; margin-top: 30px;">Hola ${name},</h1>
        <p style="font-size: 16px; line-height: 1.5;">
          Gracias por completar el <strong>Índice de Preparación Digital OT™</strong> para <strong>${business}</strong>. 
          Aquí están los resultados de tu evaluación.
        </p>

        <div style="background: #FAFAF7; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #E8E6DF;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7790; text-transform: uppercase; letter-spacing: 1px;">Tu OT Digital Score™</p>
          <h2 style="margin: 0; font-size: 56px; color: #0B1B3B; font-weight: 700;">${score}/100</h2>
          <span style="display: inline-block; background: rgba(212, 175, 55, 0.15); color: #d4af37; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 600; margin-top: 12px;">
            ${band}
          </span>
        </div>

        <div style="margin: 24px 0;">
          <h3 style="font-size: 18px; color: #0066ff; margin-bottom: 8px;">🎯 Tu principal oportunidad:</h3>
          <p style="font-size: 16px; font-weight: 600; color: #0B1B3B; margin: 0;">${priorityText}</p>
        </div>

        <div style="margin: 24px 0;">
          <h3 style="font-size: 18px; color: #0B1B3B; margin-bottom: 12px;">Tus 3 principales oportunidades:</h3>
          <ul style="padding-left: 20px; color: #3A4A6B; line-height: 1.6;">
            ${top3.length > 0 ? top3.map((item, i) => `<li><strong>${i + 1}. ${item.dim}:</strong> ${item.score}/100</li>`).join('') : '<li>Información no disponible</li>'}
          </ul>
        </div>

        <div style="border-top: 1px solid #E8E6DF; margin-top: 32px; padding-top: 16px; text-align: center;">
          <p style="font-size: 12px; color: #6B7790; margin: 0;">© 2026 OT Cards™ — Tu Identidad Conectada.</p>
        </div>
      </div>
    `;

    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'OT Cards <onboarding@resend.dev>',
      to: [email],
      subject: 'Tu Índice de Preparación Digital OT™ está listo',
      html: htmlContent,
    };

    if (process.env.OT_ADMIN_EMAIL) {
      emailData.bcc = [process.env.OT_ADMIN_EMAIL];
    }

    const dataResend = await resend.emails.send(emailData);
    return res.status(200).json({ success: true, data: dataResend });
    
  } catch (error) {
    console.error('Error enviando correo con Resend:', error);
    return res.status(500).json({ error: 'Error interno del servidor al enviar el correo' });
  }
};
