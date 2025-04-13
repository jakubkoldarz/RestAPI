const { StatusCodes } = require("http-status-codes");
const db = require("../db.js");

const getWeeklyChart = async (req, res) => {
    const user = req.user;

    try {
        const [result] = await db.query(
            `
            SELECT 
                days.day_name,
                IFNULL(COUNT(tasks.id_task), 0) AS completed_tasks
            FROM 
                (SELECT 'Monday' AS day_name UNION 
                SELECT 'Tuesday' UNION 
                SELECT 'Wednesday' UNION 
                SELECT 'Thursday' UNION 
                SELECT 'Friday' UNION 
                SELECT 'Saturday' UNION 
                SELECT 'Sunday') AS days
            LEFT JOIN tasks 
                ON DAYNAME(tasks.finishedAt) = days.day_name
                AND tasks.finishedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND tasks.id_user = ? 
            GROUP BY days.day_name
            ORDER BY FIELD(days.day_name, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
            `,
            [user.id_user]
        );

        return res.status(StatusCodes.OK).json(result);
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const getMonthlyChart = async (req, res) => {
    const user = req.user;

    try {
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};

const getCompletedChart = async (req, res) => {
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
            message: error.message,
        });
    }
};

module.exports = {
    getWeeklyChart,
    getMonthlyChart,
    getCompletedChart,
};
