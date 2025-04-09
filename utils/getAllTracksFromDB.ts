import {Track} from "../models/tracksSchema";


export const getAllTracksFromDB = async () => {
    try {
        const trackName = [];
        const tracks = await Track.find();
        for (const track of tracks) {
            trackName.push(track.trackName);
        }
        return trackName;
    } catch (error) {
        console.error('Error fetching tracks:', error);
        throw new Error('Failed to fetch tracks');
    }
}

