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
      fetch(`http://127.0.0.1:3000/api/students/delete-student/${trackName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'studentId': Number(studentId)
        })
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
    title: 'Add New Task',
    html: `
            <div class="space-y-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                    <input type="text" id="taskName" class="swal2-input custom-input" placeholder="Enter task name">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Task Grade</label>
                    <input type="number" id="taskGrade" class="swal2-input custom-input" placeholder="Enter maximum grade">
                </div>
            </div>
        `,
    showCancelButton: true,
    confirmButtonText: 'Add Task',
    cancelButtonText: 'Cancel',
    focusConfirm: false,
    customClass: {
      popup: 'rounded-lg',
      input: 'custom-input'
    },
    preConfirm: () => {
      const taskName = document.getElementById('taskName').value
      const taskGrade = document.getElementById('taskGrade').value
      const trackName = table.id

      if (!taskName || !taskGrade) {
        Swal.showValidationMessage('Please fill all fields')
        return false
      }

      if (isNaN(taskGrade)) {
        Swal.showValidationMessage('Grade must be a number')
        return false
      }

      return { taskName: taskName.trim(), taskGrade: Number(taskGrade), trackName: trackName.trim() }
    }
  }).then((result) => {
    console.log(result.value.trackName)
    if (result.isConfirmed) {
      fetch(`http://127.0.0.1:3000/api/tracks/update-track/add-task/${result.value.trackName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskName: result.value.taskName,
          taskGrade: result.value.taskGrade,
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
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed to Add Task',
              text: 'Failed to add task!',
            })
          }
        })
        .catch(error => {
          console.error('Error:', error)
          Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Failed to connect to server',
          })
        })
    }
  })
})