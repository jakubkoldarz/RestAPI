const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    getAllTags,
    getTagById,
    createTag,
    deleteTag,
    updateTag,
} = require("../controllers/tagController");
const { validateTag } = require("../middleware/validate.js");

router
    .get("/", authenticate, getAllTags)
    .get("/:id_tag", authenticate, getTagById)
    .post("/", authenticate, validateTag, createTag)
    .delete("/:id_tag", authenticate, deleteTag)
    .put("/:id_tag", authenticate, validateTag, updateTag);

module.exports = router;
