import express, { Request, Response } from "express";
import { Track } from "../../../models/tracksSchema";
import mongoose from "mongoose";

export const deleteTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const trackId = req.params.trackId;
        
        console.log('Received delete request for track ID:', trackId);
        
        // Validate track ID format
        if (!trackId) {
            console.log('Track ID is missing in request');
            res.status(400).json({ message: "Track ID is required" });
            return;
        }
        
        if (!mongoose.Types.ObjectId.isValid(trackId)) {
            console.log('Invalid track ID format:', trackId);
            res.status(400).json({ message: `Invalid track ID format: ${trackId}` });
            return;
        }
        
        // Find the track by ID
        const track = await Track.findById(trackId);
        if (!track) {
            console.log('Track not found with ID:', trackId);
            res.status(404).json({ message: `Track not found with ID: ${trackId}` });
            return;
        }
        
        console.log('Found track to delete:', track.trackName);
        
        // Delete the track
        const deletedTrack = await Track.findByIdAndDelete(trackId);
        if (!deletedTrack) {
            console.log('Failed to delete track - database operation returned null');
            res.status(500).json({ message: "Failed to delete track - database error" });
            return;
        }
        
        console.log('Track deleted successfully:', deletedTrack.trackName);
        
        res.status(200).json({ 
            message: "Track deleted successfully",
            deletedTrack: {
                id: deletedTrack._id,
                name: deletedTrack.trackName
            }
        });
    } catch (error) {
        console.error("Error deleting track:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
}


