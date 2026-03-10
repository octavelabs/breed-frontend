import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailMap = {
  Volunteer: "volunteers@joinbreed.com",
  Partner: "partners@joinbreed.com",
  Creator: "creators@joinbreed.com",
  Support: "support@joinbreed.com",
};

export async function POST(req) {
  try {
    const body = await req.json();

    const { name, email, phone, purpose, message } = body;

    if (!name || !email || !purpose || !message) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const recipient = emailMap[purpose];

    await resend.emails.send({
      from: "Breed Contact <contact@joinbreed.com>",
      to: recipient,
      reply_to: email,
      subject: `New ${purpose} Request`,
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
