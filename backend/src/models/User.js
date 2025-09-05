import mongoose from 'mongoose';
import bycrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    location: {
        type: String,
        default: "",
    },
    nativeLanguage: {
        type: String,
        default: "",
    },
    profilePic: {
        type: String,
        default: "",
    },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bycrypt.genSalt(10);
        this.password = await bycrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    const isMatch = await bycrypt.compare(enteredPassword, this.password);
    return isMatch;
}

const User = mongoose.model('User', userSchema);

export default User;
