const db = require("../db.js");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");

const register = async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    };

    try {
        const [result] = await db.query(
            `   
            SELECT 
                u.id_user 
            FROM 
                users u 
            WHERE 
                u.username = ? OR 
                u.email = ?;
            `,
            [user.username, user.email]
        );

        if (result.length > 0)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const [insertResult] = db.query(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [user.username, user.email, hashedPassword]
        );

        return res.status(401).json({
            message: insertResult,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const login = async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
    };

    try {
        const [result] = await db.query(
            `   
            SELECT 
                u.username,
                u.password
            FROM 
                users u 
            WHERE 
                u.username = ?;
            `,
            [user.username]
        );

        if (result.length <= 0)
            return res.status(400).json({ message: "User does not exists" });

        const userResult = result[0];
        const authResult = await bcrypt.compare(
            user.password,
            userResult.password
        );

        if (!authResult)
            return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign(user, process.env.SECRET_TOKEN, {
            expiresIn: "1h",
        });

        res.json({
            message: "Successful login",
            token,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const me = (req, res) => {
    res.json(req.user);
};

module.exports = {
    register,
    login,
    me,
};
