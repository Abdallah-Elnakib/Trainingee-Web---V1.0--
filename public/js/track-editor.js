
function openEditTrackModal(trackId) {
    if (!trackId) {
        console.error('No track ID provided');
        return;
    }
    
    console.log('Opening edit modal for track ID:', trackId);
    
    // Reset form and set title
    trackForm.reset();
    modalTitle.textContent = 'Edit Track';
    
    // Show loading indicator
    Swal.fire({
        title: 'Loading...',
        text: 'Fetching track data',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Fetch track data directly from server
    fetch(`/api/tracks/track/${trackId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            Swal.close(); // Close loading indicator
            
            if (!data || !data.track) {
                throw new Error('Invalid track data received');
            }
            
            const track = data.track;
            console.log('Track data received:', track);
            
            // Populate form fields
            trackIdInput.value = track._id;
            document.getElementById('trackName').value = track.trackName || '';
            
            // Format dates properly
            if (track.trackStartDate) {
                const startDate = new Date(track.trackStartDate);
                document.getElementById('trackStartDate').value = startDate.toISOString().split('T')[0];
            }
            
            if (track.trackEndDate) {
                const endDate = new Date(track.trackEndDate);
                document.getElementById('trackEndDate').value = endDate.toISOString().split('T')[0];
            }
            
            document.getElementById('trackStatus').value = track.trackStatus || '';
            document.getElementById('trackAssignedTo').value = track.trackAssignedTo || '';
            
            // Show modal
            trackModal.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error fetching track data:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load track data. Please try again.'
            });
        });
}

// Save track data (works for both new and updated tracks)
function saveTrackData() {
    // Validate form
    if (!trackForm.checkValidity()) {
        trackForm.reportValidity();
        return;
    }
    
    // Collect form data
    const trackData = {
        trackName: document.getElementById('trackName').value,
        trackStartDate: document.getElementById('trackStartDate').value,
        trackEndDate: document.getElementById('trackEndDate').value,
        trackStatus: document.getElementById('trackStatus').value,
        trackAssignedTo: document.getElementById('trackAssignedTo').value
    };
    
    // Determine if this is a new track or an update
    const trackId = trackIdInput.value;
    const isUpdate = !!trackId;
    
    // Set URL and method based on whether this is a new track or an update
    const url = isUpdate ? `/api/tracks/update-track/${trackId}` : '/api/tracks/add-track';
    const method = isUpdate ? 'PATCH' : 'POST';
    
    console.log(`${isUpdate ? 'Updating' : 'Creating'} track with data:`, trackData);
    
    // Show loading indicator
    Swal.fire({
        title: `${isUpdate ? 'Updating' : 'Creating'} Track...`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Send request
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackData)
    })
    .then(response => {
        // Always try to get JSON response for error messages
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save track');
            }
            return data;
        });
    })
    .then(data => {
        // Close modal and show success message
        trackModal.style.display = 'none';
        
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: isUpdate ? 'Track updated successfully' : 'Track created successfully'
        }).then(() => {
            // Reload page to show updated data
            window.location.reload();
        });
    })
    .catch(error => {
        console.error('Error saving track:', error);
        
        // Handle specific known error messages
        let userMessage = error.message || 'Failed to save track';
        
        if (userMessage.includes('Track already exists')) {
            userMessage = 'A track with this name already exists. Please choose a different name.';
        }
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: userMessage
        });
    });
}

// Close modal
function closeTrackModal() {
    trackModal.style.display = 'none';
}

// Delete track
function deleteTrack(element) {
    // Extract track ID from element if it's an object
    let trackId;
    
    if (typeof element === 'object' && element !== null) {
        // Try to get the data-track-id attribute
        trackId = element.getAttribute('data-track-id');
        
        // If not found directly, try to find it in a parent element
        if (!trackId && element.closest) {
            const closestElement = element.closest('[data-track-id]');
            if (closestElement) {
                trackId = closestElement.getAttribute('data-track-id');
            }
        }
        
        console.log('Extracted track ID for deletion:', trackId);
    } else {
        // If a direct ID string was passed
        trackId = element;
    }
    
    if (!trackId || trackId === 'undefined' || trackId === 'null' || trackId === '' || trackId === 'javascript:void(0)') {
        console.error('No valid track ID provided for deletion');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invalid track ID: ' + (trackId || 'empty')
        });
        return;
    }
    
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
    }).then(result => {
        if (result.isConfirmed) {
            // Show loading
            Swal.fire({
                title: 'Deleting...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });
            
            fetch(`/api/tracks/delete-track/${trackId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Failed to delete track');
                    });
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Track has been deleted.'
                }).then(() => {
                    window.location.reload();
                });
            })
            .catch(error => {
                console.error('Error deleting track:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to delete track'
                });
            });
        }
    });
}

// Open modal for adding a new track
function openAddTrackModal() {
    // Reset form
    trackForm.reset();
    trackIdInput.value = '';
    
    // Set title
    modalTitle.textContent = 'Add New Track';
    
    // Show modal
    trackModal.style.display = 'flex';
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const addTrackBtn = document.getElementById('addTrackBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelTrackBtn = document.getElementById('cancelTrack');
    
    // Attach event listeners
    if (addTrackBtn) {
        addTrackBtn.addEventListener('click', openAddTrackModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTrackModal);
    }
    
    if (cancelTrackBtn) {
        cancelTrackBtn.addEventListener('click', closeTrackModal);
    }
    
    // Add form submit handler
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTrackData();
        });
    }
    
    console.log('Track editor initialized');
});
