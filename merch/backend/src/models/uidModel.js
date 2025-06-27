const mongoose = require("mongoose");

const uidCounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    lastFour: { type: Number, required: true }
});


module.exports = mongoose.model("UIDCounter", uidCounterSchema);
