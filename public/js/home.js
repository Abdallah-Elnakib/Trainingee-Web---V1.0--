const logout = document.getElementById("Logout");
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

const getTracks = document.getElementsByClassName("flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full");
for (const track of getTracks) {
  track.addEventListener("click", function () {
    // Hide all table containers
    const tableContainers = document.querySelectorAll('.table-container');
    tableContainers.forEach(container => {
      container.style.display = 'none';
    });
    
    // Show the selected track's table container
    const trackName = track.innerText;
    const tableContainer = document.getElementById(`container-${trackName}`);
    if (tableContainer) {
      tableContainer.style.display = 'block';
    }
    
    // حفظ المسار المحدد في التخزين المحلي
    console.log('User clicked on track:', trackName);
    localStorage.setItem('lastActiveTrack', trackName);
    
    // Update the header text
    document.getElementsByClassName('flex items-center text-3xl text-gray-900 dark:text-white')[0].innerText = trackName;
  })
}
// Search functionality for student tables
function setupStudentSearch() {
  const searchInputs = document.querySelectorAll('.student-search-input');
  
  searchInputs.forEach(searchInput => {
    // Get the table within the same container
    const tableContainer = searchInput.closest('.table-container');
    const table = tableContainer ? tableContainer.querySelector('table') : null;
    
    if (!table) return;
    
    // Add event listener for real-time search
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const rows = table.querySelectorAll('tbody tr');
      
      // Filter table rows
      rows.forEach(row => {
        const nameCell = row.querySelector('td:nth-child(2)');
        const idCell = row.querySelector('td:nth-child(1)');
        
        if (!nameCell || !idCell) return;
        
        const name = nameCell.textContent.toLowerCase();
        const id = idCell.textContent.toLowerCase();
        
        // Show/hide row based on whether name or ID contains the search term
        if (name.includes(searchTerm) || id.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
    
    // Add event listener for Escape key to clear search
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    });
  });
}

// Function to add event listeners to cells for editing
function setupCellEditors(cells) {
  cells.forEach(cell => {
    // Skip cells that already have event listeners
    if (cell.hasAttribute('data-has-events')) return;
    
    cell.setAttribute('data-has-events', 'true');
    cell.addEventListener("dblclick", () => {
      const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
      const editableFields = [1, 2, 3, 6]; // Added 2 (Degrees) to editable fields
      
      if (columnIndex === 2) {
        showTaskGradesEditor(cell);
        return;
      }
      
      if (columnIndex === 8) return;
      
      if (!editableFields.includes(columnIndex)) {
        Swal.fire({
          icon: 'info',
          title: 'Not Editable',
          text: 'You can only edit the Name, Degrees, Additional, or Comments fields directly.',
        });
        return;
      }

      if (cell.querySelector("input")) return;

      const originalValue = cell.textContent.trim();
      const input = document.createElement("input");
      input.type = "text";
      input.value = originalValue;
      input.className = "w-full bg-transparent text-inherit border border-blue-300 px-1 rounded";

      cell.innerHTML = "";
      cell.appendChild(input);
      input.focus();

      input.addEventListener("blur", () => {
        const newValue = input.value.trim();
        cell.innerHTML = newValue;

        if (newValue !== originalValue) {
          updateCell(cell, newValue);
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupStudentSearch();
  setupStudentStatusHandlers();
  
  // Setup cell editors for existing cells
  const tableCells = document.querySelectorAll("td");
  setupCellEditors(tableCells);
});

function showTaskGradesEditor(cell) {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  const trackName = table.id;
  const studentId = Number(row.children[0].textContent.trim());
  
  console.log('Opening task window for student:', studentId, 'in track:', trackName);
  
  // Show loading indicator
  Swal.fire({
    title: 'Loading tasks...',
    text: 'Please wait while we fetch the task data',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  // Fetch student data to get the tasks
  fetch(`http://127.0.0.1:3000/api/students/get-student-tasks/${trackName}/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (!data || !data.student || !Array.isArray(data.student.BasicTotal)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not retrieve task data!',
      });
      return;
    }
    
    const tasks = data.student.BasicTotal;
    let totalTaskGrades = 0;
    
    // Create HTML for task list with improved styling
    let taskListHTML = `
      <div class="task-list-container">
        <table class="task-grades-table w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-3 border-b-2 border-gray-300 font-semibold">Task</th>
              <th class="text-right p-3 border-b-2 border-gray-300 font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    tasks.forEach((task, index) => {
      totalTaskGrades += task.studentTaskDegree || 0;
      taskListHTML += `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="p-3 border-b border-gray-200">
            <div class="flex flex-col">
              <span class="font-medium">${task.taskName}</span>
              <span class="text-xs text-gray-500">${task.studentTaskDegree || 0}/${task.taskDegree}</span>
            </div>
          </td>
          <td class="p-3 border-b border-gray-200 text-right">
            <div class="relative w-full flex justify-end">
              <input type="number" 
                    id="task-grade-${index}" 
                    class="task-grade-input w-20 text-right p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                    value="${task.studentTaskDegree || 0}" 
                    data-original="${task.studentTaskDegree || 0}" 
                    data-max="${task.taskDegree}" 
                    data-index="${index}" 
                    data-task-name="${task.taskName}">
            </div>
          </td>
        </tr>
      `;
    });
    
    taskListHTML += `
          </tbody>
          <tfoot>
            <tr class="bg-gray-100">
              <td class="p-3 border-t-2 border-gray-300 font-bold">Total Score</td>
              <td class="p-3 border-t-2 border-gray-300 text-right font-bold" id="task-total">${totalTaskGrades}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
    
    // Show the task list in a professionally styled modal
    Swal.fire({
      title: '<span class="text-xl font-semibold">Student Task Scores</span>',
      html: taskListHTML,
      width: '550px',
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      customClass: {
        container: 'task-grades-modal',
        popup: 'rounded-lg shadow-lg',
        header: 'border-b pb-3',
        content: 'pt-4',
        confirmButton: 'px-4 py-2 rounded-md',
        cancelButton: 'px-4 py-2 rounded-md'
      },
      didOpen: () => {
        // Add event listeners to update total when grades change
        const inputs = document.querySelectorAll('.task-grade-input');
        inputs.forEach(input => {
          input.addEventListener('input', updateTaskTotal);
        });
      },
      preConfirm: () => {
        // Collect all task grades
        const updatedTasks = [];
        const inputs = document.querySelectorAll('.task-grade-input');
        let hasChanges = false;
        
        inputs.forEach(input => {
          const index = parseInt(input.getAttribute('data-index'));
          const taskName = input.getAttribute('data-task-name');
          const maxGrade = parseInt(input.getAttribute('data-max'));
          const newGrade = parseInt(input.value) || 0;
          const originalGrade = parseInt(input.getAttribute('data-original'));
          
          // Validate that the grade doesn't exceed the maximum
          const validatedGrade = Math.min(newGrade, maxGrade);
          
          if (validatedGrade !== originalGrade) {
            hasChanges = true;
          }
          
          updatedTasks.push({
            index: index,
            taskName: taskName,
            studentTaskDegree: validatedGrade
          });
        });
        
        if (!hasChanges) {
          return { noChanges: true };
        }
        
        return { tasks: updatedTasks };
      }
    }).then((result) => {
      if (result.isConfirmed && !result.value.noChanges) {
        // Save changes to database
        fetch(`http://127.0.0.1:3000/api/students/update-student-tasks/${trackName}/${studentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tasks: result.value.tasks
          })
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to update tasks');
        })
        .then(data => {
          // Update the Degrees cell with the new total student task grades
          cell.textContent = data.degrees || 0;
          
          // Update the TotalDegrees cell (degrees + additional)
          const additional = Number(row.children[3].textContent.trim());
          row.children[5].textContent = (data.degrees || 0) + additional;
          
          // Update table data (colors, ranking, etc.)
          updateTableData(table);
          
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task grades updated successfully!',
            timer: 1500
          });
        })
        .catch(error => {
          console.error('Error updating task grades:', error);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Failed to update task grades!',
          });
        });
      }
    });
  })
  .catch(error => {
    console.error('Error fetching student tasks:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to retrieve student tasks!',
    });
  });
}

// Function to update task total in the modal
function updateTaskTotal() {
  const inputs = document.querySelectorAll('.task-grade-input');
  let total = 0;
  
  inputs.forEach(input => {
    const maxGrade = parseInt(input.getAttribute('data-max'));
    const inputValue = parseInt(input.value) || 0;
    const validValue = Math.min(inputValue, maxGrade);
    total += validValue;
    
    if (validValue !== inputValue) {
      input.value = validValue;
    }
  });
  
  document.getElementById('task-total').textContent = total;
}

function setupStudentStatusHandlers() {
  // Add change event listeners to all status selects
  document.addEventListener('change', function(event) {
    if (event.target.classList.contains('status-select')) {
      const select = event.target;
      const cell = select.closest('.student-status-cell');
      
      if (!cell) return;
      
      // Get the data attributes and ensure proper formatting
      const studentId = select.getAttribute('data-student-id');
      const trackName = cell.getAttribute('data-track-name');
      const newStatus = select.value;
      const currentStatus = select.getAttribute('data-current-status');
      
      // Log the data we're sending to help with debugging
      console.log('Updating student status with data:', {
        studentId: studentId,
        trackName: trackName,
        newStatus: newStatus,
        currentStatus: currentStatus
      });
      
      // Don't do anything if selecting the same status
      if (newStatus === currentStatus) return;
      
      // Define status colors for styling the select
      const statusColors = {
        'Pending': 'border-yellow-400',
        'Accepted': 'border-green-400',
        'Rejected': 'border-red-400',
        'In Progress': 'border-blue-400'
      };
      
      // Update select border color immediately
      Object.values(statusColors).forEach(cls => select.classList.remove(cls));
      select.classList.add(statusColors[newStatus]);
      
      // Disable the select and add visual feedback during the update
      select.disabled = true;
      select.classList.add('opacity-50');
      
      // Update the status via API - use the correct endpoint path
      fetch(`http://127.0.0.1:3000/api/students/update-student-status/${trackName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: studentId,
          newStatus: newStatus
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Status update failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Update the data-current-status attribute
        select.setAttribute('data-current-status', newStatus);
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Student status changed to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false
        });
      })
      .catch(error => {
        console.error('Error updating student status:', error);
        
        // Revert the select back to the original value
        select.value = currentStatus;
        
        // Revert border color to match original status
        Object.values(statusColors).forEach(cls => select.classList.remove(cls));
        select.classList.add(statusColors[currentStatus]);
        
        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update student status. Please try again.'
        });
      })
      .finally(() => {
        // Re-enable the select
        select.disabled = false;
        select.classList.remove('opacity-50');
      });
    }
  });
}

// Function to setup student status display for a specific table or all tables
function setupStudentStatusDisplay(targetTable = null) {
  const tables = targetTable ? [targetTable] : document.querySelectorAll('table');
  
  tables.forEach(table => {
    const trackName = table.id;
    if (!trackName) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const studentId = row.querySelector('td:first-child')?.textContent.trim();
      if (!studentId || studentId === 'Auto') return;
      
      // Check if status cell exists, if not, create it
      let statusCell = row.querySelector('.student-status-cell');
      if (!statusCell) {
        const lastCell = row.querySelector('td:last-child');
        if (!lastCell) return;
        
        // Add status column if it doesn't exist
        statusCell = document.createElement('td');
        statusCell.className = 'student-status-cell sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800';
        statusCell.setAttribute('data-track-name', trackName);
        
        // Add the new cell to the row
        row.insertBefore(statusCell, row.lastChild);
        
        // Fetch the current status
        fetch(`http://127.0.0.1:3000/api/students/get-student/${trackName}/${studentId}`)
          .then(response => response.json())
          .then(data => {
            if (data && data.student) {
              const status = data.student.studentStatus || 'Pending';
              
              // Create the status dropdown
              const statusColors = {
                'Pending': 'border-yellow-400',
                'Accepted': 'border-green-400',
                'Rejected': 'border-red-400',
                'In Progress': 'border-blue-400'
              };
              
              const selectEl = document.createElement('select');
              selectEl.className = `status-select form-select w-full border-2 ${statusColors[status]} p-1 rounded`;
              selectEl.setAttribute('data-student-id', studentId);
              selectEl.setAttribute('data-current-status', status);
              
              // Add options
              ['Pending', 'Accepted', 'Rejected', 'In Progress'].forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                if (optionValue === status) option.selected = true;
                selectEl.appendChild(option);
              });
              
              statusCell.appendChild(selectEl);
            }
          })
          .catch(error => {
            console.error('Error fetching student status:', error);
            statusCell.textContent = 'Error loading status';
          });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Document loaded, initializing all components');
  
  // Initialize all components
  setupStudentStatusHandlers();
  
  // Setup status displays and interactive elements for all tables
  const allTables = document.querySelectorAll('table');
  allTables.forEach(table => {
    if (!table.id) return;
    console.log('Initializing table:', table.id);
    setupInteractiveElements(table);
  });
  
  // Add click handlers to degree cells for task window
  document.querySelectorAll('td:nth-child(3)').forEach(cell => {
    if (!cell.hasAttribute('data-has-task-event')) {
      cell.setAttribute('data-has-task-event', 'true');
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', () => {
        showTaskGradesEditor(cell);
      });
    }
  });
  
  // إصلاح نهائي لآلية تخزين وفتح المسار الأخير
  setTimeout(() => {
    const lastActiveTrack = localStorage.getItem('lastActiveTrack');
    if (lastActiveTrack) {
      console.log('Opening last active track:', lastActiveTrack);
      // البحث عن أزرار المسار باستخدام الطريقة الصحيحة
      const trackButtons = document.getElementsByClassName("flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full");
      
      console.log('Found track buttons:', trackButtons.length);
      for (let i = 0; i < trackButtons.length; i++) {
        const buttonText = trackButtons[i].innerText.trim();
        console.log(`Button ${i} text:`, buttonText);
        
        if (buttonText === lastActiveTrack.trim()) {
          console.log('Found matching track button, clicking it');
          trackButtons[i].click();
          break;
        }
      }
    }
  }, 500);
});

function updateCell(cell, newValue) {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  const trackName = table.id;
  const studentId = row.children[0].textContent.trim();
  
  if (!studentId || studentId === "Auto") {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Student must be saved first before editing!',
    });
    return;
  }
  
  const columnIndex = Array.from(row.children).indexOf(cell);
  
  let fieldToUpdate;
  let valueToUpdate;
  
  switch (columnIndex) {
    case 1: // Name column
      fieldToUpdate = "studentName";
      valueToUpdate = newValue;
      break;
    case 2: // Degrees column
      fieldToUpdate = "studentDegrees";
      valueToUpdate = Number(newValue);
      break;
    case 3: // Additional column
      fieldToUpdate = "studentAdditional";
      valueToUpdate = Number(newValue);
      break;
    case 6: // Comments column
      fieldToUpdate = "studentComments";
      valueToUpdate = newValue;
      break;
    default:
      console.error("Trying to update a non-editable column");
      return;
  }
  
  // Show updating message
  const loadingToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  
  loadingToast.fire({
    icon: 'info',
    title: 'Updating data...'
  });
  
  fetch(`http://127.0.0.1:3000/api/students/update-student/${trackName}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentId: Number(studentId),
      [fieldToUpdate]: valueToUpdate
    })
  }).then(res => {
    if (res.status === 200) {
      // Use the comprehensive refresh for ALL updates
      refreshUI(table);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Student data updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update student data!',
      });
    }
  }).catch(error => {
    console.error("Error updating student:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while updating student data.',
    });
  });
}

// Function to refresh and update all UI components
function refreshUI(table) {
  if (!table) {
    console.error("No table provided to refreshUI");
    return;
  }
  
  console.log('Refreshing UI for table:', table.id);
  
  // Save current student status values before updating
  const statusValues = saveStudentStatusValues(table);
  
  updateTableData(table);
  
  setupInteractiveElements(table);
  
  restoreStudentStatusValues(table, statusValues);
}

function saveStudentStatusValues(table) {
  const statusValues = [];
  
  // Find all status selects in the table
  const statusSelects = table.querySelectorAll('.status-select');
  
  statusSelects.forEach(select => {
    statusValues.push({
      studentId: select.getAttribute('data-student-id'),
      status: select.value,
      currentStatus: select.getAttribute('data-current-status')
    });
  });
  
  console.log('Saved status values:', statusValues);
  return statusValues;
}

function restoreStudentStatusValues(table, statusValues) {
  if (!statusValues || statusValues.length === 0) return;
  
  console.log('Attempting to restore statuses:', statusValues);
  
  const statusSelects = table.querySelectorAll('.status-select');
  console.log('Found status selects:', statusSelects.length);
  
  statusSelects.forEach(select => {
    const studentId = select.getAttribute('data-student-id');
    console.log('Processing select for student ID:', studentId);
    
    // Find matching saved status
    const savedStatus = statusValues.find(s => s.studentId === studentId);
    
    if (savedStatus) {
      console.log('Found saved status for ID', studentId, ':', savedStatus);
      select.value = savedStatus.status;
      select.setAttribute('data-current-status', savedStatus.currentStatus);
      
      const statusColors = {
        'Pending': 'border-yellow-400',
        'Accepted': 'border-green-400',
        'Rejected': 'border-red-400',
        'In Progress': 'border-blue-400'
      };
      
      // Remove all status color classes
      Object.values(statusColors).forEach(cls => select.classList.remove(cls));
      
      // Add the appropriate color class
      select.classList.add(statusColors[savedStatus.status]);
    } else {
      console.log('No saved status found for student ID:', studentId);
    }
  });
}

function setupInteractiveElements(table) {
  if (!table) return;
  
  console.log('Setting up interactive elements for:', table.id);
  
  const cells = table.querySelectorAll('td');
  
  setupCellEditors(cells);
  
  attachTaskWindowHandlers(table);
  
  setupStudentStatusDisplay(table);
}

// Updated function that solves the status dropdown problem permanently
function updateTableData(table) {
  if (!table) {
    console.error("No table provided to updateTableData");
    return;
  }
  
  console.log('Updating table data for:', table.id);
  
  // ===== RADICAL NEW APPROACH: CLONE & PRESERVE STATUS DROPDOWNS =====
  
  // STEP 1: Capture all status dropdown information for restoration
  const statusCells = table.querySelectorAll('.student-status-cell');
  const statusInfo = [];
  
  statusCells.forEach(cell => {
    const select = cell.querySelector('.status-select');
    if (select) {
      const studentId = select.getAttribute('data-student-id');
      const cellHTML = cell.innerHTML; // Save the entire HTML content
      
      statusInfo.push({
        studentId,
        cellHTML
      });
    }
  });
  
  console.log('Captured status info for', statusInfo.length, 'students');
  
  // STEP 2: Update all the non-status data
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  
  rows.forEach(row => {
    if (row.children.length < 6) return;
    
    const degrees = Number(row.children[2]?.textContent.trim() || 0);
    const additional = Number(row.children[3]?.textContent.trim() || 0);
    const basicTotal = Number(row.children[4]?.textContent.trim() || 0);
    const totalDegrees = degrees + additional;

    if (row.children[5]) {
      row.children[5].textContent = totalDegrees;
    }
    
    if (row.children[0]) {
      if (degrees < basicTotal * 0.85 && degrees < basicTotal * 0.75) {
        row.children[0].style.backgroundColor = "red";
        row.children[0].style.color = "white";
      } else if (degrees < basicTotal * 0.85 && degrees >= basicTotal * 0.75) {
        row.children[0].style.backgroundColor = "rgb(209, 192, 67)";
        row.children[0].style.color = "white";
      } else if (basicTotal > 0) { // Only color green if there is a valid basicTotal
        row.children[0].style.backgroundColor = "green";
        row.children[0].style.color = "white";
      } else {
        // For new students with no basicTotal yet, use a neutral color
        row.children[0].style.backgroundColor = "#6c757d";
        row.children[0].style.color = "white";
      }
    }
    
    // Store the total degrees as a data attribute for sorting
    row.setAttribute('data-total-degrees', totalDegrees);
  });

  // STEP 3: Sort rows by total degrees (completely standard approach)
  rows.sort((a, b) => {
    const totalA = Number(a.children[5]?.textContent.trim() || 0);
    const totalB = Number(b.children[5]?.textContent.trim() || 0);
    return totalB - totalA;
  });
  
  // STEP 4: Rebuild the table with the sorted rows
  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  
  // Remove all rows
  tbody.innerHTML = '';
  
  // Add back the sorted rows and update rankings
  rows.forEach((row, index) => {
    // Update ranking number (index + 1)
    if (row.children.length >= 8) {
      row.children[7].textContent = index + 1;
    }
    
    tbody.appendChild(row);
  });
  
  // STEP 5: RESTORE STATUS DROPDOWNS DIRECTLY, NO SERVER CALLS
  const trackName = table.id;
  const updatedRows = tbody.querySelectorAll('tr');
  
  // For each row in the updated table
  updatedRows.forEach(row => {
    const studentId = row.querySelector('td:first-child')?.textContent.trim();
    if (!studentId || studentId === 'Auto') return;
    
    // Find matching saved status
    const savedStatus = statusInfo.find(s => s.studentId === studentId);
    if (savedStatus) {
      // Find or create the status cell
      let statusCell = row.querySelector('.student-status-cell');
      if (!statusCell) {
        statusCell = document.createElement('td');
        statusCell.className = 'student-status-cell sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800';
        statusCell.setAttribute('data-track-name', trackName);
        row.insertBefore(statusCell, row.lastChild);
      }
      
      // Restore the saved HTML directly
      statusCell.innerHTML = savedStatus.cellHTML;
      console.log('Restored status for student:', studentId);
    }
  });
  
  // Reattach event handlers for the status dropdowns
  setupStudentStatusHandlers();
  
  console.log('Table updated and status dropdowns restored without page reload');
}

// Delete student function - completely rebuilt for better functionality
function deleteStudent(event) {
  // Get the button that was clicked
  const button = event.target.closest('button');
  // Get the row
  const row = button.closest('tr');
  // Get the student ID
  const studentId = row.querySelector('td:first-child').textContent.trim();
  // Get the table
  const table = row.closest('table');
  // Get the track name
  const trackName = table.id;
  
  console.log('Deleting student with ID:', studentId, 'from track:', trackName);
  
  // Show confirmation dialog
  Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'سيتم حذف هذا الطالب نهائياً!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'نعم، احذف!',
    cancelButtonText: 'إلغاء'
  }).then((result) => {
    if (result.isConfirmed) {
      // Call the API to delete the student
      fetch(`http://127.0.0.1:3000/api/students/delete-student/${trackName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'studentId': Number(studentId)
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete student');
        }
        return response.json();
      })
      .then(data => {
        Swal.fire(
          'تم الحذف!',
          'تم حذف الطالب بنجاح.',
          'success'
        );
        // Remove the row from the table
        row.remove();
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire(
          'خطأ!',
          'حدث خطأ أثناء حذف الطالب.',
          'error'
        );
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const deleteLinks = document.querySelectorAll(".delete-student");
  console.log('وجدنا', deleteLinks.length, 'روابط حذف');
  
  deleteLinks.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      deleteStudent(event);
    });
  });
});

document.addEventListener("DOMContentLoaded", function() {
  // الحصول على جميع أزرار الحذف عند تحميل الصفحة
  const deleteButtons = document.querySelectorAll(".delete img");
  console.log('Found', deleteButtons.length, 'delete buttons');
  
  // إضافة مستمع أحداث لكل زر حذف
  deleteButtons.forEach(button => {
    button.addEventListener("click", function(event) {
      handleDeleteClick(event);
    });
  });
});

// وظيفة معالجة النقر على زر الحذف
function handleDeleteClick(event) {
  // الحصول على الصف
  const cell = event.target.closest('td');
  const row = cell.closest('tr');
  const studentId = row.querySelector('td:first-child').textContent.trim();
  const table = row.closest('table');
  const trackName = table.id;
  
  console.log('Delete clicked for student ID:', studentId, 'in track:', trackName);
  
  // عرض مربع تأكيد
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // استدعاء API لحذف الطالب
      fetch(`http://127.0.0.1:3000/api/students/delete-student/${trackName}/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (res.status === 200) {
          row.remove();
          Swal.fire(
            'Deleted!',
            'The student has been deleted.',
            'success'
          );
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: 'Failed to delete student!',
          });
        }
      }).catch(error => {
        console.error("Error deleting student:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the student.',
        });
      });
    }
  });
}

function setupDeleteLinkObserver() {
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          const newDeleteLinks = document.querySelectorAll(".delete-student:not([data-has-listener])");
          newDeleteLinks.forEach(link => {
            link.setAttribute('data-has-listener', 'true');
            link.addEventListener("click", function(event) {
              event.preventDefault();
              deleteStudent(event);
            });
            console.log('تمت إضافة مستمع لرابط حذف جديد');
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  setupDeleteLinkObserver();
});
function attachTaskWindowHandlers(table) {
  if (!table) return;
  
  console.log('Attaching task window handlers for table:', table.id);
  
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const gradeCell = row.querySelector('td:nth-child(3)');
    if (!gradeCell) return;
    
    const newGradeCell = gradeCell.cloneNode(true);
    if (gradeCell.parentNode) {
      gradeCell.parentNode.replaceChild(newGradeCell, gradeCell);
    }
    
    newGradeCell.style.cursor = 'pointer';
    newGradeCell.classList.add('task-clickable');
    
    newGradeCell.setAttribute('data-has-task-event', 'true');
    
    newGradeCell.addEventListener('click', () => {
      showTaskGradesEditor(newGradeCell);
    });
  });
}

const addStudentButton = document.getElementById("addStudent");
addStudentButton.addEventListener("click", function () {
  const visibleContainer = document.querySelector(".table-container[style*='display: block']");
  const table = visibleContainer ? visibleContainer.querySelector("table") : null;
  
  if (!table) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select a track first!',
    });
    return;
  }

  // 1. Get Basic Total from existing students to match
  const existingRows = table.querySelectorAll("tbody tr");
  let basicTotalValue = 250; // Default value if no students exist
  
  if (existingRows.length > 0) {
    for (let i = 0; i < existingRows.length; i++) {
      const row = existingRows[i];
      if (row.children.length >= 5) {
        const bt = Number(row.children[4]?.textContent.trim() || 0);
        if (bt > 0) {
          basicTotalValue = bt;
          break;
        }
      }
    }
  }
  
  console.log('Using Basic Total value for new student:', basicTotalValue);
  
  const tbody = table.querySelector("tbody");
  const newRow = document.createElement("tr");

  // Create cells for the new row
  const idCell = document.createElement("td");
  idCell.textContent = "Auto"; // Placeholder for auto-generated ID
  idCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";
  idCell.style.backgroundColor = "red"; // Default color for new student
  idCell.style.color = "white";

  const nameCell = document.createElement("td");
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Enter student name";
  nameInput.className = "w-full bg-transparent text-inherit border border-blue-300 px-1 rounded";
  nameCell.appendChild(nameInput);
  nameCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const degreesCell = document.createElement("td");
  degreesCell.textContent = 0; // Default value
  degreesCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 task-clickable";
  degreesCell.style.cursor = "pointer";

  const additionalCell = document.createElement("td");
  additionalCell.textContent = 0; // Default value
  additionalCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const basicTotalCell = document.createElement("td");
  basicTotalCell.textContent = basicTotalValue; // Use the same Basic Total as other students
  basicTotalCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const totalDegreesCell = document.createElement("td");
  totalDegreesCell.textContent = 0; // Default value
  totalDegreesCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const commentsCell = document.createElement("td");
  commentsCell.textContent = "No comments"; // Default value
  commentsCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";
  
  // Create status cell (before ranking)
  const statusCell = document.createElement("td");
  statusCell.className = "student-status-cell sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";
  statusCell.setAttribute('data-track-name', table.id);
  
  // Create status select with default 'Pending'
  const statusSelect = document.createElement("select");
  statusSelect.className = "status-select form-select w-full border-2 border-yellow-400 p-1 rounded";
  statusSelect.setAttribute('data-current-status', 'Pending');
  
  // Status options
  ['Pending', 'Accepted', 'Rejected', 'In Progress'].forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    if (status === 'Pending') option.selected = true;
    statusSelect.appendChild(option);
  });
  
  statusCell.appendChild(statusSelect);

  const rankingCell = document.createElement("td");
  rankingCell.textContent = "-"; // Placeholder for ranking
  rankingCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const deleteCell = document.createElement("td");
  const deleteButton = document.createElement("img");
  deleteButton.src = "/Photo/delete4.png";
  deleteButton.alt = "Delete";
  deleteButton.className = "delete";
  deleteCell.appendChild(deleteButton);
  deleteCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  // Append cells to the new row in correct order
  newRow.appendChild(idCell);
  newRow.appendChild(nameCell);
  newRow.appendChild(degreesCell);
  newRow.appendChild(additionalCell);
  newRow.appendChild(basicTotalCell);
  newRow.appendChild(totalDegreesCell);
  newRow.appendChild(commentsCell);
  newRow.appendChild(statusCell);   // Status comes before ranking
  newRow.appendChild(rankingCell);
  newRow.appendChild(deleteCell);

  // Append the new row to the end of the table body
  tbody.appendChild(newRow);

  // Add event listener to the delete button
  deleteButton.addEventListener("click", function () {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      newRow.remove();
    }
  });

  // Add event handler to the degrees cell for tasks
  degreesCell.addEventListener("click", function() {
    if (idCell.textContent === "Auto") {
      Swal.fire({
        title: 'Not Saved Yet',
        text: 'Please save the student first by entering a name.',
        icon: 'warning'
      });
      return;
    }
    showTaskGradesEditor(degreesCell);
  });

  // Add functionality to save the new student
  nameInput.addEventListener("blur", function () {
    const studentName = nameInput.value.trim();
    if (!studentName) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a student name!',
      });
      return;
    }

    const trackName = table.id; // Get the track name from the table ID
    
    // Show loading
    Swal.fire({
      title: 'Adding student...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    fetch(`http://127.0.0.1:3000/api/students/add-new-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trackName: trackName,
        studentName: studentName,
      }),
    })
      .then((response) => {
        console.log('API Response Status:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log("New student added - Full Response:", data);
        // تعديل في شرط التحقق من النجاح
        if (data && data.message === "Student added successfully" && data.studentId) {
          // Replace input with regular text
          nameCell.textContent = studentName;
          
          // Update cells
          idCell.textContent = data.studentId;
          
          // Update status select data attribute
          const statusSelect = newRow.querySelector('.status-select');
          if (statusSelect) {
            statusSelect.setAttribute('data-student-id', data.studentId);
          }
          
          // Close loading dialog
          Swal.close();
          
          // Success message
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student added successfully!',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            console.log('Saving current track:', trackName);
            localStorage.setItem('lastActiveTrack', trackName);
            window.location.reload();
          });
        } else {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add student!',
          });
        }
      })
      .catch(error => {
        console.error("Error adding student:", error);
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while adding the student.',
        });
      });
  });
});


const addTaskButton = document.getElementById("addTask");
addTaskButton.addEventListener("click", function () {
  // Get the currently visible table container
  const visibleContainer = document.querySelector(".table-container[style*='display: block']");
  const table = visibleContainer ? visibleContainer.querySelector("table") : null;
  
  if (!table) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select a track first!',
    });
    return;
  }

  Swal.fire({
    title: false,
    html: `
      <div class="task-form-container">
        <div class="task-form-header">
          <h2>Add New Task</h2>
          <p class="task-form-subheader">Enter task details and required questions</p>
        </div>
        
        <div class="task-form-body">
          <div class="task-form-group">
            <label for="taskName">Task Name</label>
            <div class="task-input-wrapper">
              <input type="text" id="taskName" class="task-input" placeholder="Enter task name">
              <div class="task-input-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
            </div>
          </div>
          
          <div class="task-form-group">
            <label for="taskGrade">Maximum Grade</label>
            <div class="task-input-wrapper">
              <input type="number" id="taskGrade" class="task-input" placeholder="Enter maximum grade">
              <div class="task-input-icon grade-icon">
                <i class="fas fa-award"></i>
              </div>
            </div>
          </div>
          
          <div class="task-form-group questions-group">
            <div class="questions-header">
              <label>Questions</label>
              <span class="questions-helper">Add at least one question</span>
            </div>
            
            <div id="questionsContainer" class="questions-container">
              <div class="question-item">
                <div class="question-input-wrapper">
                  <textarea class="question-input" placeholder="Enter question text"></textarea>
                  <div class="question-input-icon">
                    <i class="fas fa-question"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="button" id="addQuestionBtn" class="add-question-btn">
              <i class="fas fa-plus-circle"></i>
              <span>Add Another Question</span>
            </button>
          </div>
        </div>
        
        <div class="task-form-actions">
          <button type="button" id="confirmTaskBtn" class="confirm-task-btn">
            <i class="fas fa-check"></i>
            <span>Add Task</span>
          </button>
          <button type="button" id="cancelTaskBtn" class="cancel-task-btn">
            <i class="fas fa-times"></i>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    showCloseButton: false,
    width: '550px',
    background: '#f8f9fa',
    backdrop: 'rgba(0,0,0,0.6)',
    allowOutsideClick: false,
    allowEscapeKey: true,
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    },
    padding: 0,
    
    didOpen: () => {
      // Add FontAwesome if not already included
      if (!document.querySelector('link[href*="fontawesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
      }
      
      // Add Animate.css if not already included
      if (!document.querySelector('link[href*="animate.css"]')) {
        const animateCSS = document.createElement('link');
        animateCSS.rel = 'stylesheet';
        animateCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(animateCSS);
      }
      
      // Add custom styles with RTL support and modern design
      const style = document.createElement('style');
      style.textContent = `
        .task-form-container {
          font-family: 'Poppins', 'Segoe UI', Tahoma, sans-serif;
          direction: ltr;
          text-align: left;
          color: #333;
        }
        
        .task-form-header {
          background: linear-gradient(135deg, #4a6cf7, #2851e3);
          color: white;
          padding: 20px 25px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        
        .task-form-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          margin-bottom: 5px;
        }
        
        .task-form-subheader {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }
        
        .task-form-body {
          padding: 25px;
          background: white;
        }
        
        .task-form-group {
          margin-bottom: 20px;
        }
        
        .task-form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #444;
        }
        
        .task-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .task-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f8fafc;
        }
        
        .task-input:focus {
          outline: none;
          border-color: #4a6cf7;
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
          background: white;
        }
        
        .task-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #4a6cf7;
          font-size: 16px;
        }
        
        .grade-icon {
          color: #f59e0b;
        }
        
        .questions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .questions-helper {
          font-size: 12px;
          color: #6b7280;
        }
        
        .questions-container {
          max-height: 250px;
          overflow-y: auto;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          background: #f8fafc;
          margin-bottom: 10px;
        }
        
        .question-item {
          margin-bottom: 12px;
          position: relative;
        }
        
        .question-item:last-child {
          margin-bottom: 0;
        }
        
        .question-input-wrapper {
          position: relative;
          display: flex;
        }
        
        .question-input {
          width: 100%;
          min-height: 80px;
          padding: 12px 15px 12px 45px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          resize: vertical;
          background: white;
        }
        
        .question-input:focus {
          outline: none;
          border-color: #4a6cf7;
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
        }
        
        .question-input-icon {
          position: absolute;
          left: 15px;
          top: 15px;
          color: #4a6cf7;
          font-size: 16px;
        }
        
        .question-actions {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          gap: 5px;
        }
        
        .remove-question-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .remove-question-btn:hover {
          background: #fecaca;
          transform: scale(1.05);
        }
        
        .add-question-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a6cf7;
          background: none;
          border: none;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
        }
        
        .add-question-btn:hover {
          background: #eff6ff;
        }
        
        .task-form-actions {
          display: flex;
          gap: 10px;
          padding: 20px 25px;
          background: #f1f5f9;
          border-top: 1px solid #e2e8f0;
          border-radius: 0 0 10px 10px;
        }
        
        .confirm-task-btn, .cancel-task-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .confirm-task-btn {
          background: #4a6cf7;
          color: white;
          flex: 1;
        }
        
        .confirm-task-btn:hover {
          background: #2851e3;
        }
        
        .cancel-task-btn {
          background: #e2e8f0;
          color: #64748b;
        }
        
        .cancel-task-btn:hover {
          background: #cbd5e1;
        }
        
        .with-remove {
          padding-right: 40px;
        }
      `;
      document.head.appendChild(style);
      
      // Load Poppins font for modern UI
      if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Poppins"]')) {
        const poppinsFont = document.createElement('link');
        poppinsFont.rel = 'stylesheet';
        poppinsFont.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
        document.head.appendChild(poppinsFont);
      }
      
      // Add event listener to confirm button
      document.getElementById('confirmTaskBtn').addEventListener('click', function() {
        // Trigger preConfirm manually
        const taskName = document.getElementById('taskName').value;
        const taskGrade = document.getElementById('taskGrade').value;
        const questionInputs = document.querySelectorAll('.question-input');
        const questions = Array.from(questionInputs).map(input => input.value.trim());
        
        // Validate inputs
        if (!taskName || !taskGrade) {
          Swal.showValidationMessage('Please fill all required fields');
          return;
        }
        
        if (isNaN(taskGrade)) {
          Swal.showValidationMessage('Grade must be a number');
          return;
        }
        
        if (questions.length === 0 || questions.some(q => q === '')) {
          Swal.showValidationMessage('Please add at least one question');
          return;
        }
        
        // Simulate clicking the confirm button
        Swal.clickConfirm();
      });
      
      // Add event listener to cancel button
      document.getElementById('cancelTaskBtn').addEventListener('click', function() {
        Swal.close();
      });
      
      // Add event listener to the "Add Another Question" button
      document.getElementById('addQuestionBtn').addEventListener('click', function() {
        const questionsContainer = document.getElementById('questionsContainer');
        const newQuestion = document.createElement('div');
        newQuestion.className = 'question-item animate__animated animate__fadeIn';
        newQuestion.innerHTML = `
          <div class="question-input-wrapper">
            <textarea class="question-input with-remove" placeholder="Enter question text"></textarea>
            <div class="question-input-icon">
              <i class="fas fa-question"></i>
            </div>
            <div class="question-actions">
              <button type="button" class="remove-question-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `;
        questionsContainer.appendChild(newQuestion);
        
        // Auto-focus the new input
        setTimeout(() => {
          newQuestion.querySelector('.question-input').focus();
        }, 100);
        
        // Add event listener to the remove button
        newQuestion.querySelector('.remove-question-btn').addEventListener('click', function() {
          newQuestion.classList.add('animate__fadeOut');
          setTimeout(() => {
            questionsContainer.removeChild(newQuestion);
          }, 300);
        });
      });
      
      // Add keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        if (Swal.isVisible()) {
          // Ctrl+Enter to add new question
          if (e.ctrlKey && e.key === 'Enter') {
            document.getElementById('addQuestionBtn').click();
          }
          // Escape to cancel
          else if (e.key === 'Escape') {
            document.getElementById('cancelTaskBtn').click();
          }
        }
      });
    },
    preConfirm: () => {
      const taskName = document.getElementById('taskName').value
      const taskGrade = document.getElementById('taskGrade').value
      const trackName = table.id
      
      // Get all questions
      const questionInputs = document.querySelectorAll('.question-input')
      const questionsArray = Array.from(questionInputs).map(input => input.value.trim())
      
      // Make sure we only have valid questions (non-empty strings)
      const validQuestions = questionsArray.filter(q => q.trim() !== '')
      
      // Validate that we have at least one question
      if (validQuestions.length === 0) {
        Swal.showValidationMessage('Please add at least one question')
        return false
      }
      
      return { 
        taskName: taskName.trim(), 
        taskGrade: Number(taskGrade), 
        trackName: trackName.trim(),
        // Send the questions as an array - controller will handle it
        questions: validQuestions
      }
    }
  }).then((result) => {
    console.log(result.value.trackName)
    if (result.isConfirmed) {
      // Log the payload for debugging
      console.log('Task payload:', {
        taskName: result.value.taskName,
        taskGrade: result.value.taskGrade,
        questions: result.value.questions // This is now a JSON string containing all question texts
      });
      
      // Show loading state
      Swal.fire({
        title: 'Adding Task...',
        html: '<div class="loading-spinner"></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      fetch(`http://127.0.0.1:3000/api/tracks/update-track/add-task/${result.value.trackName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskName: result.value.taskName,
          taskGrade: result.value.taskGrade,
          questions: result.value.questions // Sending the question texts as a JSON string
        })
      })
        .then(response => {
          if (response.ok) {
            const newTaskGrade = result.value.taskGrade;
          const tbody = table.querySelector('tbody');
          tbody.querySelectorAll('tr').forEach(row => {
            if (!row.textContent.includes('No students')) {
              const basicTotalCell = row.children[4]; 
              const currentTotal = parseInt(basicTotalCell.textContent) || 0;
              basicTotalCell.textContent = currentTotal + newTaskGrade;
            }
          });
          updateTableData(table);
            Swal.fire({
              icon: 'success',
              title: 'Task Added!',
              text: 'New task has been created successfully',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'task-success-popup',
                title: 'arabic-title',
                confirmButton: 'arabic-button'
              }
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed to Add Task',
              text: 'Failed to add task!',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'task-error-popup',
                title: 'arabic-title',
                confirmButton: 'arabic-button'
              }
            })
          }
        })
        .catch(error => {
          console.error('Error:', error)
          Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Failed to connect to server',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'task-error-popup',
              title: 'arabic-title',
              confirmButton: 'arabic-button'
            }
          })
        })
    }
  })
})