import {z} from "zod";
import mongoose from "mongoose";    

export const userSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'supervisor', 'instructor'], { errorMap: () => ({ message: 'Role is required' }) }),
    status: z.string().min(1, 'Status is required'),
});

const userSchemaMongo = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true , enum: ['admin', 'supervisor', "instructor"]},
    resetPasswordToken: { type: String , createdAt: { type: Date, default: Date.now, expires: '1h' },},
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

export const Users = mongoose.model("Users", userSchemaMongo);
export type User = z.infer<typeof userSchema>;