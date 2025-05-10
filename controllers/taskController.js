const { StatusCodes } = require("http-status-codes");
const db = require("../db.js");

const getTaskById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const [result] = await db.query(
            `   
                SELECT 
                    t.id_task,
                    t.name,
                    t.startedAt,
                    t.description,
                    t.finishedAt,
                    t.id_user
                FROM 
                    tasks t 
                INNER JOIN
                    users u
                ON
                    u.id_user = t.id_user
                WHERE 
                    t.id_task = ?
                AND
                    u.id_user = ?;
                `,
            [id, user.id_user]
        );

        if (result.length <= 0)
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "No task with that ID exists",
            });

        res.json({
            message: result[0],
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const getAllTasks = async (req, res) => {
    const user = req.user;

    try {
        const [result] = await db.query(
            `   
                SELECT 
                    t.id_task,
                    t.name,
                    t.startedAt,
                    t.description,
                    t.finishedAt,
                    t.id_user,
                    tg.name AS tagName,
                    tg.color AS tagColor
                FROM 
                    tasks t 
                INNER JOIN
                    users u
                ON
                    u.id_user = t.id_user
                LEFT JOIN
                    tags tg
                ON
                    tg.id_tag = t.id_tag
                WHERE 
                    u.id_user = ?;
                `,
            [user.id_user]
        );

        if (result.length <= 0) return res.status(StatusCodes.OK).json([]);

        return res.json({ tasks: result });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const insertTask = async (req, res) => {
    const user = req.user;

    const task = {
        name: req.body.name,
        description: req.body.description,
    };

    if (task.description && task.description.trim() === "") {
        task.description = null;
    }

    try {
        const [result] = await db.query(
            `   
                INSERT INTO 
                    tasks(name, description, id_user, startedAt)
                VALUES(
                    ?,
                    ?,
                    ?,
                    CURRENT_TIMESTAMP
                );
                `,
            [task.name, task.description, user.id_user]
        );

        return res.status(StatusCodes.CREATED).json({
            message: "Task created successfully",
            taskId: result.insertId,
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { name, description, isFinished, id_tag } = req.body;
    const user = req.user;

    const queryValues = [];
    const insertValues = [];

    if (name && name.trim().length > 0) {
        queryValues.push(`name = ?`);
        insertValues.push(name);
    }

    if (description) {
        queryValues.push(`description = ?`);
        insertValues.push(description);
    }

    if (id_tag) {
        queryValues.push(`id_tag = ?`);
        insertValues.push(id_tag);
    }

    if (isFinished === 0) {
        queryValues.push(`finishedAt = NULL`);
    } else if (isFinished === 1) {
        queryValues.push(
            `finishedAt = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 HOUR)`
        );
    }

    if (queryValues.length <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "No data provided to update",
        });
    }

    try {
        const [result] = await db.query(
            `   UPDATE tasks
                SET
                    ${queryValues.join(", ")}
                WHERE 
                    id_task = ? AND
                    id_user = ?
                    ;
                `,
            [...insertValues, id, user.id_user]
        );

        if (result.affectedRows === 0) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Task not found" });
        }

        res.status(StatusCodes.OK).json({ message: "Task updated" });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(
            `   
                DELETE FROM 
                    tasks
                WHERE
                    id_user = ?
                AND
                    id_task = ?;
                `,
            [req.user.id_user, id]
        );

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Task not found",
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const getReport = (interval = null) => async (req, res) => {
    const user = req.user;

    try {
        const params = [user.id_user];
        let dateCondition = '';

        if (interval) {
            dateCondition = `AND t.startedAt >= NOW() - INTERVAL ${interval}`;
        }

        const [tagged] = await db.query(
            `
            SELECT 
                tg.name AS tagName,
                tg.color,
                COUNT(t.id_task) AS total,
                SUM(CASE WHEN t.finishedAt IS NOT NULL THEN 1 ELSE 0 END) AS finished,
                SUM(CASE WHEN t.finishedAt IS NULL THEN 1 ELSE 0 END) AS unfinished
            FROM 
                tags tg
            LEFT JOIN tasks t ON 
                t.id_tag = tg.id_tag
                AND t.id_user = tg.id_user
                ${dateCondition}
            WHERE tg.id_user = ?
            GROUP BY tg.id_tag
            ORDER BY total DESC, tagName
            `,
            params
        );

        const [untagged] = await db.query(
            `
            SELECT 
                'No tag' AS tagName,
                NULL AS color,
                COUNT(*) AS total,
                SUM(CASE WHEN finishedAt IS NOT NULL THEN 1 ELSE 0 END) AS finished,
                SUM(CASE WHEN finishedAt IS NULL THEN 1 ELSE 0 END) AS unfinished
            FROM 
                tasks
            WHERE
                id_user = ?
                AND id_tag IS NULL
                ${interval ? `AND startedAt >= NOW() - INTERVAL ${interval}` : ''}
            `,
            [user.id_user]
        );

        res.json({
            tasksStats: [...tagged, ...untagged]
        });
    } catch (error) {
        console.error(error);

const setTags = async (req, res) => {
    const { id_tag } = req.body;
    const { tasks } = req.body;
    const user = req.user;

    const placeholers = tasks.map(() => "?").join(", ");

    try {
        const [result] = await db.query(
            `   
                UPDATE tasks
                SET id_tag = ?
                WHERE id_user = ? AND id_task IN (${placeholers});
                `,
            [id_tag, user.id_user, ...tasks]
        );

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Task not found",
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Tasks set successfully",
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};


const getWeeklyReport = getReport('1 WEEK');
const getMonthlyReport = getReport('1 MONTH');
const getYearlyReport = getReport('1 YEAR');
const getAllTimeReport = getReport();

module.exports = {
    getTaskById,
    getAllTasks,
    insertTask,
    updateTask,
    deleteTask,
    getWeeklyReport,
    getMonthlyReport,
    getYearlyReport,
    getAllTimeReport
    setTags,
};
