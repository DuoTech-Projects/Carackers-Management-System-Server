const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: Number, required: true},
    place: { type: String, required: true },
    month: {
        type: String,
        enum: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
});

const AdminSchema = new mongoose.Schema({
    admin: { type: String, required: true, unique: true },
    clients: [UserSchema] // Array of client objects associated with the admin
});

// Define the models
const Admin = mongoose.model('Admin', AdminSchema);

// Export the model
module.exports = Admin;
