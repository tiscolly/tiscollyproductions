import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required" });
    }

    // Check for email credentials
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error("EMAIL_USER or EMAIL_PASS not set in environment variables.");
      // We still return 200 to the client to avoid breaking the UI flow, 
      // but we log the error on the server.
      return res.json({ 
        success: true, 
        warning: "Message received, but email could not be sent because credentials are not configured." 
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", // Or any other service
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: emailUser,
        to: "olly@tiscollyproductions.it",
        subject: `Nuovo messaggio da ${name} - Tiscolly Productions`,
        text: `Nome: ${name}\n\nMessaggio:\n${message}`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
