import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';
import mongoose from 'mongoose';

/**
 * Controller to get all students across all tracks without duplicates
 * Supports filtering by track name and student status
 * Also supports searching by student name or student ID
 */
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const { track, status, search } = req.query;
        
        // Define base query for tracks
        let query: any = {};
        
        // Add track filter if provided
        if (track && track !== 'all') {
            query.trackName = track;
        }
        
        // Find all tracks matching filters
        const tracks = await Track.find(query);
        
        // Create a set to track processed student IDs to avoid duplicates
        const processedStudentIds = new Set();
        const allStudents: any[] = [];
        
        // Process all tracks and extract students
        for (const trackData of tracks) {
            if (!trackData.trackData || !Array.isArray(trackData.trackData)) {
                continue;
            }
            
            // Process students in this track
            for (const student of trackData.trackData) {
                // Skip if no student ID or it's already processed
                if (!student.Id || processedStudentIds.has(student.Id)) {
                    continue;
                }
                
                // Apply status filter if provided
                if (status && status !== 'all' && student.studentStatus !== status) {
                    continue;
                }
                
                // Apply search filter if provided
                if (search) {
                    const searchTerm = search.toString().toLowerCase();
                    const studentName = student.Name?.toString().toLowerCase() || '';
                    const studentId = student.Id?.toString().toLowerCase() || '';
                    
                    if (!studentName.includes(searchTerm) && !studentId.includes(searchTerm)) {
                        continue;
                    }
                }
                
                // Add track info to student data
                const studentWithTrack = {
                    ...student,
                    trackInfo: {
                        trackId: trackData._id,
                        trackName: trackData.trackName
                    }
                };
                
                allStudents.push(studentWithTrack);
                processedStudentIds.add(student.Id);
            }
        }
        
        return res.status(200).json({
            success: true,
            students: allStudents
        });
    } catch (error) {
        console.error('Error getting all students:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve students. Please try again later.'
        });
    }
};
