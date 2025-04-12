const db = require("../db.js");

const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

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
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const [insertResult] = await db.query(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [user.username, user.email, hashedPassword]
        );

        return res.status(StatusCodes.CREATED).json({
            message: "Successfully created new user",
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
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
                *
            FROM 
                users u 
            WHERE 
                u.username = ?;
            `,
            [user.username]
        );

        if (result.length <= 0)
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "User does not exists" });

        const userResult = result[0];
        const authResult = await bcrypt.compare(
            user.password,
            userResult.password
        );

        if (!authResult)
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid password" });

        const token = jwt.sign(userResult, process.env.SECRET_TOKEN, {
            expiresIn: "1h",
        });

        res.json({
            message: "Successful login",
            token,
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
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
