import express, { Request, Response } from "express";
import { Track } from "../../../models/tracksSchema";

export const deleteTrack = async (req: Request, res: Response): Promise<void> => {
    const trackName = req.params.trackName;
    if (!trackName) {
        res.status(400).json({ message: "Track name is required" });
        return;
    }
    const track = await Track.findOne({ trackName });
    if (!track) {
        res.status(404).json({ message: "Track not found" });
        return;
    }
    
    const deletedTrack = await Track.findOneAndDelete({ trackName });
    if (!deletedTrack) {
        res.status(500).json({ message: "Failed to delete track" });
        return;
    }
    res.status(200).json({ message: "Track deleted successfully" });
}


