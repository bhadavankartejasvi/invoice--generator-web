import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../../config/mailer.js";

export const registerUser = async (data) => {
  const exists = await User.findOne({ where: { email: data.email } });
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(data.password, 10);

  return User.create({
    fullName: data.fullName,
    email: data.email,
    password: hashed
  });
};

export const loginUser = async (data) => {
  const user = await User.findOne({ where: { email: data.email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return token;
};

export const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
  if (!user) {
    const error = new Error("User not found in database. Please log in again.");
    error.status = 401;
    throw error;
  }
  return user;
};

export const updateProfile = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await user.update(data);
  const updatedUser = user.toJSON();
  delete updatedUser.password;
  return updatedUser;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("No account with that email address exists.");
  
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'no-reply@finprecision.com',
      to: email,
      subject: "Password Reset Request - FinPrecision",
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset for your FinPrecision account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    // Fallback to console log if email isn't configured
    console.log(`\n[FALLBACK MOCK EMAIL] Password Reset Link for ${email}:\n${resetLink}\n`);
  }
  
  return { message: "Password reset instructions have been sent to your email." };
};