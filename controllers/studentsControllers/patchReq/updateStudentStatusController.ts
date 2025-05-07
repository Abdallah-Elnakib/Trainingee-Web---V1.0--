import express, { Request, Response } from "express";
import { Track } from "../../../models/tracksSchema";

export const updateStudentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackName } = req.params;
        const { studentId, newStatus } = req.body;

        if (!trackName) {
            res.status(400).json({ message: "Track name is required" });
            return;
        }

        if (!studentId) {
            res.status(400).json({ message: "Student ID is required" });
            return;
        }

        if (!newStatus) {
            res.status(400).json({ message: "New status is required" });
            return;
        }

        // Validate status value
        const validStatuses = ["Pending", "Accepted", "Rejected", "In Progress"];
        if (!validStatuses.includes(newStatus)) {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }

        // Find the track and update the student's status
        const track = await Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: "Track not found" });
            return;
        }

        // Find the student in the track data
        console.log(`Looking for student with ID: ${studentId} in track: ${trackName}`);
        console.log(`Track data length: ${track.trackData.length}`);
        
        // More detailed logging to help debug
        const studentIndex = track.trackData.findIndex(student => {
            console.log(`Comparing student ID: ${student.ID} (${typeof student.ID}) with requested ID: ${studentId} (${typeof studentId})`);
            // Try different ways of comparing to handle potential type issues
            return student.ID === Number(studentId) || 
                  student.ID === parseInt(studentId) ||
                  student.ID.toString() === studentId.toString() ||
                  String(student.ID) === String(studentId);
        });
        
        if (studentIndex === -1) {
            console.log(`Student with ID ${studentId} not found in track ${trackName}`);
            res.status(404).json({ message: "Student not found in this track" });
            return;
        }
        
        console.log(`Found student at index: ${studentIndex}`);

        // Instead of updating the document in memory and then saving,
        // use findOneAndUpdate with arrayFilters to atomically update the status
        // This avoids the VersionError issue
        const result = await Track.findOneAndUpdate(
            { trackName, 'trackData.ID': Number(studentId) },
            { $set: { 'trackData.$.studentStatus': newStatus } },
            { new: true } // Return the modified document
        );

        if (!result) {
            console.log("Update operation didn't modify any documents");
            res.status(500).json({ message: "Failed to update student status" });
            return;
        }

        console.log(`Successfully updated student status to ${newStatus}`);
        res.status(200).json({ 
            message: "Student status updated successfully",
            studentId,
            newStatus
        });

    } catch (error) {
        console.error("Error updating student status:", error);
        res.status(500).json({ message: "Server error while updating student status" });
    }
};
