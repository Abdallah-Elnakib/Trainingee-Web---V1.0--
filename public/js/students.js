/**
 * Students Management Page JavaScript
 * Handles all functionality for the students page including:
 * - Loading and displaying student data
 * - Filtering and searching
 * - Pagination
 * - Student details modal
 * - Export and print functions
 */

// DOM Elements - Main containers
const studentModal = document.getElementById('studentModal');
const filterForm = document.getElementById('filterForm');

// Action buttons
const refreshBtn = document.getElementById('refreshData');
const exportCsvBtn = document.getElementById('exportCsv');
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.querySelector('.close-modal');
const exportStudentDataBtn = document.getElementById('exportStudentData');

// Filter elements
const trackFilter = document.getElementById('trackFilter');
const statusFilter = document.getElementById('statusFilter');
const searchFilter = document.getElementById('searchFilter');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const toggleFiltersBtn = document.getElementById('toggleFilters');

// Table elements
const studentsTableBody = document.getElementById('students-table-body');
const studentCount = document.getElementById('studentCount');
const loadingState = document.getElementById('loadingState');
const noStudentsMessage = document.getElementById('noStudentsMessage');
const totalStudentsCount = document.getElementById('totalStudents');
const activeStudentsCount = document.getElementById('activeStudents');

// Pagination elements
const paginationContainer = document.getElementById('pagination-container');
const paginationPages = document.getElementById('paginationPages');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const perPageSelect = document.getElementById('perPageSelect');
const startItem = document.getElementById('startItem');
const endItem = document.getElementById('endItem');
const totalItems = document.getElementById('totalItems');

// Modal elements
const modalTitle = document.getElementById('modalTitle');
const studentName = document.getElementById('studentName');
const studentId = document.getElementById('studentId');
const totalTracksCount = document.getElementById('totalTracksCount');
const totalTasksCount = document.getElementById('totalTasksCount');
const averageScore = document.getElementById('averageScore');
const studentTracksList = document.getElementById('studentTracksList');
const performanceStatsList = document.getElementById('performanceStatsList');

// State variables
let studentsData = [];
let filteredStudents = [];
let currentPage = 1;
let itemsPerPage = 10;
let tabCharts = {};
let currentStudentDetails = null;
let cachedStudents = [];

/**
 * Initialize the page and set up event listeners
 */
function initializePage() {
    console.log('Initializing students page...');
    
    // Load initial data
    loadStudentsData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update statistics
    updateStatistics();
}

/**
 * Set up all event listeners for interactive elements on the page
 */
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Filter form events
    if (filterForm) {
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function() {
                console.log('Apply filters clicked');
                applyFilters();
            });
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function() {
                console.log('Reset filters clicked');
                resetFilters();
            });
        }
        
        if (clearSearchBtn && searchFilter) {
            clearSearchBtn.addEventListener('click', function() {
                console.log('Clear search clicked');
                searchFilter.value = '';
                applyFilters();
            });
        }
    }
    
    // Table action buttons
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Refresh data clicked');
            loadStudentsData({
                track: trackFilter ? trackFilter.value : 'all',
                status: statusFilter ? statusFilter.value : 'all',
                search: searchFilter ? searchFilter.value : ''
            });
        });
    }
    
    // Export functionality
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            console.log('Export CSV clicked');
            exportAllStudentsToCSV();
        });
    }
    
    // Pagination controls
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function() {
            console.log('Items per page changed to: ' + this.value);
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            renderStudentsTable();
            setupPagination();
        });
    }
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                console.log('Navigate to previous page');
                currentPage--;
                renderStudentsTable();
                setupPagination();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
            if (currentPage < totalPages) {
                console.log('Navigate to next page');
                currentPage++;
                renderStudentsTable();
                setupPagination();
            }
        });
    }
    
    // Modal events
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            console.log('Close modal clicked');
            closeStudentModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            console.log('Close modal button clicked');
            closeStudentModal();
        });
    }
    
    if (exportStudentDataBtn) {
        exportStudentDataBtn.addEventListener('click', function() {
            console.log('Export student data clicked');
            if (currentStudentDetails) {
                exportStudentData(currentStudentDetails.Id);
            }
        });
    }
    
    // Toggle filters visibility
    if (toggleFiltersBtn) {
        toggleFiltersBtn.addEventListener('click', function() {
            console.log('Toggle filters clicked');
            const filterBody = document.querySelector('.panel-body');
            if (filterBody) {
                filterBody.classList.toggle('collapsed');
                toggleFiltersBtn.querySelector('i').classList.toggle('fa-chevron-up');
                toggleFiltersBtn.querySelector('i').classList.toggle('fa-chevron-down');
            }
        });
    }
    
    // Search input - search as you type (with debounce)
    let debounceTimeout;
    if (searchFilter) {
        searchFilter.addEventListener('input', function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                console.log('Search input changed: ' + this.value);
                applyFilters();
            }, 500); // 500ms debounce
        });
    }
    
    // Global event listener for table sort headers
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', function() {
            const sortBy = this.getAttribute('data-sort');
            console.log('Sort by: ' + sortBy);
            sortStudents(sortBy);
        });
    });
    
    // Tab switching in modal
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            console.log('Switch to tab: ' + tabId);
            
            // Update active tab button
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show selected tab content
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Initialize chart if needed
            if (tabId === 'performance' && currentStudentDetails) {
                initializePerformanceChart(currentStudentDetails);
            }
        });
    });
    
    // Toda la funcionalidad relacionada con detalles del estudiante ya está configurada
    
    console.log('Event listeners setup complete');
}

// Load students data from API
function loadStudentsData(filters = {}) {
    showLoading(true);
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.track && filters.track !== 'all') {
        queryParams.append('track', filters.track);
    }
    if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
    }
    if (filters.search) {
        queryParams.append('search', filters.search);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    fetch(`/api/students/all-students${queryString}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load students data');
            }
            
            studentsData = data.students || [];
            filteredStudents = [...studentsData];
            
            console.log(`Loaded ${studentsData.length} students`);
            
            // Count how many tracks each student is in
            countStudentTracks();
            
            // Update the display
            updateStudentCount();
            renderStudentsTable();
            setupPagination();
            
            showLoading(false);
        })
        .catch(error => {
            console.error('Error loading students data:', error);
            showErrorMessage('Failed to load students data. Please try again later.');
            showLoading(false);
        });
}

// Count how many tracks each student appears in
function countStudentTracks() {
    // Create a map to count student appearances across tracks
    const studentTrackCounts = new Map();
    
    // Count occurrences of each student ID
    studentsData.forEach(student => {
        if (!student.Id) return;
        
        const id = student.Id.toString();
        student.trackCount = studentTrackCounts.get(id) || 0;
        studentTrackCounts.set(id, student.trackCount + 1);
    });
    
    // Update the count for each student
    studentsData.forEach(student => {
        if (!student.Id) return;
        student.trackCount = studentTrackCounts.get(student.Id.toString()) || 1;
    });
}

// Render students table with current page data
function renderStudentsTable() {
    const tableBody = document.getElementById('students-table-body');
    tableBody.innerHTML = '';
    
    // Calculate pagination offsets
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredStudents.length);
    
    // Show/hide empty state message
    if (filteredStudents.length === 0) {
        noStudentsMessage.style.display = 'flex';
        paginationContainer.style.display = 'none';
        return;
    } else {
        noStudentsMessage.style.display = 'none';
        paginationContainer.style.display = 'flex';
    }
    
    // Populate table with data
    for (let i = startIndex; i < endIndex; i++) {
        const student = filteredStudents[i];
        
        // Create table row
        const row = document.createElement('tr');
        
        // Determine status class
        let statusClass = 'status-pending';
        if (student.studentStatus === 'Accepted') statusClass = 'status-accepted';
        else if (student.studentStatus === 'Rejected') statusClass = 'status-rejected';
        else if (student.studentStatus === 'In Progress') statusClass = 'status-in-progress';
        
        // Format student ID with leading zeros for better display
        const formattedId = String(student.Id).padStart(4, '0');
        
        row.innerHTML = `
            <td>
                <span class="student-id">#${formattedId}</span>
            </td>
            <td>
                <a href="javascript:void(0)" class="student-name" data-student-id="${student.Id}" onclick="openStudentDetailsModal(${student.Id})">
                    ${student.Name}
                </a>
            </td>
            <td>
                <span class="track-count">${student.trackCount || 1}</span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${student.studentStatus}</span>
            </td>
            <td>
                ${student.TotalDegrees || 0}
            </td>
            <td class="action-cell">
                <a href="javascript:void(0)" class="action-icon view-icon" onclick="openStudentDetailsModal(${student.Id})" title="View student details">
                    <i class="fas fa-eye"></i>
                </a>
                <a href="javascript:void(0)" class="action-icon export-icon" onclick="exportStudentData(${student.Id})" title="Export student data">
                    <i class="fas fa-file-export"></i>
                </a>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Update pagination info
    startItem.textContent = filteredStudents.length > 0 ? startIndex + 1 : 0;
    endItem.textContent = endIndex;
    totalItems.textContent = filteredStudents.length;
}

// Apply filters from form
function applyFilters() {
    const track = trackFilter.value;
    const status = statusFilter.value;
    const search = searchFilter.value;
    
    console.log(`Applying filters: Track=${track}, Status=${status}, Search=${search}`);
    
    // Load new data with filters
    loadStudentsData({ track, status, search });
}

// Reset all filters
function resetFilters() {
    trackFilter.value = 'all';
    statusFilter.value = 'all';
    searchFilter.value = '';
    
    // Apply the reset filters
    applyFilters();
}

// Update student count display
function updateStudentCount() {
    studentCount.textContent = `${filteredStudents.length} students`;
}

// Show/hide loading state
function showLoading(show) {
    loadingState.style.display = show ? 'flex' : 'none';
}

// Show error message
function showErrorMessage(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
    });
}

// Setup pagination controls
function setupPagination() {
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    
    // Reset pagination pages
    paginationPages.innerHTML = '';
    
    // Update prev/next buttons state
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // Generate page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => navigateToPage(i));
        paginationPages.appendChild(pageButton);
    }
}

// Navigate to a specific page
function navigateToPage(page) {
    currentPage = page;
    renderStudentsTable();
    setupPagination();
}

// Open student details modal
function openStudentDetailsModal(studentId) {
    console.log(`Opening details for student ID: ${studentId}`);
    
    // Show loading in modal
    studentName.textContent = 'Loading...';
    document.getElementById('studentId').textContent = 'Loading...';
    totalTracksCount.textContent = '0';
    totalTasksCount.textContent = '0';
    averageScore.textContent = '0%';
    
    // Clear previous track list
    studentTracksList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading student data...</p>
        </div>
    `;
    
    // Clear previous performance stats
    performanceStatsList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading performance data...</p>
        </div>
    `;
    
    // Show the modal
    studentModal.classList.add('active');
    
    // Make API call to get student details
    fetch(`/api/students/student-details/${studentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success || !data.studentDetails) {
                throw new Error(data.message || 'Failed to load student details');
            }
            
            // Store current student details
            currentStudentDetails = data.studentDetails;
            
            // Populate student information
            populateStudentDetails(currentStudentDetails);
        })
        .catch(error => {
            console.error('Error loading student details:', error);
            closeStudentModal();
            showErrorMessage(`Failed to load details for student ID: ${studentId}. Please try again later.`);
        });
}

// Close student details modal
function closeStudentModal() {
    studentModal.classList.remove('active');
    currentStudentDetails = null;
    
    // Cleanup any charts
    if (tabCharts.performance) {
        tabCharts.performance.destroy();
        tabCharts.performance = null;
    }
}

// Populate student details in modal
function populateStudentDetails(details) {
    if (!details || !details.studentInfo) {
        showErrorMessage('Invalid student data received');
        return;
    }
    
    const student = details.studentInfo;
    const tracks = details.tracks || [];
    
    // Basic info
    studentName.textContent = student.name || 'Unknown';
    document.getElementById('studentId').textContent = student.id || 'Unknown';
    
    // Summary counts
    totalTracksCount.textContent = tracks.length;
    
    // Count total tasks across all tracks
    let totalTasks = 0;
    let totalScore = 0;
    let scorePoints = 0;
    
    tracks.forEach(track => {
        if (track.studentData && track.studentData.tasks) {
            totalTasks += track.studentData.tasks.length;
            
            track.studentData.tasks.forEach(task => {
                if (task.taskDegree > 0) {
                    totalScore += (task.studentTaskDegree / task.taskDegree) * 100 || 0;
                    scorePoints++;
                }
            });
        }
    });
    
    totalTasksCount.textContent = totalTasks;
    
    // Calculate average score
    const avgScore = scorePoints > 0 ? Math.round(totalScore / scorePoints) : 0;
    averageScore.textContent = `${avgScore}%`;
    
    // Populate tracks list
    renderStudentTracks(tracks);
    
    // Prepare performance data for the chart
    renderPerformanceStats(tracks);
    
    // Initialize performance chart
    if (document.querySelector('.tab-button[data-tab="performance"]').classList.contains('active')) {
        initializePerformanceChart(details);
    }
}

// Render tracks list in the student details modal
function renderStudentTracks(tracks) {
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
        studentTracksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-layer-group"></i>
                </div>
                <h3>No Tracks Found</h3>
                <p>This student is not enrolled in any tracks.</p>
            </div>
        `;
        return;
    }
    
    studentTracksList.innerHTML = '';
    
    // Sort tracks by start date (newest first)
    const sortedTracks = [...tracks].sort((a, b) => {
        return new Date(b.trackStartDate) - new Date(a.trackStartDate);
    });
    
    sortedTracks.forEach(track => {
        // Calculate progress percentage for this track
        let progressPercentage = 0;
        const now = new Date();
        const start = new Date(track.trackStartDate);
        const end = new Date(track.trackEndDate);
        const totalDuration = end - start;
        const elapsedDuration = now - start;
        
        if (totalDuration > 0) {
            progressPercentage = Math.min(Math.max(Math.round((elapsedDuration / totalDuration) * 100), 0), 100);
        }
        
        // Determine status class
        let statusClass = 'status-pending';
        if (track.studentData.status === 'Accepted') statusClass = 'status-accepted';
        else if (track.studentData.status === 'Rejected') statusClass = 'status-rejected';
        else if (track.studentData.status === 'In Progress') statusClass = 'status-in-progress';
        
        // Format dates
        const startDate = new Date(track.trackStartDate).toLocaleDateString();
        const endDate = new Date(track.trackEndDate).toLocaleDateString();
        
        // Create track card
        const trackCard = document.createElement('div');
        trackCard.className = 'track-card';
        trackCard.innerHTML = `
            <div class="track-card-header">
                <div class="track-info">
                    <h4>${track.trackName}</h4>
                    <p class="track-dates">${startDate} - ${endDate}</p>
                </div>
                <span class="status-badge ${statusClass}">${track.studentData.status}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="track-progress-info">
                <span>${progressPercentage}% Complete</span>
                <span>Score: ${track.studentData.totalDegrees || 0}</span>
            </div>
            ${track.studentData.tasks && track.studentData.tasks.length > 0 ? `
                <div class="task-list">
                    ${track.studentData.tasks.slice(0, 3).map(task => `
                        <div class="task-item">
                            <span class="task-name">${task.taskName}</span>
                            <span class="task-score">${task.studentTaskDegree}/${task.taskDegree}</span>
                        </div>
                    `).join('')}
                    ${track.studentData.tasks.length > 3 ? `<div class="more-tasks">+${track.studentData.tasks.length - 3} more tasks</div>` : ''}
                </div>
            ` : ''}
        `;
        
        studentTracksList.appendChild(trackCard);
    });
}

// Render performance statistics
function renderPerformanceStats(tracks) {
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
        performanceStatsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>No Performance Data</h3>
                <p>There is no performance data available for this student.</p>
            </div>
        `;
        return;
    }
    
    performanceStatsList.innerHTML = '';
    
    // Calculate various performance metrics
    const totalTracksCount = tracks.length;
    const completedTracks = tracks.filter(t => t.trackStatus === 'Completed').length;
    const activeTracks = tracks.filter(t => t.trackStatus === 'Active').length;
    
    let totalTasks = 0;
    let completedTasks = 0;
    let totalDegrees = 0;
    let maxPossibleDegrees = 0;
    
    tracks.forEach(track => {
        if (track.studentData) {
            totalDegrees += track.studentData.totalDegrees || 0;
            
            if (track.studentData.tasks && Array.isArray(track.studentData.tasks)) {
                totalTasks += track.studentData.tasks.length;
                
                track.studentData.tasks.forEach(task => {
                    maxPossibleDegrees += task.taskDegree || 0;
                    if (task.studentTaskDegree >= task.taskDegree) {
                        completedTasks++;
                    }
                });
            }
        }
    });
    
    // Calculate percentages
    const trackCompletionRate = totalTracksCount > 0 ? Math.round((completedTracks / totalTracksCount) * 100) : 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overallScore = maxPossibleDegrees > 0 ? Math.round((totalDegrees / maxPossibleDegrees) * 100) : 0;
    
    // Create stat cards
    const statCards = [
        {
            title: 'Track Completion',
            value: `${trackCompletionRate}%`,
            icon: 'fa-check-circle'
        },
        {
            title: 'Task Completion',
            value: `${taskCompletionRate}%`,
            icon: 'fa-tasks'
        },
        {
            title: 'Overall Score',
            value: `${overallScore}%`,
            icon: 'fa-star'
        },
        {
            title: 'Active Tracks',
            value: activeTracks,
            icon: 'fa-play-circle'
        },
        {
            title: 'Completed Tasks',
            value: `${completedTasks}/${totalTasks}`,
            icon: 'fa-clipboard-check'
        },
        {
            title: 'Total Points',
            value: totalDegrees,
            icon: 'fa-trophy'
        }
    ];
    
    // Add stat cards to the container
    statCards.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'performance-stat-card';
        statCard.innerHTML = `
            <div class="stat-icon">
                <i class="fas ${stat.icon}"></i>
            </div>
            <h4>${stat.title}</h4>
            <p>${stat.value}</p>
        `;
        
        performanceStatsList.appendChild(statCard);
    });
}

// Initialize performance chart
function initializePerformanceChart(studentDetails) {
    if (tabCharts.performance) {
        tabCharts.performance.destroy();
    }
    
    const tracks = studentDetails.tracks || [];
    if (!tracks.length) return;
    
    const ctx = document.getElementById('studentPerformanceChart').getContext('2d');
    
    // Prepare data for chart
    const trackNames = [];
    const studentScores = [];
    const maxScores = [];
    
    tracks.forEach(track => {
        trackNames.push(track.trackName);
        studentScores.push(track.studentData.totalDegrees || 0);
        
        // Calculate max possible score for this track
        let maxScore = 0;
        if (track.studentData.tasks && Array.isArray(track.studentData.tasks)) {
            track.studentData.tasks.forEach(task => {
                maxScore += task.taskDegree || 0;
            });
        }
        maxScores.push(maxScore);
    });
    
    // Create chart
    tabCharts.performance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trackNames,
            datasets: [
                {
                    label: 'Student Score',
                    data: studentScores,
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Maximum Score',
                    data: maxScores,
                    backgroundColor: 'rgba(209, 213, 219, 0.5)',
                    borderColor: 'rgba(209, 213, 219, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tracks'
                    }
                }
            }
        }
    });
}

// Export single student data to CSV
function exportStudentData(studentId) {
    fetch(`/api/students/student-details/${studentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success || !data.studentDetails) {
                throw new Error(data.message || 'Failed to load student details');
            }
            
            const details = data.studentDetails;
            const student = details.studentInfo;
            const tracks = details.tracks || [];
            
            // Generate CSV content
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Student ID,Student Name,Track,Status,Start Date,End Date,Score,Max Score,Comments\n';
            
            tracks.forEach(track => {
                const row = [
                    student.id,
                    student.name,
                    track.trackName,
                    track.studentData.status,
                    new Date(track.trackStartDate).toLocaleDateString(),
                    new Date(track.trackEndDate).toLocaleDateString(),
                    track.studentData.totalDegrees || 0,
                    track.studentData.tasks ? track.studentData.tasks.reduce((sum, task) => sum + (task.taskDegree || 0), 0) : 0,
                    track.studentData.comments || ''
                ];
                
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `student_${student.id}_data.csv`);
            document.body.appendChild(link);
            
            // Trigger download and remove link
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error exporting student data:', error);
            showErrorMessage('Failed to export student data. Please try again later.');
        });
}

// Export all students to CSV
function exportAllStudentsToCSV() {
    if (!filteredStudents.length) {
        showErrorMessage('No students to export');
        return;
    }
    
    // Generate CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Student ID,Student Name,Tracks Count,Status,Total Degrees\n';
    
    filteredStudents.forEach(student => {
        const row = [
            student.Id,
            student.Name,
            student.trackCount || 1,
            student.studentStatus,
            student.TotalDegrees || 0
        ];
        
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and remove link
    link.click();
    document.body.removeChild(link);
}

// Print students table
function printStudentsTable() {
    const printWindow = window.open('', '_blank');
    
    // Generate print content
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Students Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
                .status-pending { background-color: #fff7ed; color: #c2410c; }
                .status-accepted { background-color: #ecfdf5; color: #047857; }
                .status-rejected { background-color: #fef2f2; color: #b91c1c; }
                .status-in-progress { background-color: #eff6ff; color: #1d4ed8; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <h1>Students Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Tracks</th>
                        <th>Status</th>
                        <th>Total Degrees</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredStudents.forEach(student => {
        // Determine status class
        let statusClass = 'status-pending';
        if (student.studentStatus === 'Accepted') statusClass = 'status-accepted';
        else if (student.studentStatus === 'Rejected') statusClass = 'status-rejected';
        else if (student.studentStatus === 'In Progress') statusClass = 'status-in-progress';
        
        printContent += `
            <tr>
                <td>${student.Id}</td>
                <td>${student.Name}</td>
                <td>${student.trackCount || 1}</td>
                <td><span class="status ${statusClass}">${student.studentStatus}</span></td>
                <td>${student.TotalDegrees || 0}</td>
            </tr>
        `;
    });
    
    printContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Print after images load
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}

// Sort students by column
function sortStudents(column) {
    // Determine sort direction
    const sortHeader = document.querySelector(`th[data-sort="${column}"]`);
    const currentDirection = sortHeader.getAttribute('data-direction') || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // Update sort direction indicator
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.removeAttribute('data-direction');
        header.querySelector('.sort-icon')?.remove();
    });
    
    sortHeader.setAttribute('data-direction', newDirection);
    const iconClass = newDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    sortHeader.innerHTML += `<span class="sort-icon"><i class="fas ${iconClass}"></i></span>`;
    
    // Sort the data
    filteredStudents.sort((a, b) => {
        let valueA, valueB;
        
        switch(column) {
            case 'id':
                valueA = a.Id || 0;
                valueB = b.Id || 0;
                break;
            case 'name':
                valueA = a.Name || '';
                valueB = b.Name || '';
                break;
            case 'tracks':
                valueA = a.trackCount || 1;
                valueB = b.trackCount || 1;
                break;
            case 'status':
                valueA = a.studentStatus || '';
                valueB = b.studentStatus || '';
                break;
            case 'degrees':
                valueA = a.TotalDegrees || 0;
                valueB = b.TotalDegrees || 0;
                break;
            default:
                return 0;
        }
        
        // Handle different data types
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return newDirection === 'asc' ? 
                valueA.localeCompare(valueB) : 
                valueB.localeCompare(valueA);
        } else {
            return newDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }
    });
    
    // Reset to first page and re-render
    currentPage = 1;
    renderStudentsTable();
    setupPagination();
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
