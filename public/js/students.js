
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

// Debug function to inspect object properties
function inspectObject(obj, name = 'Object') {
    if (!obj) {
        console.log(`${name} is null or undefined`);
        return;
    }

    const props = {
        type: typeof obj,
        objectType: Object.prototype.toString.call(obj),
        keys: Object.keys(obj),
        hasTrackCount: obj.hasOwnProperty('trackCount'),
        trackCountValue: obj.trackCount,
        hasTrackNames: obj.hasOwnProperty('trackNames'),
        trackNamesType: Array.isArray(obj.trackNames) ? 'array' : typeof obj.trackNames,
        trackNamesLength: Array.isArray(obj.trackNames) ? obj.trackNames.length : 'N/A'
    };

    console.log(`Inspecting ${name}:`, props);
}

/**
 * Initialize the page and set up event listeners
 */
function initializePage() {
    console.log('Initializing students page...');

    // Load initial data
    loadStudentsData();

    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up all event listeners for interactive elements on the page
 */
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Filter form events
    if (filterForm) {
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function () {
                console.log('Apply filters clicked');
                applyFilters();
            });
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function () {
                console.log('Reset filters clicked');
                resetFilters();
            });
        }

        if (clearSearchBtn && searchFilter) {
            clearSearchBtn.addEventListener('click', function () {
                console.log('Clear search clicked');
                searchFilter.value = '';
                applyFilters();
            });
        }
    }

    // Table action buttons
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
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
        exportCsvBtn.addEventListener('click', function () {
            console.log('Export CSV clicked');
            exportAllStudentsToCSV();
        });
    }

    // Pagination controls
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function () {
            console.log('Items per page changed to: ' + this.value);
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            renderStudentsTable();
            setupPagination();
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                console.log('Navigate to previous page');
                currentPage--;
                renderStudentsTable();
                setupPagination();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function () {
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
        closeModal.addEventListener('click', function () {
            console.log('Close modal clicked');
            closeStudentModal();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            console.log('Close modal button clicked');
            closeStudentModal();
        });
    }

    if (exportStudentDataBtn) {
        exportStudentDataBtn.addEventListener('click', function () {
            console.log('Export student data clicked');
            if (currentStudentDetails) {
                exportStudentData(currentStudentDetails.Id);
            }
        });
    }

    // Toggle filters visibility
    if (toggleFiltersBtn) {
        toggleFiltersBtn.addEventListener('click', function () {
            console.log('Toggle filters clicked');
            const filterBody = document.querySelector('.filters-body');
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
        searchFilter.addEventListener('input', function () {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                console.log('Search input changed: ' + this.value);
                applyFilters();
            }, 500); // 500ms debounce
        });
    }

    // Global event listener for table sort headers
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', function () {
            const sortBy = this.getAttribute('data-sort');
            console.log('Sort by: ' + sortBy);
            sortStudents(sortBy);
        });
    });

    // Tab switching in modal
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            console.log('Switch to tab: ' + tabId);

            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');

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

    const apiUrl = `/api/students/all-students${queryString}`;
    console.log('Fetching students from:', apiUrl);

    fetch(apiUrl, {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
            // If unauthorized, redirect to login page
            if (response.status === 401) {
                console.log('Authentication error: Redirecting to login page');
                window.location.href = '/login';
                throw new Error('Session expired. Please log in again.');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);

            if (!data.success) {
                throw new Error(data.message || 'Failed to load students data');
            }

            // Use real data from API response
            studentsData = data.students || [];

            filteredStudents = [...studentsData];

            console.log(`Loaded ${studentsData.length} students`);

            if (totalStudentsCount) {
                totalStudentsCount.textContent = studentsData.length;
            }

            if (activeStudentsCount) {
                const activeCount = studentsData.filter(student =>
                    student.studentStatus === 'Accepted' ||
                    student.studentStatus === 'Active' ||
                    student.studentStatus === 'In Progress'
                ).length;
                activeStudentsCount.textContent = activeCount;
            }

            countStudentTracks();

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

// Use the track count from the API data
function countStudentTracks() {
    console.log('DEBUG - All students data:', JSON.stringify(studentsData, null, 2));

    // Log the track count for each student to identify the issue
    console.log('TRACK COUNT DEBUG:');

    // CRITICAL FIX: Force reset any hardcoded track count values
    studentsData.forEach(student => {
        if (!student.Id) return;

        // Log the raw data for this student
        console.log(`Student ID: ${student.Id}`);
        console.log(`Raw trackCount value: ${student.trackCount}`);
        console.log(`Track names: ${JSON.stringify(student.trackNames)}`);

        // CRITICAL INSPECTION: Check for hardcoded values
        if (student.trackCount === 11) {
            console.warn(`WARNING: Found hardcoded track count of 11 for student ${student.Id}`);
        }

        // CRITICAL FIX: Always recalculate trackCount based on trackNames
        if (Array.isArray(student.trackNames)) {
            // Override any existing trackCount with the actual count from trackNames
            student.trackCount = student.trackNames.length;
            console.log(`RESET: Setting trackCount for ${student.Id} to ${student.trackCount} based on trackNames length`);
        } else if (student.trackInfo && student.trackInfo.trackName) {
            // If we have trackInfo but no trackNames array, create one and set count to 1
            student.trackNames = [student.trackInfo.trackName];
            student.trackCount = 1;
            console.log(`RESET: Created trackNames array with one item for student ${student.Id}`);
        } else {
            // If no track information at all, set to 0
            student.trackNames = [];
            student.trackCount = 0;
            console.log(`RESET: Student ${student.Id} has no track information, setting count to 0`);
        }

        // Double verification
        console.log(`VERIFICATION: Student ${student.Id} now has trackCount=${student.trackCount} with tracks=${JSON.stringify(student.trackNames)}`);
        console.log('------------------------------');
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

        // Ensure trackNames is an array and trackCount is correct
        if (!Array.isArray(student.trackNames)) {
            student.trackNames = [];
        }

        // Make sure trackCount matches the actual number of tracks
        // This preserves the backend calculation but ensures consistency
        if (student.trackCount !== student.trackNames.length) {
            console.log(`Fixed track count for student ${student.Id}: API returned ${student.trackCount}, actual tracks: ${student.trackNames.length}`);
            student.trackCount = student.trackNames.length;
        }

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
                <div class="track-count-container">
                    <span class="track-badge ${student.trackCount > 1 ? 'multiple-tracks' : ''}" 
                          title="${Array.isArray(student.trackNames) && student.trackNames.length > 0 ? 'Tracks: ' + student.trackNames.join(', ') : 'No tracks'}">
                        ${student.trackCount}
                    </span>
                </div>
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

    // Load data from API with filters
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
    if (!studentId) {
        showErrorMessage('Invalid student ID');
        return;
    }

    console.log(`Opening details for student ID: ${studentId}`);

    // Format student ID - ensure it's a string and handle possible leading zeros
    let formattedId = String(studentId).trim();
    
    // If the ID is numeric and doesn't have leading zeros, but might exist with zeros in the database
    // Try to pad with leading zeros to match the format in the database (e.g., "0001" instead of "1")
    if (/^\d+$/.test(formattedId) && formattedId.length < 4) {
        const numericId = parseInt(formattedId, 10);
        const paddedId = numericId.toString().padStart(4, '0');
        console.log(`Formatted student ID from ${formattedId} to ${paddedId} for API request`);
        formattedId = paddedId;
    }
    
    // Debido a que los IDs en la base de datos son undefined, usamos el ID como índice
    // Esta es una solución alternativa hasta que se corrijan los IDs en la base de datos

    // Make the modal visible
    studentModal.classList.add('active');
    
    // Reset and show the modal with proper null checking for all DOM elements
    if (modalTitle) modalTitle.textContent = 'Loading Student Details...';
    
    // The student name and ID elements may not exist in the current DOM since we're now
    // rebuilding the modal content completely. We'll skip these for now and handle them
    // in the populateStudentDetails function.
    
    // Only attempt to set these values if the elements exist
    const studentIdElement = document.getElementById('studentId');
    if (studentIdElement) studentIdElement.textContent = formattedId;
    
    if (totalTracksCount) totalTracksCount.textContent = '-';
    if (totalTasksCount) totalTasksCount.textContent = '-';
    if (averageScore) averageScore.textContent = '-';

    // Clear previous content and show loading state if the element exists
    if (studentTracksList) {
        studentTracksList.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading student details...</p>
            </div>
        `;
    } else {
        console.log('studentTracksList element not found, this is expected with the new modal structure');
    }

    // Clear performance stats list if it exists
    if (performanceStatsList) {
        performanceStatsList.innerHTML = '';
    } else {
        console.log('performanceStatsList element not found, this is expected with the new modal structure');
    }

    // Show the modal - this is already done earlier in the function
    // studentModal.classList.add('active');

    // Normalize the ID by removing leading zeros
    const normalizedId = formattedId.replace(/^0+/, '') || formattedId;
    

    const apiUrl = `/api/students/student-details/${normalizedId}`;
    console.log(`Fetching student details from: ${apiUrl}`);

    fetch(apiUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for session-based auth
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log(`API response status: ${response.status} ${response.statusText}`);
            
            // Clone the response so we can both read it as text and json
            const responseClone = response.clone();
            
            if (!response.ok) {
                // If error, try to get the response text to show more details
                responseClone.text().then(text => {
                    try {
                        // Try to parse as JSON
                        const errorData = JSON.parse(text);
                        // Save to localStorage for error display
                        localStorage.setItem('lastErrorResponse', text);
                        console.log('Saved error response:', errorData);
                    } catch (e) {
                        console.log('Error response is not JSON:', text);
                    }
                }).catch(err => {
                    console.log('Could not read error response text', err);
                });
                
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('Student details API response:', data);
            console.log('Student data structure:', JSON.stringify(data, null, 2));

            if (!data.success || !data.data) {
                throw new Error(data.message || 'Failed to load student details');
            }

            // Store current student details
            currentStudentDetails = data.data;
            console.log('Current student details:', currentStudentDetails);

            // Update modal title
            modalTitle.textContent = 'Student Details';

            // Populate student information
            populateStudentDetails(currentStudentDetails);
        })
        .catch(error => {
            console.error('Error fetching student details:', error);
            // Show error message in the modal - use studentTracksList instead of undefined studentDetailsContent
            studentTracksList.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3>Error loading student details</h3>
                    <p>Error loading student details for ID: ${formattedId}</p>
                    <p>${error.message || 'Student with ID ' + formattedId + ' not found in any track'}</p>
                </div>
            `;
            
            // Reset other UI elements to show the error state
            studentName.textContent = 'Not Found';
            document.getElementById('studentId').textContent = formattedId;
            totalTracksCount.textContent = '0';
            totalTasksCount.textContent = '0';
            averageScore.textContent = '0';
            performanceStatsList.innerHTML = '';
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

    console.log('Populating student details:', details);
    
    // Extract student information safely with defaults
    const student = details.studentInfo;
    const tracks = details.tracks || [];
    
    // Calculate tasks and progress information with defaults
    let totalTasks = 0;
    let completedTasks = 0;
    let averageScore = 0;
    
    // Safely calculate task statistics
    if (tracks && tracks.length > 0) {
        // Count total and completed tasks across all tracks
        tracks.forEach(track => {
            // Handle different data structures for tasks
            let trackTasks = [];
            if (track.studentData && track.studentData.tasks && Array.isArray(track.studentData.tasks)) {
                trackTasks = track.studentData.tasks;
            } else if (track.studentData && track.studentData.Tasks && Array.isArray(track.studentData.Tasks)) {
                trackTasks = track.studentData.Tasks;
            } else if (track.tasks && Array.isArray(track.tasks)) {
                trackTasks = track.tasks;
            } else if (track.Tasks && Array.isArray(track.Tasks)) {
                trackTasks = track.Tasks;
            } else if (track.BasicTotal && Array.isArray(track.BasicTotal)) {
                trackTasks = track.BasicTotal;
            }
            
            console.log(`Track: ${track.trackName || track.name}, Tasks:`, trackTasks);
            
            // Skip if no task data is available
            if (!trackTasks || trackTasks.length === 0) return;
            
            totalTasks += trackTasks.length;
            
            // Count completed tasks - check multiple possible score fields
            completedTasks += trackTasks.filter(task => {
                if (!task) return false;
                return (
                    (task.studentTaskDegree && Number(task.studentTaskDegree) > 0) || 
                    (task.degreeValue && Number(task.degreeValue) > 0) ||
                    (task.degree && Number(task.degree) > 0) ||
                    (task.score && Number(task.score) > 0) ||
                    task.status === 'Completed' ||
                    task.Status === 'Completed' ||
                    task.completed === true ||
                    task.Completed === true
                );
            }).length;
            
            // Sum up scores for average calculation - check multiple possible score fields
            const trackTotal = trackTasks.reduce((sum, task) => {
                if (!task) return sum;
                const score = 
                    Number(task.studentTaskDegree || 0) || 
                    Number(task.degreeValue || 0) || 
                    Number(task.degree || 0) || 
                    Number(task.score || 0);
                return sum + score;
            }, 0);
            
            if (trackTasks.length > 0) {
                track.averageScore = Math.round(trackTotal / trackTasks.length);
            }
        });
        
        // Calculate overall average score
        if (totalTasks > 0 && completedTasks > 0) {
            // If API provides averageScore directly, use it
            averageScore = details.averageScore || 
                Math.round((tracks.reduce((sum, track) => 
                    sum + (track.averageScore || 0), 0)) / tracks.length);
        }
    } else {
        // Fallback to API provided values if tracks don't have detailed task info
        totalTasks = details.totalTasks || 0;
        completedTasks = details.completedTasks || 0;
        averageScore = details.averageScore || 0;
    }
    
    // Overall completion progress
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Create enhanced student header section
    const modalBody = document.querySelector('#studentModal .modal-body');
    
    // Clear previous content
    while (modalBody.firstChild) {
        modalBody.removeChild(modalBody.firstChild);
    }
    
    // Create and append student header
    const studentHeader = document.createElement('div');
    studentHeader.className = 'student-header';
    
    const studentAvatar = document.createElement('div');
    studentAvatar.className = 'student-avatar';
    studentAvatar.innerHTML = `<i class="fas fa-user-graduate"></i>`;
    
    const studentInfoMain = document.createElement('div');
    studentInfoMain.className = 'student-info-main';
    studentInfoMain.innerHTML = `
        <h2>${student.name || 'Unknown'}</h2>
        <div class="student-id">
            <i class="fas fa-id-card"></i>
            <span>ID: ${student.id || 'Unknown'}</span>
        </div>
    `;
    
    studentHeader.appendChild(studentAvatar);
    studentHeader.appendChild(studentInfoMain);
    modalBody.appendChild(studentHeader);
    
    // Create student stats section using the global stats from API
    const studentStats = document.createElement('div');
    studentStats.className = 'student-stats';
    
    // Use the stats directly from the API response
    const avgScoreDisplay = Math.round(averageScore);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Populate stats
    studentStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${tracks.length}</div>
            <div class="stat-label">Tracks</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${completedTasks}/${totalTasks}</div>
            <div class="stat-label">Tasks</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${avgScoreDisplay}%</div>
            <div class="stat-label">Avg. Score</div>
        </div>
    `;
    
    modalBody.appendChild(studentStats);
    
    // Create tabs container with proper styling
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container'; // This class should be styled in CSS
    tabsContainer.innerHTML = `
        <div class="tab-buttons">
            <button class="tab-button active" data-tab="overview">Overview</button>
            <button class="tab-button" data-tab="enrolledTracks">Enrolled Tracks</button>
            <button class="tab-button" data-tab="performance">Performance</button>
        </div>
        <div class="tab-content">
            <div id="tab-overview" class="tab-pane active"></div>
            <div id="tab-enrolledTracks" class="tab-pane"></div>
            <div id="tab-performance" class="tab-pane"></div>
        </div>
    `;
    
    modalBody.appendChild(tabsContainer);
    
    // Set up tab functionality with better error handling
    const tabButtons = tabsContainer.querySelectorAll('.tab-button');
    const tabPanes = tabsContainer.querySelectorAll('.tab-pane');
    
    console.log('Setting up tab buttons:', tabButtons.length);
    console.log('Tab panes:', tabPanes.length);
    
    // Make sure first tab is active by default
    if (tabPanes.length > 0) {
        tabPanes[0].classList.add('active');
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Tab clicked:', button.getAttribute('data-tab'));
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button and corresponding pane
            button.classList.add('active');
            const tabId = `tab-${button.getAttribute('data-tab')}`;
            const tabPane = document.getElementById(tabId);
            
            if (tabPane) {
                tabPane.classList.add('active');
                
                // Initialize performance chart if needed
                if (button.getAttribute('data-tab') === 'performance') {
                    console.log('Initializing performance chart');
                    initializePerformanceChart(details);
                }
            } else {
                console.error('Tab pane not found:', tabId);
            }
        });
    });
    
    // Helper function to get score class based on score value
    function getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    }

    // Create content for Overview tab with more robust error handling
    const overviewTab = document.getElementById('tab-overview');
    if (!overviewTab) {
        console.error('Overview tab element not found');
        return;
    }
    
    // Handle tracks display safely
    const trackBadges = tracks.map(track => {
        const trackName = track.trackName || track.name || 'Unknown Track';
        return `<span class="track-badge">${trackName}</span>`;
    }).join('');
    
    // Create the overview tab content with basic student info
    overviewTab.innerHTML = `
        <div class="overview-summary">
            <div class="overview-card">
                <div class="overview-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="overview-content">
                    <h3>Overall Performance</h3>
                    <div class="overview-stats">
                        <div class="overview-stat">
                            <div class="stat-circle ${getScoreClass(avgScoreDisplay)}">${avgScoreDisplay}%</div>
                            <p>Average Score</p>
                        </div>
                        <div class="overview-stat">
                            <div class="stat-circle progress-circle" style="--progress: ${completionRate}%">
                                <span>${completionRate}%</span>
                            </div>
                            <p>Completion Rate</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="track-distribution">
                <h3>Track Enrollment</h3>
                <div class="track-badges">
                    ${trackBadges || '<p>No tracks available</p>'}
                </div>
            </div>
            
            <div class="recent-activity">
                <h3>Activity Summary</h3>
                <div class="activity-cards">
                    <div class="activity-card">
                        <i class="fas fa-graduation-cap"></i>
                        <h4>Enrolled Tracks</h4>
                        <div class="activity-value">${tracks.length}</div>
                    </div>
                    <div class="activity-card">
                        <i class="fas fa-tasks"></i>
                        <h4>Total Tasks</h4>
                        <div class="activity-value">${totalTasks}</div>
                    </div>
                    <div class="activity-card">
                        <i class="fas fa-check-circle"></i>
                        <h4>Completed Tasks</h4>
                        <div class="activity-value">${completedTasks}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create track list container for enrolled tracks tab with error handling
    const enrolledTracksTab = document.getElementById('tab-enrolledTracks');
    if (!enrolledTracksTab) {
        console.error('Enrolled tracks tab element not found');
    } else {
        const tracksList = document.createElement('div');
        tracksList.className = 'tracks-list';
        enrolledTracksTab.appendChild(tracksList);
        
        // Make sure the tracks tab has content
        console.log('Rendering tracks to tab:', tracks.length);
        
        // If no tracks, show empty state
        if (!tracks || tracks.length === 0) {
            tracksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h3>No Tracks Found</h3>
                    <p>This student is not enrolled in any tracks.</p>
                </div>
            `;
        } else {
            // Build detailed track cards with task information
            tracks.forEach(track => {
                if (!track) return;
                
                // Safe access to track data with a variety of possible structures
                const trackName = track.trackName || track.name || 'Unknown Track';
                const trackDescription = track.description || 'No description available';
                
                // Get tasks with handling for different data structures
                let trackTasks = [];
                if (track.studentData && track.studentData.tasks && Array.isArray(track.studentData.tasks)) {
                    trackTasks = track.studentData.tasks;
                } else if (track.studentData && track.studentData.Tasks && Array.isArray(track.studentData.Tasks)) {
                    trackTasks = track.studentData.Tasks;
                } else if (track.tasks && Array.isArray(track.tasks)) {
                    trackTasks = track.tasks;
                } else if (track.Tasks && Array.isArray(track.Tasks)) {
                    trackTasks = track.Tasks;
                } else if (track.BasicTotal && Array.isArray(track.BasicTotal)) {
                    trackTasks = track.BasicTotal;
                }
                
                // Calculate completion statistics
                const totalTaskCount = trackTasks.length;
                const completedTasksCount = trackTasks.filter(task => {
                    if (!task) return false;
                    return (
                        (task.studentTaskDegree && Number(task.studentTaskDegree) > 0) || 
                        (task.degreeValue && Number(task.degreeValue) > 0) ||
                        (task.degree && Number(task.degree) > 0) ||
                        (task.score && Number(task.score) > 0) ||
                        task.status === 'Completed' ||
                        task.Status === 'Completed' ||
                        task.completed === true ||
                        task.Completed === true
                    );
                }).length;
                
                // Calculate progress and average score
                const progress = totalTaskCount > 0 ? Math.round((completedTasksCount / totalTaskCount) * 100) : 0;
                let averageScore = 0;
                
                if (trackTasks.length > 0) {
                    const totalScore = trackTasks.reduce((sum, task) => {
                        if (!task) return sum;
                        const score = 
                            Number(task.studentTaskDegree || 0) || 
                            Number(task.degreeValue || 0) || 
                            Number(task.degree || 0) || 
                            Number(task.score || 0);
                        return sum + score;
                    }, 0);
                    
                    averageScore = totalTaskCount > 0 ? Math.round(totalScore / totalTaskCount) : 0;
                }
                
                const scoreClass = getScoreClass(averageScore);
                
                // Create a detailed track card with task information
                const trackCard = document.createElement('div');
                trackCard.className = 'track-card';
                
                // Build track header
                const trackHeader = document.createElement('div');
                trackHeader.className = 'track-card-header';
                trackHeader.innerHTML = `
                    <div class="track-icon"><i class="fas fa-layer-group"></i></div>
                    <div class="track-info">
                        <h3 class="track-name">${trackName}</h3>
                        <p class="track-description">${trackDescription}</p>
                    </div>
                `;
                
                // Build track progress section
                const trackProgress = document.createElement('div');
                trackProgress.className = 'track-progress';
                trackProgress.innerHTML = `
                    <div class="progress-stats">
                        <div class="stat">
                            <span class="stat-label">Progress</span>
                            <span class="stat-value">${progress}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Tasks</span>
                            <span class="stat-value">${completedTasksCount}/${totalTaskCount}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Avg. Score</span>
                            <span class="stat-value ${scoreClass}">${averageScore}%</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                `;
                
                // Build tasks list with scores
                const tasksList = document.createElement('div');
                tasksList.className = 'track-tasks-list';
                
                // Create expandable tasks section
                const tasksSection = document.createElement('div');
                tasksSection.className = 'tasks-section';
                
                // Create tasks header with toggle functionality
                const tasksHeader = document.createElement('div');
                tasksHeader.className = 'tasks-header';
                tasksHeader.innerHTML = `
                    <h3><i class="fas fa-tasks"></i> Tasks (${completedTasksCount}/${totalTaskCount})</h3>
                    <button class="toggle-tasks"><i class="fas fa-chevron-up"></i></button>
                `;
                
                // Create tasks content - expanded by default
                const tasksContent = document.createElement('div');
                tasksContent.className = 'tasks-content expanded';
                
                // Check if there are tasks to display
                if (trackTasks.length === 0) {
                    tasksContent.innerHTML = `
                        <div class="empty-tasks">
                            <p>No tasks available for this track.</p>
                        </div>
                    `;
                } else {
                    // Generate tasks table
                    let tasksHtml = `
                        <table class="tasks-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Task Name</th>
                                    <th>Status</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    
                    // Add each task to the table
                    trackTasks.forEach((task, index) => {
                        if (!task) return;
                        
                        // Extract task data with flexible field names
                        const taskName = task.taskName || task.name || task.title || `Task ${index + 1}`;
                        
                        // Determine task score
                        const taskScore = 
                            Number(task.studentTaskDegree || 0) || 
                            Number(task.degreeValue || 0) || 
                            Number(task.degree || 0) || 
                            Number(task.score || 0);
                        
                        // Determine task status
                        let taskStatus = 'Not Started';
                        let statusClass = 'not-started';
                        
                        if (taskScore > 0 || 
                            task.status === 'Completed' || 
                            task.Status === 'Completed' || 
                            task.completed === true || 
                            task.Completed === true) {
                            taskStatus = 'Completed';
                            statusClass = 'completed';
                        } else if (task.status === 'In Progress' || task.Status === 'In Progress') {
                            taskStatus = 'In Progress';
                            statusClass = 'in-progress';
                        }
                        
                        // Task score class
                        const taskScoreClass = taskScore >= 0 ? getScoreClass(taskScore) : '';
                        
                        // Add task row
                        tasksHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${taskName}</td>
                                <td><span class="status-badge ${statusClass}">${taskStatus}</span></td>
                                <td><span class="score ${taskScoreClass}">${taskScore}</span></td>
                            </tr>
                        `;
                    });
                    
                    tasksHtml += `
                            </tbody>
                        </table>
                    `;
                    
                    tasksContent.innerHTML = tasksHtml;
                }
                
                // Assemble tasks section
                tasksSection.appendChild(tasksHeader);
                tasksSection.appendChild(tasksContent);
                tasksList.appendChild(tasksSection);
                
                // Add event listener for toggle
                setTimeout(() => {
                    const toggleButton = tasksSection.querySelector('.toggle-tasks');
                    if (toggleButton) {
                        toggleButton.addEventListener('click', () => {
                            tasksContent.classList.toggle('expanded');
                            toggleButton.querySelector('i').classList.toggle('fa-chevron-down');
                            toggleButton.querySelector('i').classList.toggle('fa-chevron-up');
                        });
                    }
                }, 0);
                
                // Assemble the track card
                trackCard.appendChild(trackHeader);
                trackCard.appendChild(trackProgress);
                trackCard.appendChild(tasksList);
                
                tracksList.appendChild(trackCard);
            });
        }
    }
    
    // Add content to performance tab with full error handling
    const performanceTab = document.getElementById('tab-performance');
    if (!performanceTab) {
        console.error('Performance tab element not found');
        return;
    }
    
    // Early return if no tracks available
    if (!tracks || tracks.length === 0) {
        performanceTab.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>No Performance Data Available</h3>
                <p>There are no tracks or task data available to generate performance metrics.</p>
            </div>
        `;
        return;
    }
    
    console.log('Building performance display for', tracks.length, 'tracks');
    
    // Generate track completion chart HTML with robust error handling
    const trackBarsHtml = tracks.map(track => {
        let progress = 0;
        let taskCount = 0;
        let completedCount = 0;
        const trackName = track.trackName || track.name || 'Unknown Track';
        
        // Calculate progress based on tasks with full data structure support
        let trackTasks = [];
        if (track.studentData && track.studentData.tasks && Array.isArray(track.studentData.tasks)) {
            trackTasks = track.studentData.tasks;
        } else if (track.studentData && track.studentData.Tasks && Array.isArray(track.studentData.Tasks)) {
            trackTasks = track.studentData.Tasks;
        } else if (track.tasks && Array.isArray(track.tasks)) {
            trackTasks = track.tasks;
        } else if (track.Tasks && Array.isArray(track.Tasks)) {
            trackTasks = track.Tasks;
        } else if (track.BasicTotal && Array.isArray(track.BasicTotal)) {
            trackTasks = track.BasicTotal;
        }
        
        taskCount = trackTasks.length;
        
        // Count completed tasks with flexible score field detection
        completedCount = trackTasks.filter(task => {
            if (!task) return false;
            return (
                (task.studentTaskDegree && Number(task.studentTaskDegree) > 0) || 
                (task.degreeValue && Number(task.degreeValue) > 0) ||
                (task.degree && Number(task.degree) > 0) ||
                (task.score && Number(task.score) > 0) ||
                task.status === 'Completed' ||
                task.Status === 'Completed' ||
                task.completed === true ||
                task.Completed === true
            );
        }).length;
        
        // Calculate progress percentage safely
        progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
        
        // Return the chart bar HTML
        return `
            <div class="chart-bar-container">
                <div class="chart-label">${trackName}</div>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${progress}%"></div>
                </div>
                <div class="chart-value">${progress}% (${completedCount}/${taskCount})</div>
            </div>
        `;
    }).join('');
    
    // Get score class for styling
    const scoreClass = getScoreClass(averageScore);
    
    // Build performance dashboard HTML with better error handling
    performanceTab.innerHTML = `
        <div class="performance-dashboard">
            <div class="performance-summary">
                <div class="performance-card">
                    <h3>Track Completion</h3>
                    <div class="performance-chart">
                        <div class="chart-bars">
                            ${trackBarsHtml || '<p>No track completion data available</p>'}
                        </div>
                    </div>
                </div>
                
                <div class="performance-metrics">
                    <h3>Performance Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-title">Average Score</div>
                            <div class="metric-value ${scoreClass}">${averageScore}%</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Task Completion</div>
                            <div class="metric-value">${completedTasks}/${totalTasks}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Tracks</div>
                            <div class="metric-value">${tracks.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup chart container for future use
    const chartContainer = document.createElement('div');
    chartContainer.className = 'performance-chart-wrapper';
    chartContainer.innerHTML = '<canvas id="performanceChart"></canvas>';
    performanceTab.appendChild(chartContainer);
}

// Render tracks list in the student details modal
function renderStudentTracks(tracks, container) {
    if (!container) {
        console.error('No container specified for tracks list');
        return;
    }
    
    console.log('Rendering tracks:', tracks);
    
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
        container.innerHTML = `
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

    container.innerHTML = '';

    // Display info about multiple tracks
    if (tracks.length > 1) {
        const trackInfoSummary = document.createElement('div');
        trackInfoSummary.className = 'track-count-summary';
        trackInfoSummary.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <span>This student is enrolled in ${tracks.length} tracks</span>
            </div>
        `;
        container.appendChild(trackInfoSummary);
    }

    // Sort tracks by start date (newest first)
    tracks.sort((a, b) => {
        const dateA = new Date(a.trackStartDate || 0);
        const dateB = new Date(b.trackStartDate || 0);
        return dateB - dateA;
    });

    const tracksList = document.createElement('div');
    tracksList.className = 'tracks-list';
    container.appendChild(tracksList);

    tracks.forEach(track => {
        // Use the progress directly from the API response
        const progressPercentage = track.studentData?.progress || 0;
        const averageScore = track.studentData?.averageScore || 0;
        const totalTasks = track.studentData?.totalTasks || 0;
        const completedTasks = track.studentData?.completedTasks || 0;
        const tasks = track.studentData?.tasks || [];
        const comments = track.studentData?.comments || [];
        
        console.log(`Track ${track.trackName}: Progress=${progressPercentage}, Score=${averageScore}, Tasks=${completedTasks}/${totalTasks}`);

        // Create track card
        const trackCard = document.createElement('div');
        trackCard.className = 'track-card';

        // Track header
        const trackHeader = document.createElement('div');
        trackHeader.className = 'track-header';

        // Track title and status
        const trackTitle = document.createElement('div');
        trackTitle.className = 'track-title';
        trackTitle.innerHTML = `
            <h3>${track.trackName || 'Unknown Track'}</h3>
            <span class="track-status ${track.trackStatus ? track.trackStatus.toLowerCase() : ''}">
                ${track.trackStatus || 'Unknown'}
            </span>
        `;

        // Track dates
        const trackDates = document.createElement('div');
        trackDates.className = 'track-dates';
        
        const startDate = track.trackStartDate ? new Date(track.trackStartDate).toLocaleDateString() : 'N/A';
        const endDate = track.trackEndDate ? new Date(track.trackEndDate).toLocaleDateString() : 'N/A';
        
        trackDates.innerHTML = `
            <div><i class="fas fa-calendar-plus"></i> Start: ${startDate}</div>
            <div><i class="fas fa-calendar-check"></i> End: ${endDate}</div>
        `;

        // Add header elements
        trackHeader.appendChild(trackTitle);
        trackHeader.appendChild(trackDates);
        trackCard.appendChild(trackHeader);

        // Track stats
        const trackStats = document.createElement('div');
        trackStats.className = 'track-stats';
        
        // Get appropriate classes for progress and score
        const progressClass = getScoreClass(progressPercentage);
        const scoreClass = getScoreClass(averageScore);

        trackStats.innerHTML = `
            <div class="stat-block">
                <div class="stat-label">Progress</div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-percentage">${Math.round(progressPercentage)}%</div>
            </div>
            <div class="stat-block">
                <div class="stat-label">Average Score</div>
                <div class="score-badge ${scoreClass}">${Math.round(averageScore)}%</div>
            </div>
            <div class="stat-block">
                <div class="stat-label">Tasks</div>
                <div class="task-completion">${completedTasks}/${totalTasks}</div>
            </div>
        `;

        trackCard.appendChild(trackStats);

        // Track content (tasks, comments)
        if (track.studentData) {
            // Comments section
            if (comments && comments.length > 0) {
                const commentsSection = document.createElement('div');
                commentsSection.className = 'track-comments';
                
                let commentsHtml = '<h5><i class="fas fa-comments"></i> Instructor Comments</h5><div class="comments-list">';
                
                comments.forEach(comment => {
                    const commentDate = comment.date ? new Date(comment.date).toLocaleDateString() : 'N/A';
                    commentsHtml += `
                        <div class="comment-item">
                            <div class="comment-date">${commentDate}</div>
                            <div class="comment-text">${comment.text || comment.comment || 'No comment content'}</div>
                        </div>
                    `;
                });
                
                commentsHtml += '</div>';
                commentsSection.innerHTML = commentsHtml;
                trackCard.appendChild(commentsSection);
            }

            // Tasks section
            if (tasks && tasks.length > 0) {
                const tasksSection = document.createElement('div');
                tasksSection.className = 'track-tasks';
                
                // Create header
                tasksSection.innerHTML = `<h5><i class="fas fa-tasks"></i> Tasks (${tasks.length})</h5>`;
                
                // Create table for tasks
                const tasksTable = document.createElement('div');
                tasksTable.className = 'tasks-table';
                
                // Table header
                const taskHeader = document.createElement('div');
                taskHeader.className = 'task-header';
                taskHeader.innerHTML = `
                    <div class="task-cell">Task Name</div>
                    <div class="task-cell">Deadline</div>
                    <div class="task-cell">Score</div>
                `;
                tasksTable.appendChild(taskHeader);
                
                // Sort tasks by date (newest first)
                const sortedTasks = [...tasks].sort((a, b) => {
                    const dateA = a.taskDeadline ? new Date(a.taskDeadline) : new Date(0);
                    const dateB = b.taskDeadline ? new Date(b.taskDeadline) : new Date(0);
                    return dateB - dateA;
                });
                
                // Show only first 5 tasks initially
                const displayTasks = sortedTasks.slice(0, 5);
                
                displayTasks.forEach(task => {
                    const taskRow = document.createElement('div');
                    taskRow.className = 'task-row';
                    
                    // Format date
                    const deadlineDate = task.taskDeadline ? new Date(task.taskDeadline).toLocaleDateString() : 'No deadline';
                    
                    // Calculate score
                    const scoreClass = getTaskScoreClass(task.studentTaskDegree, task.taskDegree);
                    
                    taskRow.innerHTML = `
                        <div class="task-cell task-name">${task.taskName || 'Unnamed Task'}</div>
                        <div class="task-cell task-date">${deadlineDate}</div>
                        <div class="task-cell task-score ${scoreClass}">${task.studentTaskDegree || 0}/${task.taskDegree || 0}</div>
                    `;
                    
                    tasksTable.appendChild(taskRow);
                });
                
                tasksSection.appendChild(tasksTable);
                
                // Add a "Show more" button if there are more than 5 tasks
                if (sortedTasks.length > 5) {
                    const showMoreContainer = document.createElement('div');
                    showMoreContainer.className = 'show-more-tasks';
                    
                    const showMoreButton = document.createElement('button');
                    showMoreButton.textContent = `Show ${sortedTasks.length - 5} more tasks`;
                    showMoreButton.addEventListener('click', () => {
                        // Remove the show more button
                        showMoreContainer.remove();
                        
                        // Add remaining tasks
                        sortedTasks.slice(5).forEach(task => {
                            const taskRow = document.createElement('div');
                            taskRow.className = 'task-row';
                            
                            // Format date
                            const deadlineDate = task.taskDeadline ? new Date(task.taskDeadline).toLocaleDateString() : 'No deadline';
                            
                            // Calculate score
                            const scoreClass = getTaskScoreClass(task.studentTaskDegree, task.taskDegree);
                            
                            taskRow.innerHTML = `
                                <div class="task-cell task-name">${task.taskName || 'Unnamed Task'}</div>
                                <div class="task-cell task-date">${deadlineDate}</div>
                                <div class="task-cell task-score ${scoreClass}">${task.studentTaskDegree || 0}/${task.taskDegree || 0}</div>
                            `;
                            
                            tasksTable.appendChild(taskRow);
                        });
                    });
                    
                    showMoreContainer.appendChild(showMoreButton);
                    tasksSection.appendChild(showMoreContainer);
                }
                
                trackCard.appendChild(tasksSection);
            } else {
                // No tasks message
                const noTasksMessage = document.createElement('div');
                noTasksMessage.className = 'no-tasks-message';
                noTasksMessage.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <p>No tasks assigned in this track yet.</p>
                    </div>
                `;
                trackCard.appendChild(noTasksMessage);
            }
        } 

        tracksList.appendChild(trackCard);
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
    // Fetch student details
    // Usamos el ID como índice numérico (que es lo que ahora reconoce nuestro controlador)
    const numericId = parseInt(studentId, 10);
    fetch(`/api/students/student-details/${numericId}`)
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
    link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
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
    printWindow.onload = function () {
        printWindow.print();
        printWindow.onafterprint = function () {
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

        switch (column) {
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

// Helper function to calculate average score from tasks
function calculateAverageScoreFromTasks(tasks) {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return 0;
    }

    let totalScore = 0;
    let scorePoints = 0;

    tasks.forEach(task => {
        if (task && task.taskDegree && task.taskDegree > 0 && task.studentTaskDegree >= 0) {
            totalScore += (task.studentTaskDegree / task.taskDegree) * 100;
            scorePoints++;
        }
    });

    return scorePoints > 0 ? Math.round(totalScore / scorePoints) : 0;
}

// Helper function to get CSS class based on score percentage
function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    if (score >= 60) return 'score-fair';
    return 'score-poor';
}

// Helper function to get CSS class for task scores
function getTaskScoreClass(studentScore, maxScore) {
    if (!maxScore || maxScore <= 0) return 'score-na';

    const percentage = (studentScore / maxScore) * 100;

    if (percentage >= 90) return 'score-excellent';
    if (percentage >= 80) return 'score-good';
    if (percentage >= 70) return 'score-average';
    if (percentage >= 60) return 'score-fair';
    if (percentage > 0) return 'score-poor';
    return 'score-zero';
}

// Initialize the page when DOM is loaded
// Add CSS for collapsed filters
const style = document.createElement('style');
style.textContent = `
    .filters-body.collapsed {
        display: none;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', initializePage);

const logout = document.getElementsByClassName('fas fa-sign-out-alt')[0];
logout.addEventListener("click", function () {
    fetch('http://127.0.0.1:3000/api/auth/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).then(res => {
        if (res.status === 200) {
            window.location.href = "http://127.0.0.1:3000/api/auth/login";
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Logout Failed',
                text: 'Failed to log out!',
            });
        }
    })

});
