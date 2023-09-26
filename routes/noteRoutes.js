const express = require("express");
const noteController = require("../controllers/noteController");
const router = express.Router();
const verifyJwt = require("../middleware/verifyJwt")

router.use(verifyJwt)

router.route("/")
    .get(noteController.getNotes)
    .post(noteController.createNewNote)
    .patch(noteController.updateNote)
    .delete(noteController.deleteNote)

module.exports = router;