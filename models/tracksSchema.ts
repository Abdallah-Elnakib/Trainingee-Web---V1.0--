import mongoose from "mongoose";
import { z } from "zod";

const trackSchema = new mongoose.Schema({
    trackName: { type: String, required: true },
    trackStartDate : { type : Date, required : true },
    trackEndDate : { type : Date, required : true },
    trackStatus : { type : String, required : true },
    trackAssignedTo : { type : String, required : true },
    trackData : {type : Array}
});

export const Track = mongoose.model('Tracks', trackSchema)


export const addStudentSchema = z.object({
    Id : z.number().min(1, 'ID Is Required'),
    Name : z.string().min(1, 'Name Is Required'),
    Degrees : z.number().min(0, 'Degrees Is Required'),
    Additional : z.number().min(0, 'Additional Is Required'),
    BasicTotal : z.array(z.object({
       taskName : z.string().min(1, 'Task Name Is Required'),
       taskDegree : z.number().min(0, 'Task Degree Is Required'),
       studentTaskDegree : z.number().min(0, 'Student Task Degree Is Required'),
    })),
    TotalDegrees : z.number().min(0, 'Total Degrees Is Required'),
    Comments : z.string().min(1, 'Comments Is Required'),
    studentStatus : z.string().min(1, 'Student Status Is Required'),
}).strict();
