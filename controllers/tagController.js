const { StatusCodes } = require("http-status-codes");
const db = require("../db.js");

const getAllTags = async (req, res) => {
    const user = req.user;

    try {
        const [result] = await db.execute(
            `
            SELECT 
                *
            FROm
                tags t
            WHERE 
                id_user = ?
            `,
            [user.id_user]
        );

        return res.status(StatusCodes.OK).json({
            tags: result,
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const getTagById = async (req, res) => {
    const user = req.user;
    const { id_tag } = req.params;

    try {
        const [result] = await db.execute(
            `
            SELECT 
                *
            FROm
                tags t
            WHERE 
                id_user = ? AND id_tag = ?
            `,
            [user.id_user, id_tag]
        );

        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Tag not found",
            });
        }

        return res.status(StatusCodes.OK).json({
            tag: result[0],
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const createTag = async (req, res) => {
    const user = req.user;
    const tag = {
        name: req.body.name,
        color: req.body.color,
    };

    try {
        const [result] = await db.execute(
            `
            INSERT INTO tags (name, color, id_user)
            VALUES (?, ?, ?)
            `,
            [tag.name, tag.color, user.id_user]
        );

        return res.status(StatusCodes.CREATED).json({
            tag: {
                id_tag: result.insertId,
            },
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const deleteTag = async (req, res) => {
    const user = req.user;
    const { id_tag } = req.params;

    try {
        const [resultDelete] = await db.execute(
            `
            DELETE FROM tags
            WHERE id_user = ? AND id_tag = ?
            `,
            [user.id_user, id_tag]
        );

        if (resultDelete.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Tag not found",
            });
        }

        const [resultUpdate] = await db.execute(
            `
            UPDATE tasks
            SET 
                id_tag = NULL
            WHERE 
                id_user = ? AND 
                id_tag = ?
            `,
            [user.id_user, id_tag]
        );

        return res.status(StatusCodes.OK).json({
            message: "Tag deleted successfully",
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

const updateTag = async (req, res) => {
    const user = req.user;
    const { id_tag } = req.params;
    const tag = {
        name: req.body.name,
        color: req.body.color,
    };

    try {
        const [result] = await db.execute(
            `
            UPDATE tags
            SET name = ?, color = ?
            WHERE id_user = ? AND id_tag = ?
            `,
            [tag.name, tag.color, user.id_user, id_tag]
        );

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Tag not found",
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Tag updated successfully",
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: error.message });
    }
};

module.exports = {
    getAllTags,
    getTagById,
    createTag,
    deleteTag,
    updateTag,
};
