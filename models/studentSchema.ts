import mongoose from "mongoose";



const studentSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password : {
        type: String,
    },
    name : {type: String, required: true},
    tracks : {type: Array, required: true},
});

export const StudentData = mongoose.model("Students", studentSchema);