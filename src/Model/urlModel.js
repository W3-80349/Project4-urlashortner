
const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({

    URLCode: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    longURL: {
        type: String,
        required: true,
        trim: true
    },
    shortURL: {
        type: String,
        unique: true,
        required: true,
        trimt: true

    }


}, { timestamps: true })

module.exports = mongoose.model("URL", urlSchema)