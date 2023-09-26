const express = require("express")
const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

//@desc Login
//route Post/auth
//@access: public

const login = asyncHandler( async (req,res) => {
    const {username, password} = req.body

    if(!username || !password) return res.status(400).json({message: "All Field are required"})

    const foundUser = await User.findOne({ username }).lean().exec()

    if(!foundUser || !foundUser.active) return res.status(401).json({message: "Unauthorized"})

    const match = await bcrypt.compare(password,foundUser.password)

    if(!match) return res.status(401).json({message: "Unauthorized"})

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_JWT_SECRET,
        {expiresIn: '15m'} 
    )

    const refreshToken = jwt.sign(
        {username: foundUser.username},
        process.env.REFRESH_JWT_SECRET,
        {expiresIn: '7d'}
    )

    res.cookie('jwt',refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 // expires in 7days
    })

    res.json({accessToken})

})

//@desc refresh
//route Get/auth/refresh
//@access: public

const refresh = asyncHandler( async (req,res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.status(401).json({message: "Unauthorized"})

    const refreshToken = cookies.jwt  

    jwt.verify(
        refreshToken,
        process.env.REFRESH_JWT_SECRET,
        asyncHandler( async (err, decoded) => {
            if(err) return res.status(403).json({message: "Forbidden"})

            const foundUser = await User.findOne({username: decoded.username}).exec()

            if(!foundUser) return res.status(401).json({message: "Unauthorized"})

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_JWT_SECRET,
                {expiresIn: '15m'} 
            )

            res.json({accessToken})

        })
    )

})
//@desc Logout
//route Post/auth/logout
//@access: public

const logout = asyncHandler( async (req,res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(204) //no content
    res.clearCookie('jwt',{
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    })

    res.json({message: "Cookie Cleared"})

})

module.exports = {
    login,
    refresh,
    logout
} 