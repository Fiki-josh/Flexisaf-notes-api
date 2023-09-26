const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@route: /users *
//@access: private *

//@method: get
const getUsers = asyncHandler(async (_req,res) => {
    const users = await User.find().select("-password").lean()

    if(!users?.length) return res.status(400).json({message: "No User Found"});

    res.json(users);
});

//@method: post
const createNewUser = asyncHandler(async (req,res) => {
    const {username, password, roles} = req.body

    //confirm data
    if(!username || !password){
        return res.status(400).json({message: "All Fields Are Required"});
    }

    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2}).lean().exec()

    if(duplicate) return res.status(409).json({message: "Username already exists"})

    const hashPwd = await bcrypt.hash(password,10) //salt round

    const userOb = (!Array.isArray(roles) || !roles.length) 
        ? {username, "password": hashPwd}
        :{username, "password": hashPwd, roles}

    const user = await User.create(userOb)

    if(user){
        return res.status(201).json({message: `User ${user.username} is successfuly created`});
    }else{
        res.status(400).json({message: "Invalid User Data"})
    }

});
//@method: patch
const updateUser = asyncHandler(async (req,res) => {
    const {id, username, password, roles, active} = req.body;

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof(active) !== 'boolean'){
        return res.status(400).json({message: "All Fields Are Required"});
    }

    //find user by id
    const user = await User.findById(id).exec()

    if(!user) return res.status(404).json({message: "User does exists"})
    
    //check for duplicate
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2}).lean().exec()

    if(duplicate && duplicate?._id.toString() !==id) return res.status(409).json({message: "Username already exists"})

    //update user details
    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        user.password = bcrypt.hash(password,10) // salt rounds
    }

    const updatedUser = await user.save()

    res.json({message: `User ${updatedUser.username} updated`})
});
//@method: delete
const deleteUser = asyncHandler(async (req,res) => {
    const {id} = req.body

    if(!id) return res.status(400).json({message: "Id field is required"})

    const notes = await Note.findOne({user: id}).lean().exec()

    if(notes) return res.status(400).json({message: "User has assigned notes"})

    const user = await User.findById(id).exec()

    if(!user) return res.status(404).json({message: "User not found"})

    const result = await user.deleteOne()

    const reply = `User with username ${result.username} and Id ${result._id} is deleted`

    res.json({message: reply})
});

module.exports = {getUsers,updateUser,createNewUser,deleteUser};