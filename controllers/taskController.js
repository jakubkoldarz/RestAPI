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
                    t.id_user
                FROM 
                    tasks t 
                INNER JOIN
                    users u
                ON
                    u.id_user = t.id_user
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
        startedAt: req.body.startedAt,
    };

    if (task.description && task.description.trim() === "") {
        task.description = null;
    }

    const startedAt = task.startedAt
        ? new Date(task.startedAt)
        : new Date(Date.now() + 2 * 60 * 60 * 1000);

    try {
        const [result] = await db.query(
            `   
                INSERT INTO 
                    tasks(name, description, id_user, startedAt)
                VALUES(
                    ?,
                    ?,
                    ?,
                    ?
                );
                `,
            [task.name, task.description, user.id_user, startedAt]
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
    const { name, description, isFinished, startedAt, finishedAt } = req.body;
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

    if (startedAt !== undefined) {
        queryValues.push(`startedAt = ?`);
        insertValues.push(startedAt ? new Date(startedAt) : null);
    }

    if (isFinished === 0) {
        queryValues.push(`finishedAt = NULL`);
    } else if (isFinished === 1) {
        if (finishedAt) {
            queryValues.push(`finishedAt = ?`);
            insertValues.push(new Date(finishedAt));
        } else {
            queryValues.push(`finishedAt = ?`);
            insertValues.push(new Date(Date.now() + 2 * 60 * 60 * 1000));
        }
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

module.exports = {
    getTaskById,
    getAllTasks,
    insertTask,
    updateTask,
    deleteTask,
};
