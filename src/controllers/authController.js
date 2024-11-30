const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { jwtSecret } = require('../config');

passport.use(new LocalStrategy({
    usernameField: 'identifier',
    passwordField: 'password'
}, async (identifier, password, done) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [identifier, identifier]
        );

        const user = rows[0];
        
        if (!user) {
            return done(null, false);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        done(null, rows[0]);
    } catch (error) {
        done(error);
    }
});

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const t = req.t; // Get the translation function

    if (!username || !email || !password) {
        return res.status(400).json({ error: t('error.required_fields') });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: t('error.invalid_email') });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: t('error.user_exists') });
        }

        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: t('welcome'),
            username: username,
            email: email,
            userId: result.insertId
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: t('error.error_registering') });
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    const t = req.t; // Get the translation function

    if (!identifier || !password) {
        return res.status(400).json({ error: t('error.required_fields') });
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [identifier, identifier]
        );

        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: t('error.invalid_credentials') });
        }

        const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

        res.json({
            message: t('login'),
            username: user.username,
            email: user.email,
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: t('error.error_logging_in') });
    }
};