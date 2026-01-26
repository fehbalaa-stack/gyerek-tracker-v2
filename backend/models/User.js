import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    phoneNumber: { 
        type: String, 
        default: '' 
    },
    instagram: { 
        type: String, 
        default: '' 
    },
    facebook: { 
        type: String, 
        default: '' 
    },
    bio: { 
        type: String, 
        default: '' 
    },
    role: { 
        type: String, 
        enum: ['parent', 'admin'], 
        default: 'parent' 
    },
    isPremium: { 
        type: Boolean, 
        default: false 
    },
    emergencyPhone: { 
        type: String, 
        default: '' 
    },
    // ✅ HOZZÁADVA: Nyelvválasztás támogatása (hu, en, de)
    language: { 
        type: String, 
        enum: ['hu', 'en', 'de'], 
        default: 'hu' 
    }
}, { timestamps: true });

// 🔥 Mentés előtti titkosítás (pre-save hook)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// 🔥 Metódus a jelszó ellenőrzéséhez
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;