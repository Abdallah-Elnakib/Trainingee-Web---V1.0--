document.addEventListener('DOMContentLoaded', function() {
    // Get student data from localStorage
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
        // If no data, redirect to login page
        window.location.href = '/api/auth/Login';
        return;
    }
    
    const userData = JSON.parse(userDataString);
    console.log('User data:', userData);
    
    // Verify the user is a student
    if (userData.role !== 'student') {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'This page is for students only',
            confirmButtonText: 'Go Back'
        }).then(() => {
            window.location.href = '/api/auth/Login';
        });
        return;
    }
    
    // Display basic student information
    document.getElementById('student-name').textContent = userData.name || 'Student Dashboard';
    // We'll update the student ID after fetching the full data
    document.getElementById('tracks-count').textContent = userData.tracks ? userData.tracks.length : 0;
    
    // Fetch student data from server
    fetchStudentData(userData.id);
});

async function fetchStudentData(studentId) {
    try {
        // Get access token from local storage
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('Access token not found');
        }
        
        console.log('Fetching data for student ID:', studentId);
        
        const response = await fetch(`/api/students/student-data/${studentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch student data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Student data received:', data);
        
        // Update student ID in the header with the track-specific ID
        if (data.student && data.student.id) {
            document.getElementById('student-id').textContent = data.student.id;
        }
        
        renderStudentData(data);
    } catch (error) {
        console.error('Error fetching student data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'An error occurred while fetching student data'
        });
    }
}

function renderStudentData(data) {
    const tracksContainer = document.getElementById('tracks-container');
    const trackTemplate = document.getElementById('track-template');
    const taskTemplate = document.getElementById('task-template');
    const noTracksTemplate = document.getElementById('no-tracks-template');
    
    // Clear container before adding new data
    tracksContainer.innerHTML = '';
    
    // Display data for each student track
    if (data.tracksData && data.tracksData.length > 0) {
        data.tracksData.forEach(track => {
            // Create a copy of the track template
            const trackElement = document.importNode(trackTemplate.content, true);
            
            // Fill in track data
            trackElement.querySelector('.track-name').textContent = track.trackName;
            
            // Set track status with appropriate color
            const statusBadge = trackElement.querySelector('.track-status');
            statusBadge.textContent = track.status;
            
            // Set status color based on status value
            if (track.status === 'In Progress') {
                statusBadge.classList.add('badge-warning');
            } else if (track.status === 'Completed') {
                statusBadge.classList.add('badge-success');
            } else if (track.status === 'Rejected') {
                statusBadge.classList.add('badge-danger');
            } else if (track.status === 'Pending') {
                statusBadge.classList.add('badge-info');
            } else {
                statusBadge.classList.add('badge-secondary');
            }
            
            // Display all grades and details
            trackElement.querySelector('.track-degrees').textContent = 
                `Score: ${track.degrees || 0} / ${track.totalDegrees || 0}`;
                
            // Add additional grade info and comments if they exist
            const trackHeader = trackElement.querySelector('.track-header');
            const additionalInfo = document.createElement('div');
            additionalInfo.className = 'track-additional-info mt-2';
            additionalInfo.innerHTML = `
                <div class="track-grades-details p-2 rounded" style="background-color: rgba(255,255,255,0.1);">
                    <div><strong>Main Grade:</strong> ${track.degrees || 0}</div>
                    <div><strong>Additional Grade:</strong> ${track.additional || 0}</div>
                    <div><strong>Total Grade:</strong> ${track.totalDegrees || 0}</div>
                </div>
                <div class="track-comments mt-2 p-2 rounded" style="background-color: rgba(255,255,255,0.1);">
                    <strong>Comments:</strong> ${track.comments || 'No comments'}
                </div>
            `;
            trackHeader.appendChild(additionalInfo);
            
            // Get the task list element
            const taskList = trackElement.querySelector('.task-list');
            
            // Display tasks
            if (track.tasks && track.tasks.length > 0) {
                track.tasks.forEach(task => {
                    // Create a copy of the task template
                    const taskElement = document.importNode(taskTemplate.content, true);
                    
                    // Fill in task data
                    taskElement.querySelector('.task-name').textContent = task.taskName;
                    
                    // Display task grades with full details
                    taskElement.querySelector('.task-grade').textContent = 
                        `${task.studentTaskDegree || 0} / ${task.taskDegree || 0}`;
                        
                    // Add additional information about the task
                    const taskInfo = document.createElement('div');
                    taskInfo.className = 'task-additional-info mt-2';
                    
                    // Create a detailed breakdown of task scores
                    let taskDetailsHTML = `
                        <div class="task-score-details p-2 bg-light rounded mb-2">
                            <div class="row">
                                <div class="col-6"><strong>Main Grade:</strong> ${task.studentTaskDegree || 0}/${task.taskDegree || 0}</div>
                                <div class="col-6"><strong>Task Type:</strong> ${task.taskType || 'Regular'}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-6"><strong>Additional Grade:</strong> ${task.additionalGrade || 0}</div>
                                <div class="col-6"><strong>Total:</strong> ${(parseInt(task.studentTaskDegree || 0) + parseInt(task.additionalGrade || 0))}/${task.taskDegree || 0}</div>
                            </div>
                        </div>
                    `;
                    
                    // Add any comments if available
                    if (task.comments) {
                        taskDetailsHTML += `
                            <div class="task-comments p-2 bg-light rounded">
                                <strong>Comments:</strong> ${task.comments}
                            </div>
                        `;
                    }
                    
                    taskInfo.innerHTML = taskDetailsHTML;
                    taskElement.querySelector('.task-header').after(taskInfo);
                    
                    taskElement.querySelector('.task-degree-info').textContent = 
                        `Task Grade`;
                    
                    // Handle questions if present
                    let questions = [];
                    try {
                        if (task.Questions) {
                            questions = JSON.parse(task.Questions);
                        }
                    } catch (error) {
                        console.error('Error parsing questions:', error);
                    }
                    
                    // Display questions if present
                    const questionsContainer = taskElement.querySelector('.questions-container');
                    const questionsToggle = taskElement.querySelector('.questions-toggle');
                    const toggleText = questionsToggle.querySelector('.toggle-text');
                    const questionsContent = questionsContainer.querySelector('.questions-content');
                    
                    if (questions && questions.length > 0) {
                        displayTaskQuestions(task, questionsContainer);
                        
                        // Add event listener to show/hide questions button
                        questionsToggle.addEventListener('click', function() {
                            if (questionsContent.style.display === 'none') {
                                questionsContent.style.display = 'block';
                                toggleText.textContent = 'Hide Questions';
                            } else {
                                questionsContent.style.display = 'none';
                                toggleText.textContent = 'Show Questions';
                            }
                        });
                    } else {
                        // No questions available
                        questionsToggle.innerHTML = '<i class="fas fa-info-circle"></i> No Questions Available';
                        questionsToggle.style.cursor = 'default';
                    }
                    
                    // La función setupTaskSubmission ha sido eliminada para el modo de visualización manual
                    
                    // Add task to the task list
                    taskList.appendChild(taskElement);
                });
            } else {
                // If no tasks
                const noTasksElement = document.createElement('li');
                noTasksElement.classList.add('task-item', 'text-center', 'text-muted');
                noTasksElement.textContent = 'No tasks available for this track';
                taskList.appendChild(noTasksElement);
            }
            
            // Add track element to the container
            tracksContainer.appendChild(trackElement);
        });
    } else {
        // If no tracks, use the no-tracks template
        const noTracksElement = document.importNode(noTracksTemplate.content, true);
        tracksContainer.appendChild(noTracksElement);
    }
}

/**
 * Display task questions in view-only mode with complete details and grades
 */
function displayTaskQuestions(task, questionsContainer) {
    // Get the questions content area
    const questionsContent = questionsContainer.querySelector('.questions-content');
    questionsContent.innerHTML = '';
    
    // Get task questions
    let questions = [];
    try {
        if (task.Questions) {
            questions = JSON.parse(task.Questions);
        }
    } catch (error) {
        console.error('Error parsing questions:', error);
    }
    
    if (questions.length === 0) {
        questionsContent.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle mr-2"></i> No Questions Available</div>';
        return;
    }
    
    // Calculate points per question
    const totalPoints = task.taskDegree || 100;
    const pointsPerQuestion = Math.floor(totalPoints / questions.length);
    
    // Create a container for all questions
    const questionsWrapper = document.createElement('div');
    questionsWrapper.className = 'questions-wrapper';
    
    // Add task details card with complete information including all grades
    const taskDetailsCard = document.createElement('div');
    taskDetailsCard.className = 'card mb-4';
    taskDetailsCard.innerHTML = `
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="fas fa-info-circle mr-2"></i> Complete Task Details</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Task Name:</strong> ${task.taskName}</p>
                    <p><strong>Description:</strong> ${task.taskDescription || 'Not available'}</p>
                    <p><strong>Total Points:</strong> ${task.taskDegree || 100}</p>
                    <p><strong>Task Type:</strong> ${task.taskType || 'Regular'}</p>
                </div>
                <div class="col-md-6">
                    <div class="card bg-light">
                        <div class="card-header"><strong>Grade Details</strong></div>
                        <div class="card-body p-2">
                            <div class="mb-2"><strong>Main Grade:</strong> ${task.studentTaskDegree || 0} / ${task.taskDegree || 100}</div>
                            <div class="mb-2"><strong>Additional Grade:</strong> ${task.additionalGrade || 0}</div>
                            <div class="mb-2"><strong>Total Grade:</strong> ${(parseInt(task.studentTaskDegree || 0) + parseInt(task.additionalGrade || 0))} / ${task.taskDegree || 100}</div>
                            <div class="mb-2"><strong>Status:</strong> 
                                <span class="badge ${task.studentTaskDegree ? 'badge-success' : 'badge-warning'}">
                                    ${task.studentTaskDegree ? 'Submitted' : 'Not Submitted'}
                                </span>
                            </div>
                            <div><strong>Questions:</strong> ${questions.length}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Task comments section -->
            <div class="task-comments-section mt-3">
                <div class="card">
                    <div class="card-header bg-secondary text-white">
                        <h6 class="mb-0"><i class="fas fa-comments mr-2"></i> Comments</h6>
                    </div>
                    <div class="card-body">
                        ${task.comments ? task.comments : 'No comments available for this task.'}
                    </div>
                </div>
            </div>
            
            <div class="alert alert-info mt-3 mb-0">
                <i class="fas fa-eye mr-2"></i> <strong>View-Only Mode:</strong> This task is in view-only mode with complete details and grades. For manual submissions, please contact your instructor.
            </div>
        </div>
    `;
    questionsContent.appendChild(taskDetailsCard);
    
    // Add each question with its own answer field or view-only display
    questions.forEach((question, index) => {
        const questionText = question.text || question;
        const questionId = `question-${task._id || 'task'}-${index}`;
        
        // Create question card
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card card mb-3';
        questionCard.dataset.questionIndex = index;
        
        // Check if this question has been answered
        const questionAnswer = task.answers && task.answers[index] ? task.answers[index].answer : '';
        const questionFeedback = task.answers && task.answers[index] ? task.answers[index].feedback : '';
        const questionScore = task.answers && task.answers[index] ? task.answers[index].score : 0;
        const isAnswered = task.answers && task.answers[index] && task.answers[index].submitted;
        
        // Build the question card content with enhanced information
        questionCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center ${isAnswered ? 'bg-light' : ''}">
                <h6 class="mb-0">Question ${index + 1} <small>(${pointsPerQuestion} points)</small></h6>
                <div class="question-status ${isAnswered ? 'text-success' : 'text-secondary'}">
                    ${isAnswered ? `<i class="fas fa-check-circle"></i> Submitted - Score: ${questionScore}/${pointsPerQuestion}` : '<i class="fas fa-eye"></i> View Only'}
                </div>
            </div>
            <div class="card-body">
                <div class="question-details mb-4">
                    <h6 class="font-weight-bold mb-2">Question:</h6>
                    <div class="p-3 bg-light rounded">${questionText}</div>
                </div>
                
                ${isAnswered ? `
                <div class="answer-section">
                    <div class="form-group">
                        <h6 class="font-weight-bold mb-2">Your Answer:</h6>
                        <div class="p-3 bg-light rounded">${questionAnswer}</div>
                    </div>
                </div>
                <div class="grade-details mt-3">
                    <h6 class="font-weight-bold mb-2">Grade Details:</h6>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <tr>
                                <th>Score</th>
                                <td>${questionScore} / ${pointsPerQuestion}</td>
                            </tr>
                            <tr>
                                <th>Percentage</th>
                                <td>${Math.round((questionScore/pointsPerQuestion) * 100)}%</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>
                                    <span class="badge ${questionScore >= pointsPerQuestion * 0.7 ? 'badge-success' : questionScore >= pointsPerQuestion * 0.4 ? 'badge-warning' : 'badge-danger'}">
                                        ${questionScore >= pointsPerQuestion * 0.7 ? 'Excellent' : questionScore >= pointsPerQuestion * 0.4 ? 'Good' : 'Needs Improvement'}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="ai-feedback mt-3">
                    <h6 class="font-weight-bold mb-2">AI Feedback:</h6>
                    <div class="card">
                        <div class="card-body">
                            <div class="feedback-content">${questionFeedback}</div>
                            <div class="feedback-score mt-3 font-weight-bold ${questionScore >= pointsPerQuestion * 0.7 ? 'text-success' : questionScore >= pointsPerQuestion * 0.4 ? 'text-warning' : 'text-danger'}">
                                ${questionScore >= pointsPerQuestion * 0.7 ? 'Great job! ' : questionScore >= pointsPerQuestion * 0.4 ? 'Good effort! ' : 'You can do better! '}
                                ${questionScore}/${pointsPerQuestion} points awarded.
                            </div>
                        </div>
                    </div>
                </div>` : `
                <div class="view-only-message alert alert-secondary">
                    <i class="fas fa-eye mr-2"></i> This question is available for viewing only. For manual submissions, please contact your instructor.
                </div>`}
            </div>
        `;
        
        // Add to questions wrapper
        questionsWrapper.appendChild(questionCard);
    });
    
    // Add questions wrapper to content
    questionsContent.appendChild(questionsWrapper);
    
    // Add a summary card with overall performance
    const summaryCard = document.createElement('div');
    summaryCard.className = 'card mt-4';
    
    // Calculate overall performance
    let answeredCount = 0;
    let totalScore = 0;
    
    if (task.answers && Array.isArray(task.answers)) {
        task.answers.forEach(answer => {
            if (answer && answer.submitted) {
                answeredCount++;
                totalScore += answer.score || 0;
            }
        });
    }
    
    const completionPercentage = Math.round((answeredCount / questions.length) * 100);
    const gradePercentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
    
    summaryCard.innerHTML = `
        <div class="card-header bg-dark text-white">
            <h5 class="mb-0"><i class="fas fa-chart-pie mr-2"></i> Overall Performance Summary</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <h6 class="font-weight-bold">Completion:</h6>
                    <div class="progress mb-3" style="height: 25px;">
                        <div class="progress-bar ${completionPercentage >= 70 ? 'bg-success' : completionPercentage >= 40 ? 'bg-warning' : 'bg-danger'}" 
                             role="progressbar" style="width: ${completionPercentage}%" 
                             aria-valuenow="${completionPercentage}" aria-valuemin="0" aria-valuemax="100">
                            ${completionPercentage}%
                        </div>
                    </div>
                    <p>${answeredCount} of ${questions.length} questions answered</p>
                </div>
                <div class="col-md-6">
                    <h6 class="font-weight-bold">Grade Performance:</h6>
                    <div class="progress mb-3" style="height: 25px;">
                        <div class="progress-bar ${gradePercentage >= 70 ? 'bg-success' : gradePercentage >= 40 ? 'bg-warning' : 'bg-danger'}" 
                             role="progressbar" style="width: ${gradePercentage}%" 
                             aria-valuenow="${gradePercentage}" aria-valuemin="0" aria-valuemax="100">
                            ${gradePercentage}%
                        </div>
                    </div>
                    <p>Score: ${totalScore} / ${totalPoints} points</p>
                </div>
            </div>
        </div>
    `;
    
    questionsContent.appendChild(summaryCard);
    
    // Remove any submit buttons that might exist
    const submitAllButton = questionsContainer.querySelector('.submit-all-answers');
    if (submitAllButton) {
        submitAllButton.remove(); // Eliminarlo completamente en lugar de ocultarlo
    }
    
    // Update overall task status
    updateTaskOverallStatus(task, questionsContainer);
}

/**
 * Update the task grade based on the answers
 */
function updateTaskGrade(task, taskItem, totalPoints) {
    const taskGradeElement = taskItem.querySelector('.task-grade');
    if (taskGradeElement) {
        let totalScore = 0;
        // Calculate total score from all answered questions
        if (task.answers && Array.isArray(task.answers)) {
            task.answers.forEach((ans) => {
                if (ans && ans.submitted) {
                    totalScore += ans.score || 0;
                }
            });
        }
        taskGradeElement.textContent = `${totalScore} / ${totalPoints}`;
    }
}

/**
 * Update the overall status of a task based on question submissions for view-only mode
 */
function updateTaskOverallStatus(task, questionsContainer) {
    const statusElement = questionsContainer.querySelector('.task-overall-status');
    if (!statusElement) return;
    
    // Get task questions
    let questions = [];
    try {
        if (task.Questions) {
            questions = JSON.parse(task.Questions);
        }
    } catch (error) {
        console.error('Error parsing questions:', error);
    }
    
    if (questions.length === 0) {
        statusElement.innerHTML = '';
        return;
    }
    
    // Count answered questions
    let answeredCount = 0;
    let totalScore = 0;
    const totalPoints = task.taskDegree || 100;
    const pointsPerQuestion = Math.floor(totalPoints / questions.length);
    
    if (task.answers && Array.isArray(task.answers)) {
        task.answers.forEach(answer => {
            if (answer && answer.submitted) {
                answeredCount++;
                totalScore += answer.score || 0;
            }
        });
    }
    
    // Mostrar el estado como vista previa (view-only) si no hay respuestas
    if (answeredCount === 0) {
        statusElement.innerHTML = '<span class="badge badge-secondary"><i class="fas fa-eye"></i> View Only - Manual Submission</span>';
    } else if (answeredCount < questions.length) {
        statusElement.innerHTML = `<span class="badge badge-info"><i class="fas fa-spinner"></i> ${answeredCount}/${questions.length} questions answered - Manual Submission</span>`;
    } else {
        const percentageScore = (totalScore / totalPoints) * 100;
        let badgeClass = 'badge-danger';
        let icon = 'fa-times-circle';
        
        if (percentageScore >= 70) {
            badgeClass = 'badge-success';
            icon = 'fa-check-circle';
        } else if (percentageScore >= 40) {
            badgeClass = 'badge-primary';
            icon = 'fa-info-circle';
        }
        
        statusElement.innerHTML = `<span class="badge ${badgeClass}"><i class="fas ${icon}"></i> All questions answered - Score: ${totalScore}/${totalPoints}</span>`;
    }
}

/**
 * Función vacía para reemplazar la antigua función de envío individual
 * El envío de tareas ahora es manual en lugar de automático
 */
function handleQuestionSubmission(task, questionIndex, submitButton) {
    // Esta función se mantiene vacía para compatibilidad con el código existente
    console.log('El envío automático de preguntas ha sido desactivado.');
}

// Las funciones auxiliares relacionadas con el envío automático han sido eliminadas
// puesto que el envío ahora es manual

/**
 * Función vacía para reemplazar la antigua función de envío múltiple
 * El envío de tareas ahora es manual en lugar de automático
 */
function handleAllQuestionsSubmission(task, questionsContainer) {
    // Esta función se mantiene vacía para compatibilidad con el código existente
    console.log('El envío automático de tareas ha sido desactivado.');
}

// Logout function
/**
 * Handle the submission of a task answer
 */
async function handleTaskSubmission(event) {
    const submitButton = event.target;
    const taskItem = submitButton.closest('.task-item');
    const submissionForm = taskItem.querySelector('.submission-form');
    const answerInput = taskItem.querySelector('.answer-input');
    const submissionStatus = taskItem.querySelector('.submission-status');
    const aiFeedback = taskItem.querySelector('.ai-feedback');
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Please login again to continue.',
            confirmButtonText: 'Login'
        }).then(() => {
            window.location.href = '/api/auth/Login';
        });
        return;
    }
    
    // Get task data
    const trackCard = taskItem.closest('.track-card');
    const trackName = trackCard.querySelector('.track-name').textContent;
    const taskName = taskItem.querySelector('.task-name').textContent;
    const answer = answerInput.value.trim();
    
    // Validate answer
    if (!answer) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Answer',
            text: 'Please enter your answer before submitting.',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Submitting...';
        submissionStatus.textContent = 'Evaluating your answer...';
        submissionStatus.className = 'submission-status grading';
        
        // Get access token from local storage
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('Access token not found');
        }
        
        // Submit answer to server
        const response = await fetch('/api/students/submit-task-answer', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                trackName,
                studentId: userData.id,
                taskName,
                answer
            })
        });
        
        const data = await response.json();
        
        if (response.status === 200) {
            // Update UI with feedback and score
            submissionStatus.textContent = `Submitted and graded. Score: ${data.score}/${data.maxScore}`;
            submissionStatus.className = 'submission-status submitted';
            
            // Update task grade in the UI
            taskItem.querySelector('.task-grade').textContent = `${data.score} / ${data.maxScore}`;
            
            // Show AI feedback
            aiFeedback.classList.remove('d-none');
            aiFeedback.querySelector('.feedback-content').textContent = data.feedback;
            
            const feedbackScore = aiFeedback.querySelector('.feedback-score');
            const scorePercentage = (data.score / data.maxScore) * 100;
            
            if (scorePercentage >= 70) {
                feedbackScore.textContent = `Great job! ${data.score}/${data.maxScore} points awarded.`;
                feedbackScore.className = 'feedback-score mt-2 font-weight-bold correct';
            } else if (scorePercentage >= 40) {
                feedbackScore.textContent = `Good effort! ${data.score}/${data.maxScore} points awarded.`;
                feedbackScore.className = 'feedback-score mt-2 font-weight-bold';
            } else {
                feedbackScore.textContent = `You can do better! ${data.score}/${data.maxScore} points awarded.`;
                feedbackScore.className = 'feedback-score mt-2 font-weight-bold incorrect';
            }
            
            // Disable input and button
            answerInput.disabled = true;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Submitted';
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Task Submitted',
                text: `Your answer has been evaluated. Score: ${data.score}/${data.maxScore}`,
                confirmButtonText: 'OK'
            });
            
        } else if (response.status === 400 && data.message === 'Task already submitted') {
            // Task was already submitted
            submissionStatus.textContent = `Already submitted. Score: ${data.score}`;
            submissionStatus.className = 'submission-status submitted';
            
            // Disable input and button
            answerInput.disabled = true;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Already Submitted';
            
            if (data.feedback) {
                // Show previous feedback
                aiFeedback.classList.remove('d-none');
                aiFeedback.querySelector('.feedback-content').textContent = data.feedback;
                aiFeedback.querySelector('.feedback-score').textContent = `${data.score} points awarded.`;
            }
            
            Swal.fire({
                icon: 'info',
                title: 'Already Submitted',
                text: 'This task has already been submitted and cannot be resubmitted.',
                confirmButtonText: 'OK'
            });
            
        } else {
            // Handle error
            throw new Error(data.message || 'Error submitting task');
        }
        
    } catch (error) {
        console.error('Error submitting task:', error);
        
        // Reset UI
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit Answer';
        submissionStatus.textContent = 'Submission failed. Try again.';
        submissionStatus.className = 'submission-status not-submitted';
        
        Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: error.message || 'An error occurred while submitting your answer. Please try again.',
            confirmButtonText: 'OK'
        });
    }
}

/**
 * Setup task submission UI based on task status
 */
function setupTaskSubmission(taskElement, task) {
    // En la nueva estructura, no necesitamos configurar la sección de envío global
    // ya que cada pregunta tiene su propia sección de envío
    
    // Actualizar el estado general de la tarea
    const taskStatus = taskElement.querySelector('.task-overall-status');
    
    if (taskStatus) {
        // Calcular el progreso de la tarea
        let totalAnswered = 0;
        let totalScore = 0;
        const totalPoints = task.taskDegree || 100;
        
        if (task.answers && Array.isArray(task.answers)) {
            totalAnswered = task.answers.filter(a => a && a.submitted).length;
            task.answers.forEach(a => {
                if (a && a.submitted) {
                    totalScore += a.score || 0;
                }
            });
        }
        
        // Obtener el número total de preguntas
        let questions = [];
        try {
            if (task.Questions) {
                questions = JSON.parse(task.Questions);
            }
        } catch (error) {
            console.error('Error parsing questions:', error);
        }
        
        const totalQuestions = questions.length || 0;
        
        // Actualizar la visualización del estado
        if (totalQuestions === 0) {
            // No hay preguntas
            taskStatus.innerHTML = '';
        } else if (totalAnswered === 0) {
            // Ninguna pregunta respondida
            taskStatus.innerHTML = '<span class="badge badge-warning"><i class="fas fa-exclamation-circle"></i> No questions answered</span>';
        } else if (totalAnswered < totalQuestions) {
            // Algunas preguntas respondidas
            taskStatus.innerHTML = `<span class="badge badge-info"><i class="fas fa-spinner"></i> ${totalAnswered}/${totalQuestions} questions answered</span>`;
        } else {
            // Todas las preguntas respondidas
            const percentage = (totalScore / totalPoints) * 100;
            if (percentage >= 70) {
                taskStatus.innerHTML = `<span class="badge badge-success"><i class="fas fa-check-circle"></i> Completed with ${totalScore}/${totalPoints} points</span>`;
            } else if (percentage >= 40) {
                taskStatus.innerHTML = `<span class="badge badge-primary"><i class="fas fa-check"></i> Completed with ${totalScore}/${totalPoints} points</span>`;
            } else {
                taskStatus.innerHTML = `<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Completed with ${totalScore}/${totalPoints} points</span>`;
            }
        }
    }
    
    // Configurar botón de envío de todas las respuestas
    const submitAllButton = taskElement.querySelector('.submit-all-answers');
    if (submitAllButton) {
        // Si todas las preguntas ya han sido respondidas, deshabilitar el botón
        let questions = [];
        try {
            if (task.Questions) {
                questions = JSON.parse(task.Questions);
            }
        } catch (error) {
            console.error('Error parsing questions:', error);
        }
        
        if (questions.length > 0 && task.answers && Array.isArray(task.answers)) {
            const allAnswered = task.answers.filter(a => a && a.submitted).length === questions.length;
            if (allAnswered) {
                submitAllButton.disabled = true;
                submitAllButton.textContent = 'All Answers Submitted';
            }
        }
    }
}

/**
 * Logout function
 */
function logout() {
    // Clear user data from local storage
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/api/auth/Login';
}
