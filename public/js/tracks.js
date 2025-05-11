// DOM Elements
const trackModal = document.getElementById('trackModal');
const addTrackBtn = document.getElementById('addTrackBtn');
const addTrackEmptyBtn = document.getElementById('addTrackEmptyBtn');
const closeModal = document.getElementById('closeModal');
const cancelTrack = document.getElementById('cancelTrack');
const saveTrack = document.getElementById('saveTrack');
const trackForm = document.getElementById('trackForm');
const modalTitle = document.getElementById('modalTitle');
const trackIdInput = document.getElementById('trackId');
const editButtons = document.querySelectorAll('.edit-btn');
const deleteButtons = document.querySelectorAll('.delete-btn');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');
const dateFromFilter = document.getElementById('dateFrom');
const dateToFilter = document.getElementById('dateTo');
const searchFilter = document.getElementById('searchFilter');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const tracksTable = document.querySelector('.tracks-table') || document.querySelector('table');
const perPageSelect = document.getElementById('perPageSelect');
const paginationPages = document.getElementById('paginationPages');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

// Open Modal for New Track
function openNewTrackModal() {
    modalTitle.textContent = 'Add New Track';
    trackForm.reset();
    trackIdInput.value = '';
    trackModal.style.display = 'flex';
}

// Open Modal for Editing Track
function openEditTrackModal(trackId) {
    modalTitle.textContent = 'Edit Track';
    // Fetch track data - using the all-tracks endpoint and filtering for specific track
    fetch(`/api/tracks/all-tracks`)
        .then(response => response.json())
        .then(track => {
            trackIdInput.value = track._id;
            document.getElementById('trackName').value = track.trackName;
            document.getElementById('trackStartDate').value = formatDateForInput(track.trackStartDate);
            document.getElementById('trackEndDate').value = formatDateForInput(track.trackEndDate);
            document.getElementById('trackStatus').value = track.trackStatus;
            document.getElementById('trackAssignedTo').value = track.trackAssignedTo;
            trackModal.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error fetching track:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch track data',
            });
        });
}

// Close Modal
function closeTrackModal() {
    trackModal.style.display = 'none';
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Save Track
function saveTrackData() {
    if (!trackForm.checkValidity()) {
        trackForm.reportValidity();
        return;
    }

    // Convert form data to proper format
    const trackData = {
        trackName: document.getElementById('trackName').value,
        trackStartDate: document.getElementById('trackStartDate').value,
        trackEndDate: document.getElementById('trackEndDate').value,
        trackStatus: document.getElementById('trackStatus').value,
        trackAssignedTo: document.getElementById('trackAssignedTo').value
    };

    // Log the data being sent (for debugging)
    console.log('Sending track data:', trackData);

    const trackId = trackIdInput.value;
    // Use the add-track endpoint for both new tracks and updates
    const url = '/api/tracks/add-track';
    const method = 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackData)
    })
        .then(response => {
            // Always get the JSON to see error details if any
            return response.json().then(data => {
                if (!response.ok) {
                    // If response has error message, throw it
                    throw new Error(data.message || 'Failed to save track');
                }
                return data;
            });
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: trackId ? 'Track updated successfully' : 'Track created successfully',
            }).then(() => {
                window.location.reload();
            });
        })
        .catch(error => {
            console.error('Error saving track:', error);
            
            // Display specific error message from server if available
            const errorMessage = error.message || 'Failed to save track';
            
            // Create a more user-friendly message based on the error
            let userMessage = errorMessage;
            
            // Handle specific known error messages
            if (errorMessage.includes('Track already exists')) {
                userMessage = 'A track with this name already exists. Please choose a different name.';
            } else if (errorMessage.includes('Track Name is required')) {
                userMessage = 'Please enter a track name.';
            } else if (errorMessage.includes('Start and end dates are required')) {
                userMessage = 'Please provide both start and end dates for the track.';
            } else if (errorMessage.includes('Invalid date format')) {
                userMessage = 'The dates you entered are not in a valid format. Please check and try again.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: userMessage,
                footer: '<small>If this issue persists, please contact support.</small>'
            });
        });
}

// Delete Track - Simplified version
function deleteTrack(trackId) {
    // More detailed debugging
    console.log('Attempting to delete track with ID:', trackId);
    console.log('Type of trackId:', typeof trackId);
    console.log('trackId value:', trackId);
    console.log('trackId length:', trackId ? trackId.length : 0);
    
    // Handle empty strings, undefined, and null values
    if (!trackId || trackId === 'undefined' || trackId === 'null' || trackId.trim() === '') {
        console.error('No valid track ID provided for deletion!');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Missing track ID for deletion',
        });
        return;
    }
    
    // Clean up the ID if it has quotes
    trackId = trackId.replace(/["']/g, '');
    
    Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const deleteUrl = `/api/tracks/delete-track/${trackId}`;
            console.log('Sending DELETE request to:', deleteUrl);
            
            fetch(deleteUrl, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log('Track deletion response:', data);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Track has been deleted successfully.',
                }).then(() => {
                    window.location.reload();
                });
            })
            .catch(error => {
                console.error('Error deleting track:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete track',
                });
            });
        }
    });
}

// Event Listeners
if (addTrackBtn) addTrackBtn.addEventListener('click', openNewTrackModal);
if (addTrackEmptyBtn) addTrackEmptyBtn.addEventListener('click', openNewTrackModal);

// Pagination event listeners
if (perPageSelect) {
    perPageSelect.addEventListener('change', changeItemsPerPage);
}

if (paginationPages) {
    paginationPages.addEventListener('click', function(event) {
        if (event.target.classList.contains('pagination-page')) {
            const page = event.target.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        }
    });
}

if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function() {
        if (!this.hasAttribute('disabled')) {
            const currentPage = getCurrentPage();
            if (currentPage > 1) {
                navigateToPage(currentPage - 1);
            }
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function() {
        if (!this.hasAttribute('disabled')) {
            const currentPage = getCurrentPage();
            navigateToPage(currentPage + 1);
        }
    });
}

// Modal Event Listeners
if (closeModal) closeModal.addEventListener('click', closeTrackModal);
if (cancelTrack) cancelTrack.addEventListener('click', closeTrackModal);
if (saveTrack) saveTrack.addEventListener('click', saveTrackData);

// Table Action Event Listeners
if (editButtons && editButtons.length) {
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const trackId = button.getAttribute('data-track-id');
            openEditTrackModal(trackId);
        });
    });
}

if (deleteButtons && deleteButtons.length) {
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const trackId = button.getAttribute('data-track-id');
            deleteTrack(trackId);
        });
    });
}

if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        window.location.reload();
    });
}

// Event delegation for dynamic elements
if (tracksTable) {
    tracksTable.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn') || event.target.closest('.delete-btn')) {
            // Handle delete button click
            const deleteBtn = event.target.closest('.delete-btn');
            if (deleteBtn) {
                const trackId = deleteBtn.getAttribute('data-track-id');
                if (trackId) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('Delete action initiated for trackId:', trackId);
                    deleteTrack(trackId);
                } else {
                    console.error('No track ID found on delete button');
                }
            }
        }
    });
}

// Filter Functions

// Function to apply filters and fetch filtered tracks
function applyFilters() {
    try {
        const status = statusFilter.value;
        const dateFrom = dateFromFilter.value;
        const dateTo = dateToFilter.value;
        const searchTerm = searchFilter.value;
        
        if (!status && !dateFrom && !dateTo && !searchTerm) {
            // If no filters are set, just reload the page without parameters
            window.location.href = '/tracks';
            return;
        }
        
        console.log('Applying filters:', { status, dateFrom, dateTo, searchTerm });
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (status) queryParams.append('status', status);
        if (dateFrom) queryParams.append('dateFrom', dateFrom);
        if (dateTo) queryParams.append('dateTo', dateTo);
        if (searchTerm) queryParams.append('search', searchTerm);
        
        // Simply redirect to the tracks page with filter parameters
        // Our updated tracksController will handle the filtering
        window.location.href = `/tracks?${queryParams.toString()}`;
        
    } catch (error) {
        console.error('Error applying filters:', error);
        Swal.fire({
            icon: 'error',
            title: 'Filter Error',
            text: 'Failed to apply filters. Please try again.',
        });
    }
}

// Function to reset filters
function resetFilters() {
    statusFilter.value = '';
    dateFromFilter.value = '';
    dateToFilter.value = '';
    searchFilter.value = '';
    
    // Navigate back to tracks page without filters
    window.location.href = '/tracks';
}

// Pagination Functions

// Function to get the current page from URL parameters
function getCurrentPage() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('page')) || 1;
}

// Function to navigate to a specific page
function navigateToPage(page) {
    // Get current URL parameters
    const params = new URLSearchParams(window.location.search);
    
    // Update page parameter
    params.set('page', page);
    
    // Navigate to new URL
    window.location.href = `${window.location.pathname}?${params.toString()}`;
}

// Function to change number of items per page
function changeItemsPerPage() {
    // Get selected value
    const perPage = perPageSelect.value;
    
    // Get current URL parameters
    const params = new URLSearchParams(window.location.search);
    
    // Update perPage parameter and reset to page 1
    params.set('perPage', perPage);
    params.set('page', '1');
    
    // Navigate to new URL
    window.location.href = `${window.location.pathname}?${params.toString()}`;
}

// Add event listeners to filter buttons
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
    console.log('Apply filters button handler attached');
}

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
    console.log('Reset filters button handler attached');
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === trackModal) {
        closeTrackModal();
    }
});



const logout = document.getElementsByClassName("logout-btn")[0];
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