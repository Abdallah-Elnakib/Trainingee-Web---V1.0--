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
    for (const changeDisplay of getTracks) {
      document.getElementById(changeDisplay.innerText).style.display = 'none';
    }
    document.getElementById(track.innerText).style.display = 'block';
    document.getElementsByClassName('flex items-center text-3xl text-gray-900 dark:text-white')[0].innerText = track.innerText;
  })
}
document.addEventListener("DOMContentLoaded", () => {
  const tableCells = document.querySelectorAll("td");

  tableCells.forEach(cell => {
    cell.addEventListener("dblclick", () => {
      const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
      const editableFields = [1, 2, 3, 6, 4];
      if (columnIndex === 8) return;
      if (!editableFields.includes(columnIndex)) {
        Swal.fire({
          icon: 'info',
          title: 'Not Editable',
          text: 'You can only edit the Name, Degrees, Additional, or Comments fields.',
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

  // Remove rows with the placeholder message "No students in this track"
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
  // Get the currently visible table
  const table = document.querySelector("table[style='display: block;']");
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
  const table = document.querySelector("table[style='display: block;']");
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