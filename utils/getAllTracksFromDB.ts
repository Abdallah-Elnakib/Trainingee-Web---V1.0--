import { Track } from "../models/tracksSchema";

export const getAllTracksFromDB = async () => {
    try {
        const data = [];
        const tracks = await Track.find();
        for (const track of tracks) {
            for (const student of track.trackData) {
                student.TotalDegrees = student.Degrees + student.Additional;
            }

            track.trackData.sort((a, b) => b.TotalDegrees - a.TotalDegrees);

            track.markModified('trackData');
            await track.save();

            data.push({
                trackName: track.trackName,
                studentNum: track.trackData.length,
                trackData: track.trackData,
            });
        }
        return data;

    } catch (error) {
        console.error('Error fetching tracks:', error);
        throw new Error('Failed to fetch tracks');
    }
};