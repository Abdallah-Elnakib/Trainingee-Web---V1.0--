import mongoose from "mongoose";
import { z } from "zod";

const trackSchema = new mongoose.Schema({
    trackName: { type: String, required: true },
    trackData : {type : Array}
});

export const Track = mongoose.model('Tracks', trackSchema)


export const addStudentSchema = z.object({
    Id : z.number().min(1, 'ID Is Required'),
    Name : z.string().min(1, 'Name Is Required'),
    Degrees : z.number().optional(),
    Additional : z.number().optional(),
    BasicTotal : z.number().min(1, 'Basic Total Is Required'),
    TotalDegrees : z.number().optional(),
    Comments : z.string().optional(),
    Ranking : z.number().min(1, 'Ranking Is Required')
})
