const express = require("express");
const {getUsers,updateUser,createNewUser,deleteUser} = require("../controllers/userController");
const verifyJwt = require("../middleware/verifyJwt")
const router = express.Router();

router.use(verifyJwt)

router.route('/')
    .get(getUsers)
    .post(createNewUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router;