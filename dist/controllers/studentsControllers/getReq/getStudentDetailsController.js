"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentDetails = void 0;
const tracksSchema_1 = require("../../../models/tracksSchema");
// Helper function to calculate student progress in a track
function calculateStudentProgress(student) {
    // Try to find task data in various possible properties
    const tasks = (student === null || student === void 0 ? void 0 : student.BasicTotal) || (student === null || student === void 0 ? void 0 : student.Tasks) || (student === null || student === void 0 ? void 0 : student.tasks) || [];
    if (!student || !Array.isArray(tasks) || tasks.length === 0) {
        return 0;
    }
    // Filter out invalid tasks
    const validTasks = tasks.filter((task) => task !== null && task !== undefined);
    const totalTasks = validTasks.length;
    if (totalTasks === 0)
        return 0;
    const completedTasks = validTasks.filter((task) => {
        // Check all possible completion indicators
        return (
        // Degree-based model: if task degree is greater than zero
        (task.studentTaskDegree && Number(task.studentTaskDegree) > 0) ||
            (task.degreeValue && Number(task.degreeValue) > 0) ||
            // Status-based model: if task status is 'Completed'
            task.Status === 'Completed' ||
            task.status === 'Completed' ||
            // Completion model: if completed property is true
            task.completed === true ||
            task.Completed === true ||
            // Progress model: if progress percentage is 100%
            task.progress === 100 ||
            task.Progress === 100);
    }).length;
    return (completedTasks / totalTasks) * 100;
}
// Helper function to calculate average score
function calculateAverageScore(student) {
    // Try to find task data in various possible properties
    const tasks = (student === null || student === void 0 ? void 0 : student.BasicTotal) || (student === null || student === void 0 ? void 0 : student.Tasks) || (student === null || student === void 0 ? void 0 : student.tasks) || [];
    if (!student || !Array.isArray(tasks) || tasks.length === 0) {
        return 0;
    }
    // Filter out invalid tasks
    const validTasks = tasks.filter((task) => task !== null && task !== undefined);
    const totalTasks = validTasks.length;
    if (totalTasks === 0)
        return 0;
    // Calculate total obtained score and maximum possible score
    let obtainedScore = 0;
    let maxScore = 0;
    validTasks.forEach((task) => {
        // Handle all possible scoring systems
        if (task.studentTaskDegree !== undefined) {
            // Using degree-based scoring (primary system)
            obtainedScore += Number(task.studentTaskDegree) || 0;
            maxScore += Number(task.taskDegree) || 0;
        }
        else if (task.Score !== undefined || task.score !== undefined) {
            // Using direct score values (alternative system)
            obtainedScore += Number(task.Score || task.score) || 0;
            // If MaxScore is available, use it, otherwise assume 100 for completed tasks
            maxScore += Number(task.MaxScore || task.maxScore) ||
                ((task.Status === 'Completed' || task.status === 'Completed') ? 100 : 0);
        }
        else if (task.grade !== undefined || task.Grade !== undefined) {
            // Using grade-based system
            obtainedScore += Number(task.grade || task.Grade) || 0;
            maxScore += Number(task.maxGrade || task.MaxGrade) || 100; // Default max grade is 100
        }
    });
    return maxScore > 0 ? (obtainedScore / maxScore) * 100 : 0;
}
// دالة مساعدة للعثور على الطالب حسب ترتيبه في المسار كبديل لاستخدام المعرف
const findStudentByIndex = (trackData, requestedIndex) => {
    if (!trackData || !Array.isArray(trackData) || requestedIndex < 0 || requestedIndex >= trackData.length) {
        return null;
    }
    return trackData[requestedIndex];
};
// دالة مساعدة للعثور على الطالب حسب اسمه (بحث جزئي)
const findStudentByName = (trackData, requestedName) => {
    if (!trackData || !Array.isArray(trackData) || !requestedName) {
        return null;
    }
    const normalizedName = requestedName.toLowerCase().trim();
    return trackData.find(student => {
        if (!student || !student.Name)
            return false;
        return student.Name.toLowerCase().includes(normalizedName);
    });
};
const getStudentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // For debugging: Always log the exact request path and parameters
        console.log(`[DEBUG] Student details request path: ${req.originalUrl}`);
        console.log(`[DEBUG] Request parameters: ${JSON.stringify(req.params)}`);
        console.log(`[DEBUG] Request query: ${JSON.stringify(req.query)}`);
        console.log(`[DEBUG] Request method: ${req.method}`);
        // استلام معرف/رقم الطالب من طلب المستخدم
        const requestedId = req.params.studentId;
        console.log(`Received request for student details with ID: ${requestedId}`);
        // تحويل معرف الطالب لعدة صيغ للبحث
        const requestedIdStr = String(requestedId).trim();
        const requestedIdNormalized = requestedIdStr.replace(/^0+/, ''); // إزالة الأصفار البادئة
        const requestedIdNumeric = parseInt(requestedIdStr);
        let requestedIdPadded = requestedIdStr;
        // إذا كان المعرف رقمي، نحاول تنسيقه بإضافة أصفار للوصول إلى 4 أرقام
        if (!isNaN(requestedIdNumeric) && requestedIdStr.length < 4) {
            requestedIdPadded = requestedIdNumeric.toString().padStart(4, '0');
        }
        console.log('Looking for student with any of these ID formats:');
        console.log(`- Original: "${requestedIdStr}"`);
        console.log(`- Normalized (no leading zeros): "${requestedIdNormalized}"`);
        console.log(`- As number: ${requestedIdNumeric}`);
        console.log(`- Padded to 4 digits: "${requestedIdPadded}"`);
        console.log('--------------- OR ---------------');
        console.log('Using index-based approach as a fallback since IDs are undefined in DB');
        // البحث بناءً على الرقم التسلسلي للطالب في المسار (بديل عن المعرف)
        const indexToFind = parseInt(requestedIdStr) - 1; // تحويل المعرف إلى index (مع الأخذ في الاعتبار أن الرقم يبدأ من 1 وليس 0)
        console.log(`Looking for student at index: ${indexToFind}`);
        // الحصول على جميع المسارات لكي نبحث فيها عن الطالب المطلوب
        const tracks = yield tracksSchema_1.Track.find({});
        console.log(`Total tracks in database: ${tracks.length}`);
        // إنشاء مصفوفة لتخزين المسارات التي تحتوي على الطالب المطلوب
        const tracksWithStudent = [];
        // تكرار عبر كل مسار للبحث عن الطالب
        for (const track of tracks) {
            if (!track.trackData || !Array.isArray(track.trackData))
                continue;
            // طباعة معلومات الطلاب في هذا المسار للتشخيص
            console.log(`\n----- All Student IDs in track ${track.trackName} -----`);
            track.trackData.forEach((student, index) => {
                if (student) {
                    console.log(`  ${index + 1}. Name: ${student.Name || 'Unknown'}, ID: ${student.Id === undefined ? 'undefined' : student.Id}`);
                }
            });
            let studentInTrack = null;
            // 1. أولًا: البحث حسب الموقع التسلسلي (إذا كان رقمًا صالحًا)
            if (!isNaN(indexToFind) && indexToFind >= 0 && indexToFind < track.trackData.length) {
                studentInTrack = track.trackData[indexToFind];
                console.log(`Found student by index ${indexToFind}: ${studentInTrack.Name || 'Unknown'}`);
            }
            // 2. ثانيًا: إذا لم نجد بالموقع، نبحث عن طريق الاسم (في حالة أن المعرف هو في الواقع اسم أو جزء من اسم)
            if (!studentInTrack && requestedIdStr.length > 1 && isNaN(requestedIdNumeric)) {
                studentInTrack = findStudentByName(track.trackData, requestedIdStr);
                if (studentInTrack) {
                    console.log(`Found student by name matching '${requestedIdStr}': ${studentInTrack.Name}`);
                }
            }
            // 3. أخيرًا: نبحث بكل طرق المطابقة القديمة للتوافق الخلفي
            if (!studentInTrack) {
                studentInTrack = track.trackData.find(student => {
                    if (!student)
                        return false;
                    // المطابقة البديلة: إذا كان المعرف رقميًا، نبحث عن الطالب بالترتيب الرقمي
                    if (!isNaN(requestedIdNumeric) && requestedIdNumeric > 0 && requestedIdNumeric <= track.trackData.length) {
                        const index = requestedIdNumeric - 1;
                        return track.trackData[index] === student;
                    }
                    // المطابقة بالاسم إذا كانت الأحرف كافية للمقارنة
                    if (requestedIdStr.length > 1 && student.Name) {
                        return student.Name.toLowerCase().includes(requestedIdStr.toLowerCase());
                    }
                    return false;
                });
            }
            // إذا وجدنا الطالب في هذا المسار، أضفه إلى قائمة المسارات التي تحتوي على الطالب
            if (studentInTrack) {
                console.log(`\u2705 FOUND STUDENT: ${studentInTrack.Name || 'Unknown'} in track: ${track.trackName}`);
                tracksWithStudent.push({
                    track: track,
                    studentData: studentInTrack
                });
            }
        }
        console.log(`Found student in ${tracksWithStudent.length} tracks`);
        if (tracksWithStudent.length === 0) {
            console.log(`No tracks found for student ID: ${requestedId}`);
            return res.status(404).json({
                success: false,
                message: `Student with ID ${requestedId} not found in any track`
            });
        }
        // استخراج معلومات الطالب الأساسية من أول مسار
        const firstTrackWithStudent = tracksWithStudent[0];
        const studentBaseInfo = firstTrackWithStudent.studentData;
        if (!studentBaseInfo) {
            console.log(`Warning: Found tracks but couldn't extract student info`);
            return res.status(500).json({
                success: false,
                message: `The student was found but their personal information could not be retrieved`,
                details: 'There is a problem with the data structure. Please contact the system administrator.'
            });
        }
        // إنشاء كائن لتخزين تفاصيل الطالب الكاملة مع تحديد نوع البيانات
        const studentDetails = {
            studentInfo: {
                id: studentBaseInfo.Id || requestedId,
                name: studentBaseInfo.Name || 'Unknown Student',
                email: studentBaseInfo.Email || '',
                phone: studentBaseInfo.Phone || '',
                joinDate: studentBaseInfo.JoinDate || ''
            },
            tracks: [], // سيتم ملؤها لاحقاً
            overallProgress: 0,
            averageScore: 0,
            completedTasks: 0,
            totalTasks: 0
        };
        // معالجة بيانات كل مسار وحساب الإحصائيات
        let totalProgress = 0;
        let totalScore = 0;
        let totalTaskCount = 0;
        let completedTaskCount = 0;
        // إضافة بيانات كل مسار إلى تفاصيل الطالب
        for (const trackWithStudent of tracksWithStudent) {
            const track = trackWithStudent.track;
            const studentInTrack = trackWithStudent.studentData;
            // حساب تقدم الطالب في المسار
            const progress = calculateStudentProgress(studentInTrack);
            // حساب متوسط الدرجات
            const averageScore = calculateAverageScore(studentInTrack);
            // استخراج المهام من مختلف الحقول المحتملة (يدعم جميع أنواع بنية البيانات)
            const tasks = studentInTrack.BasicTotal || studentInTrack.Tasks || studentInTrack.tasks || [];
            // تنقيح وتصفية المهام غير الصالحة
            const validTasks = tasks.filter((task) => task !== null && task !== undefined);
            // حساب المهام المكتملة بناءً على جميع المعايير المحتملة
            const completedTasks = validTasks.filter((task) => {
                // فحص جميع أنواع المؤشرات على اكتمال المهمة
                return (
                // نموذج الدرجات: إذا كانت درجة المهمة أكبر من صفر
                (task.studentTaskDegree && Number(task.studentTaskDegree) > 0) ||
                    (task.degreeValue && Number(task.degreeValue) > 0) ||
                    // نموذج الحالة: إذا كانت حالة المهمة 'مكتملة'
                    task.Status === 'Completed' ||
                    task.status === 'Completed' ||
                    // نموذج الإكمال: إذا كانت خاصية completed تساوي true
                    task.completed === true ||
                    task.Completed === true ||
                    // نموذج التقدم: إذا كانت نسبة التقدم 100%
                    task.progress === 100 ||
                    task.Progress === 100);
            }).length;
            // إضافة الإحصائيات الكلية
            totalProgress += progress;
            totalScore += averageScore;
            totalTaskCount += tasks.length;
            completedTaskCount += completedTasks;
            // إنشاء كائن لبيانات المسار مع إحصائيات الطالب فيه
            const trackData = {
                trackId: track._id,
                trackName: track.trackName,
                trackStartDate: track.trackStartDate,
                trackEndDate: track.trackEndDate,
                trackStatus: track.trackStatus,
                studentData: {
                    progress: progress,
                    averageScore: averageScore,
                    totalTasks: tasks.length,
                    completedTasks: completedTasks,
                    tasks: validTasks,
                    comments: studentInTrack.Comments || studentInTrack.comments || []
                }
            };
            studentDetails.tracks.push(trackData);
        }
        // حساب المتوسطات الكلية
        if (tracksWithStudent.length > 0) {
            studentDetails.overallProgress = totalProgress / tracksWithStudent.length;
            studentDetails.averageScore = totalScore / tracksWithStudent.length;
            studentDetails.totalTasks = totalTaskCount;
            studentDetails.completedTasks = completedTaskCount;
        }
        console.log(`Sending student details for ID ${requestedId} with ${studentDetails.tracks.length} tracks`);
        console.log(`Overall progress: ${studentDetails.overallProgress.toFixed(2)}%`);
        console.log(`Average score: ${studentDetails.averageScore.toFixed(2)}`);
        console.log(`Tasks: ${studentDetails.completedTasks}/${studentDetails.totalTasks}`);
        // إرجاع النتائج مع البيانات الملخصة
        return res.status(200).json({
            success: true,
            data: studentDetails
        });
    }
    catch (error) {
        console.error('Error in getStudentDetails:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving student details',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.getStudentDetails = getStudentDetails;
