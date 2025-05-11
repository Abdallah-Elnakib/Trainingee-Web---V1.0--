// Script to add 100 students to each track in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Database connected successfully...................'))
    .catch(err => console.log('Database connection failed:', err));

// Define track schema
const trackSchema = new mongoose.Schema({
    trackName: { type: String, required: true },
    trackStartDate: { type: Date, required: true },
    trackEndDate: { type: Date, required: true },
    trackStatus: { type: String, required: true },
    trackAssignedTo: { type: String, required: true },
    trackData: { type: Array }
});

const Track = mongoose.model('Tracks', trackSchema);

// Generate a list of 100 different English names
function generateEnglishNames() {
    const firstNames = [
        "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
        "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
        "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
        "Nancy", "Lisa", "Margaret", "Betty", "Sandra", "Ashley", "Dorothy", "Kimberly", "Emily", "Donna",
        "Michelle", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia",
        "Kathleen", "Amy", "Shirley", "Anna", "Angela", "Ruth", "Brenda", "Pamela", "Nicole", "Katherine",
        "Virginia", "Catherine", "Christine", "Debra", "Rachel", "Janet", "Emma", "Carolyn", "Maria", "Heather",
        "Diane", "Julie", "Joyce", "Evelyn", "Joan", "Victoria", "Kelly", "Christina", "Lauren", "Frances",
        "Martha", "Judith", "Cheryl", "Megan", "Andrea", "Olivia", "Ann", "Jean", "Alice", "Jacqueline",
        "Hannah", "Doris", "Kathryn", "Gloria", "Teresa", "Sara", "Janice", "Marie", "Julia", "Grace"
    ];

    const middleNames = [
        "Lee", "Ann", "Marie", "Lynn", "Jean", "Rose", "Grace", "Jane", "May", "Elizabeth",
        "James", "Alan", "John", "Robert", "William", "Thomas", "Edward", "Michael", "Joseph", "Charles",
        "Scott", "Ray", "Paul", "Daniel", "Andrew", "David", "Richard", "Allen", "Francis", "Louis"
    ];

    const lastNames = [
        "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
        "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
        "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
        "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
        "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
        "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
        "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez",
        "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross",
        "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington",
        "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes"
    ];

    const names = [];
    // Generate 100 unique full names
    while (names.length < 100) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        // Create full name
        const fullName = `${firstName} ${middleName} ${lastName}`;
        
        // Make sure the name doesn't already exist in the list
        if (!names.includes(fullName)) {
            names.push(fullName);
        }
    }
    
    return names;
}

// Add students to a track
async function addStudentsToTrack(track, students) {
    console.log(`Adding students to track: ${track.trackName}`);
    
    // Get the highest student ID in the track (if any)
    let highestId = 0;
    if (track.trackData && track.trackData.length > 0) {
        track.trackData.forEach(student => {
            if (student.ID > highestId) {
                highestId = student.ID;
            }
        });
    }
    
    // Create a template for the basic data of students (if there are previous students)
    let basicTotalTemplate = [];
    if (track.trackData && track.trackData.length > 0 && track.trackData[0].BasicTotal) {
        basicTotalTemplate = JSON.parse(JSON.stringify(track.trackData[0].BasicTotal));
        
        // Reset student scores to zero
        for (const task of basicTotalTemplate) {
            task.studentTaskDegree = 0;
        }
    } else {
        // If there are no previous students, create a default task
        basicTotalTemplate = [
            {
                taskName: "Task 1",
                taskDegree: 10,
                studentTaskDegree: 0
            }
        ];
    }
    
    // Add students to the track
    for (let i = 0; i < students.length; i++) {
        const studentId = highestId + i + 1;
        const studentName = students[i];
        
        // Check if the student already exists
        const studentExists = track.trackData.some(s => s.Name === studentName);
        if (studentExists) {
            console.log(`Student ${studentName} already exists in track ${track.trackName}`);
            continue;
        }
        
        // Create student object
        const student = {
            ID: studentId,
            Name: studentName,
            Degrees: 0,
            Additional: 0,
            BasicTotal: JSON.parse(JSON.stringify(basicTotalTemplate)),
            TotalDegrees: 0,
            Comments: "Added automatically",
            studentStatus: "In Progress"
        };
        
        // Add student to track data array
        track.trackData.push(student);
    }
    
    // Save changes to the track
    await track.save();
    console.log(`Successfully added ${students.length} students to track: ${track.trackName}`);
}

// Main function
async function addStudentsToAllTracks() {
    try {
        // Get all tracks
        const tracks = await Track.find();
        if (tracks.length === 0) {
            console.log("No tracks found in the database");
            return;
        }
        
        console.log(`Found ${tracks.length} tracks in the database`);
        
        // Generate 100 student names
        const students = generateEnglishNames();
        
        // Add students to each track
        for (const track of tracks) {
            await addStudentsToTrack(track, students);
        }
        
        console.log("All students have been added to all tracks successfully");
    } catch (error) {
        console.error("Error adding students to tracks:", error);
    } finally {
        // Close database connection
        mongoose.connection.close();
    }
}

// Execute the main function
addStudentsToAllTracks();
