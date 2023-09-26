const Note = require("../models/Note");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

//@route: /notes *
//@access: private *

//@method: Get

const getNotes = asyncHandler( async(_req, res) => {
    const notes = await Note.find().lean()

    if(!notes?.length) return res.status(400).json({message: "No note found"})
    
    const noteWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username};
    }))

    res.json(noteWithUser);
});
//@method: post

const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({locale: 'en', strength: 2}).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    // Create and store the new user 
    const note = await Note.create({ user, title, text })

    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})
//@method: patch

const updateNote = asyncHandler( async(req, res) => {
    const {id, user, title, text, completed} = req.body

    //confirm data
    if(!id || !user || !title || !text || typeof(completed) !== 'boolean' ) return res.status(400).json({message: "All field required"})
    
    //check if user is valid
    // const user = await User.findById(user).exec()
    
    // if(!user) return res.status(400).json({message: "User does not exist"})

    const note = await Note.findById(id).exec()

    if(!note) return res.status(400).json({message: "Note does not exist"})

    //check for duplicate title

    const duplicate = await Note.findOne({title}).collation({locale: 'en', strength: 2}).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id) return res.status(409).json({message: "Duplicate note title"})

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json({message: `Note with id ${updatedNote._id} is updated`})

});
//@method: delete

const deleteNote = asyncHandler( async(req, res) => {
    const {id} = req.body

    //confirm data
    if(!id) return res.status(400).json({message: "Note id field is required"})

    const note = await Note.findById(id).exec()

    if(!note) return res.status(400).json({message: "Note does not exist"})

    const result = await note.deleteOne()

    res.json({message: `Note with Id ${result._id} is deleted`})
});

module.exports = {
    getNotes,
    createNewNote,
    updateNote,
    deleteNote
}