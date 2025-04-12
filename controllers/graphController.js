const { StatusCodes } = require("http-status-codes");
const db = require("../db.js");

const getWeeklyGraph = async (req, res) => {
    res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
};

const getMonthlyGraph = async (req, res) => {
    res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
};

const getCompletedGraph = async (req, res) => {
    const user = req.user;

    try {
        const [result] = await db.query(
            `   SELECT
                    COUNT(CASE WHEN finishedAt IS NULL THEN 1 END) AS unfinished_tasks,
                    COUNT(CASE WHEN finishedAt IS NOT NULL THEN 1 END) AS finished_tasks
                FROM 
                    tasks
                WHERE 
                    id_user = ?;
            `,
            user.id_user
        );

        return res.status(StatusCodes.OK).json(result[0]);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.msg,
        });
    }
};

module.exports = {
    getWeeklyGraph,
    getMonthlyGraph,
    getCompletedGraph,
};
