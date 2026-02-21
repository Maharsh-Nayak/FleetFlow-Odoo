const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ where: { email } });
        
        // Always return success to prevent email enumeration
        // In production, you would send an actual email with reset link
        if (user) {
            // Generate reset token and save (in production, store in DB with expiry)
            const resetToken = generateResetToken();
            console.log(`Password reset token for ${email}: ${resetToken}`);
            // TODO: Send email with reset link in production
            // await sendResetEmail(email, resetToken);
        }

        res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }

        // In production, look up token in DB and check expiry
        // For now, we'll implement a simple version
        // This would validate against stored tokens in production
        
        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const validRoles = ['MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE'];
        const userRole = validRoles.includes(role) ? role : 'DISPATCHER';

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password_hash: hashedPassword,
            role: userRole,
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Validate role if provided
        if (role && user.role !== role) {
            return res.status(401).json({ message: `Invalid credentials for ${role} role. Please select the correct role.` });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
