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

document.addEventListener("DOMContentLoaded", () => {
  setupStudentSearch();
  setupStudentStatusHandlers();
  const tableCells = document.querySelectorAll("td");

  tableCells.forEach(cell => {
    cell.addEventListener("dblclick", () => {
      const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
      const editableFields = [1, 3, 6]; 
      
      if (columnIndex === 2) {
        showTaskGradesEditor(cell);
        return;
      }
      
      if (columnIndex === 8) return;
      
      if (!editableFields.includes(columnIndex)) {
        Swal.fire({
          icon: 'info',
          title: 'Not Editable',
          text: 'You can only edit the Name, Additional, or Comments fields directly.',
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
});

function showTaskGradesEditor(cell) {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  const trackName = table.id;
  const studentId = Number(row.children[0].textContent.trim());
  
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

document.addEventListener('DOMContentLoaded', function() {
  setupStudentStatusHandlers();
});

function updateCell(cell, newValue) {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  const trackName = table.id;
  const studentId = row.children[0].textContent.trim();
  const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
  const fieldMap = ["ID", "Name", "Degrees", "Additional", "BasicTotal", "TotalDegrees", "Comments", "Ranking"];
  const fieldName = fieldMap[columnIndex];

  if (fieldName === 'Degrees' || fieldName === "Additional" || fieldName === "BasicTotal") {
    newValue = Number(newValue);
  }

  console.log(`Table ID: ${trackName}, Student ID: ${studentId}, Field: ${fieldName}, New Value: ${newValue}`);

  fetch(`http://127.0.0.1:3000/api/students/update-student-data/${trackName}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'studentId': Number(studentId),
      'field': fieldName,
      'newValue': newValue
    })
  }).then(res => {
    if (res.status === 200) {
      updateTableData(table);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update cell!',
      });
    }
  });
}

function updateTableData(table) {
  const rowsCheck = Array.from(table.querySelectorAll("tbody tr"));

  rowsCheck.forEach(row => {
    const firstCell = row.querySelector("td");
    if (firstCell && firstCell.textContent.trim() === "No students in this track.") {
      row.remove();
    }
  });

  const rows = Array.from(table.querySelectorAll("tbody tr"));
  rows.forEach(row => {
    const degrees = Number(row.children[2].textContent.trim());
    const additional = Number(row.children[3].textContent.trim());
    const basicTotal = Number(row.children[4].textContent.trim());
    const totalDegrees = degrees + additional;

    // Update TotalDegrees cell
    row.children[5].textContent = totalDegrees;

    // Change color based on condition
    if (degrees < basicTotal * 0.85 && degrees < basicTotal * 0.75) {
      row.children[0].style.backgroundColor = "red";
      row.children[0].style.color = "white";
    } else if (degrees < basicTotal * 0.85 && degrees >= basicTotal * 0.75) {
      row.children[0].style.backgroundColor = "rgb(209, 192, 67)";
      row.children[0].style.color = "white";
    } else {
      row.children[0].style.backgroundColor = "green";
      row.children[0].style.color = "white";
    }
  });

  // Sort rows by TotalDegrees in descending order
  rows.sort((a, b) => {
    const totalA = Number(a.children[5]?.textContent.trim() || 0);
    const totalB = Number(b.children[5]?.textContent.trim() || 0);
    return totalB - totalA;
  });

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = ""; // Clear existing rows
  rows.forEach((row, index) => {
    // Ensure the row has enough cells before updating the ranking
    if (row.children.length >= 8) {
      row.children[7].textContent = index + 1; // Update ranking
    }
    tbody.appendChild(row); // Append sorted row
  });
}

// Delete student button
const deleteButtons = document.getElementsByClassName("m:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 md:table-cell hidden delete");
for (const deleteButton of deleteButtons) {
  deleteButton.addEventListener("click", function () {
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
        const row = deleteButton.closest("tr");
        const table = deleteButton.closest("table");

        const trackName = table.id;
        const studentId = row.children[0].textContent.trim();

        console.log(`Track Name: ${trackName}, Student ID: ${studentId}`);

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
  });
}

// Add New addStudent

const addStudentButton = document.getElementById("addStudent");
addStudentButton.addEventListener("click", function () {
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

  const tbody = table.querySelector("tbody");
  const newRow = document.createElement("tr");

  // Create cells for the new row
  const idCell = document.createElement("td");
  idCell.textContent = "Auto"; // Placeholder for auto-generated ID
  idCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const nameCell = document.createElement("td");
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Enter student name";
  nameInput.className = "w-full bg-transparent text-inherit border border-blue-300 px-1 rounded";
  nameCell.appendChild(nameInput);
  nameCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const degreesCell = document.createElement("td");
  degreesCell.textContent = 0; // Default value
  degreesCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const additionalCell = document.createElement("td");
  additionalCell.textContent = 0; // Default value
  additionalCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const basicTotalCell = document.createElement("td");
  basicTotalCell.textContent = 0; // Default value
  basicTotalCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const totalDegreesCell = document.createElement("td");
  totalDegreesCell.textContent = 0; // Default value
  totalDegreesCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const commentsCell = document.createElement("td");
  commentsCell.textContent = "No comments"; // Default value
  commentsCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const rankingCell = document.createElement("td");
  rankingCell.textContent = "-"; // Placeholder for ranking
  rankingCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  const deleteCell = document.createElement("td");
  const deleteButton = document.createElement("img");
  deleteButton.src = "/Photo/delete4.png";
  deleteButton.alt = "Delete";
  deleteButton.className = "delete";
  deleteCell.appendChild(deleteButton);
  deleteCell.className = "m:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

  // Append cells to the new row
  newRow.appendChild(idCell);
  newRow.appendChild(nameCell);
  newRow.appendChild(degreesCell);
  newRow.appendChild(additionalCell);
  newRow.appendChild(basicTotalCell);
  newRow.appendChild(totalDegreesCell);
  newRow.appendChild(commentsCell);
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
    fetch(`http://127.0.0.1:3000/api/students/add-new-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        trackName: trackName,
        studentName: studentName
      })
    }).then(res => {
      if (res.status === 201) {
        res.json().then(data => {
          if (data) {
            console.log(`Student added: ${data.studentId}, `, data);
            idCell.textContent = data.studentId;

            nameCell.innerHTML = `<div class="flex items-center">${studentName}</div>`;
            nameCell.className = "sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800";

            nameInput.disabled = true;
            updateTableData(table);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to add student!',
            });
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add student!',
        });
      }
    })
      .catch(error => {
        console.error("Error adding student:", error);
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