import transporter from "../../config/mailer.js";

export const sendInvoiceEmail = async (to, filePath) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Invoice",
    text: "Please find your invoice attached.",
    attachments: [
      {
        filename: "invoice.pdf",
        path: filePath
      }
    ]
  });
};