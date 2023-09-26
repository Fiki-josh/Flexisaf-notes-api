const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        ticketnum: {
            type: Number,
        },
        completed: {
            type: Boolean,
            default: false
        } 
    },
    {
        timestamps: true
    }
)

const ticketCounterSchema = new mongoose.Schema({
    highestTicketNumber: {type: Number, default: 500}
})

const TicketCounter = mongoose.model("TicketCounter",ticketCounterSchema)

noteSchema.pre('save', async function(next){
    if(!this.ticketnum){
        try {
            const ticketNumber = await TicketCounter.findOneAndUpdate(
                {},
                { $inc: {highestTicketNumber: 1}},
                {new: true, upsert: true}
            )
            this.ticketnum = ticketNumber.highestTicketNumber
            console.log(this.ticketnum)
        } catch (error) {
            return next(error)
        }
    }

    next()
})
module.exports = mongoose.model('Note', noteSchema)