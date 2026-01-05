import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    governorate: {
        type: String,
        required: true
    },
    birthday: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', '']
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    enrolledEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;

