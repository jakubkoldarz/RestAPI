const db = require("../db.js");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");

const getTaskById = async (req, res) => {
    const { id } = req.params;
    const user = req.user.username;

    try {
            const [result] = await db.query(
                `   
                SELECT 
                    t.idTask,
                    t.name,
                    t.startedAt,
                    t.description,
                    t.finished,
                    t.idUser
                FROM 
                    Tasks t 
                INNER JOIN
                    users u
                ON
                    u.id_user = t.idUser
                WHERE 
                    t.idTask = ?
                AND
                    u.username = ?;
                `,
                [id, user]
            );

            if (result.length <= 0)
                return res.status(400).json({ message: "No task with that ID or not allowed to see it" });
    
            res.json({
                message: result[0]
            });
        } catch (error) {
            return res.status(500).json(error);
        }
};

const getAllTasks = async (req, res) => {
    const user = req.user.username;

    try {
            const [result] = await db.query(
                `   
                SELECT 
                    t.idTask,
                    t.name,
                    t.startedAt,
                    t.description,
                    t.finished,
                    t.idUser
                FROM 
                    Tasks t 
                INNER JOIN
                    users u
                ON
                    u.id_user = t.idUser
                WHERE 
                    u.username = ?;
                `,
                [user]
            );

            if (result.length <= 0)
                return res.status(400).json({ message: "No tasks for that user" });
    
            res.json({
                message: result
            });
        } catch (error) {
            return res.status(500).json(error);
        }
}

const insertTask = async (req, res) => {
    const task = {
        name: req.body.taskName,
        description: req.body.taskDescription,
        user: req.user.username
    };

    if (!task.name || task.name.trim() === ""){
        return res.status(400).json({message: "Task name required"});
    }
    if (task.description && task.description.trim() === ""){
        task.description = null;
    }

    try {
            const [result] = await db.query(
                `   
                INSERT INTO 
                    Tasks(name, description, idUser)
                VALUES(
                    ?,
                    ?,
                    (
                        SELECT id_user
                        FROM users
                        WHERE
                        username = ?
                    )
                );
                `,
                [task.name, task.description, task.user]
            );
    
            res.status(201).json({
                message: "Task created",
                taskId: result.insertId
            });
        } catch (error) {
            return res.status(500).json(error);
        }
}

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { taskName, taskDescription, finished } = req.body;
    const user = req.user.username;

    let fields = [];
    let values = [];

    if (taskName){
        fields.push("name = ?");
        values.push(taskName);
    }

    if (taskDescription !== undefined){
        fields.push("description = ?");
        values.push(taskDescription);
    }

    if (finished !== undefined){
        fields.push("finished = ?");
        values.push(finished);
    }

    if (fields.length === 0){
        return res.status(400).json({message: "No data to update"});
    }

    values.push(id);
    values.push(user);

    try {
        const [result] = await db.query(
            `UPDATE Tasks
            SET ${fields.join(", ")}
            WHERE idTask = ?
            AND idUser = (
                SELECT id_user FROM users WHERE username = ?);`,
            values
        );

        if (result.affectedRows === 0){
            return res.status(400).json({message: "Task not found or not allowed to update"});
        }

        res.status(200).json({message: "Task updated"});
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
            const [result] = await db.query(
                `   
                DELETE FROM 
                    Tasks
                WHERE
                    idUser = (
                        SELECT id_user
                        FROM users
                        WHERE
                        username = ?
                    )
                AND
                idTask = ?;
                `,
                [req.user.username, id]
            );
            
            if (result.affectedRows === 0){
                return res.status(400).json({message: "Task not found or not not allowed to delete"});
            }

            // Deleted and no message back
            // res.status(204);

            res.status(200).json({
                message: "Task deleted",
            });
        } catch (error) {
            return res.status(500).json(error);
        }
};

module.exports = {
    getTaskById,
    getAllTasks,
    insertTask,
    updateTask,
    deleteTask
}