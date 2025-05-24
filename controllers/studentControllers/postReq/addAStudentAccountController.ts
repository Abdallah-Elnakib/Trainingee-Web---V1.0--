import { Request, Response } from 'express';
import  { StudentData } from '../../../models/studentSchema';


export const addNewStudentAccount = async (req: Request, res: Response): Promise<void> => {
    const { studentName, studentUsername, studentPassword} = req.body;
    try {
        const getStudent = await StudentData.findOne({ name : studentName });
        if (!getStudent) {
            
            res.status(201).json({ message: "Student not found"});
            return
        }
        await StudentData.findByIdAndUpdate(getStudent._id, { username: studentUsername, password: studentPassword}, { new: true });
        
        res.status(201).json({ message: "Student added Account successfully"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}