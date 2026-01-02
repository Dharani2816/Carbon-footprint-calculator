const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log('🚀 [Auth] Register Request:', { name, email });
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('⚠️ [Auth] User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 [Auth] Password hashed');
        
        const user = await User.create({ name, email, password: hashedPassword });
        console.log('✅ [Auth] User created in DB:', user.id);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('❌ [Auth] Register Error:', error);
        res.status(500).json({ message: `Server Error: ${error.message}`, error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
