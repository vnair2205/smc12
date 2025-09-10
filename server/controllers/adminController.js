// server/controllers/adminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const payload = { admin: { id: admin.id } };
    jwt.sign(
      payload,
      process.env.JWT_ADMIN_SECRET, // Use a separate secret for admins
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ msg: 'Admin with this email does not exist' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await admin.save();

        // NOTE: Make sure your .env file has MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Change the link to point to your admin panel frontend
        const resetUrl = `http://admin.localhost:3000/reset-password/${resetToken}`;

        const mailOptions = {
            to: admin.email,
            from: process.env.MAIL_FROM || 'passwordreset@seekmycourse.com',
            subject: 'SeekMYCOURSE Admin Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your admin account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `${resetUrl}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'An email has been sent with further instructions.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const admin = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
        }

        admin.password = req.body.password; // The pre-save hook will hash it
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;

        await admin.save();

        res.status(200).json({ msg: 'Password has been updated.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};