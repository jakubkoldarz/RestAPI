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
        const [result] = await db.execute(
            `
            SELECT
                all_dates.date AS date,
                IFNULL(COUNT(t.id_task), 0) AS completed_tasks
            FROM (
                SELECT CURDATE() - INTERVAL seq DAY AS date
                FROM (
                    SELECT @row := @row + 1 AS seq
                    FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
                         (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
                         (SELECT @row := -1) init
                ) seq_30
                WHERE seq < 30
            ) AS all_dates
            LEFT JOIN tasks t
                ON DATE(t.finishedAt) = all_dates.date
                AND t.id_user = ?
            GROUP BY all_dates.date
            ORDER BY all_dates.date ASC;
            `,
            [user.id_user]
        );

        const labels = result.map((row) => row.date);
        const values = result.map((row) => row.completed_tasks);

        return res.status(StatusCodes.OK).json({ labels, values });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
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
