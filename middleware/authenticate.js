const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
        if (err) return res.sendStatus(StatusCodes.UNAUTHORIZED);
        req.user = user;
        next();
    });
};

module.exports = authenticate;
