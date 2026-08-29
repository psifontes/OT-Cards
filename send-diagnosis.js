import { Resend } from 'resend';

// Inicializa Resend con la clave que guardamos en Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, business, score, opportunity } = body;

    // Envía el correo
    const data = await resend.emails.send({
      from: 'OT Cards <onboarding@resend.dev>', // Cambia esto cuando verifiques tu dominio en Resend
      to: [email],
      subject: `Tu Índice de Preparación Digital OT™: ${score}/100`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0B1B3B; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">Hola ${name},</h2>
          <p>Gracias completar el <strong>Índice de Preparación Digital OT™</strong> para <strong>${business}</strong>.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-size: 48px; color: #0B1B3B;">${score}/100</h1>
            <p style="margin: 5px 0 0 0; font-size: 18px;">OT Digital Score™</p>
          </div>

          <h3>Tu principal oportunidad detectada:</h3>
          <p style="font-size: 18px; font-weight: bold; color: #0066ff;">${opportunity}</p>
          
          <p>En OT Cards™ reunimos las herramientas para ayudarte a construir una presencia digital conectada. Nos pondremos en contacto contigo pronto para conversar sobre tu siguiente paso.</p>
          
          <br>
          <p style="font-size: 12px; color: #666;">© 2026 OT Cards™ — Tu Identidad Conectada.</p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
