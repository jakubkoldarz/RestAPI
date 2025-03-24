const db = require("../db.js");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [test] = await db.query("select 1 + 5 as three;");
        res.json(test);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
