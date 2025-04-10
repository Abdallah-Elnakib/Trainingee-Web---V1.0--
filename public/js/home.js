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
            alert('Logout failed!');
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
        alert("You can only edit the Name, Degrees, Additional Or Comments fields.");
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
      alert('Failed to update cell!');
    }
  });
}

function updateTableData(table) {
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  rows.forEach(row => {
    const degrees = Number(row.children[2].textContent.trim());
    const additional = Number(row.children[3].textContent.trim());
    const basicTotal = Number(row.children[4].textContent.trim());
    const totalDegrees = degrees + additional;

    row.children[5].textContent = totalDegrees;

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

  rows.sort((a, b) => {
    const totalA = Number(a.children[5].textContent.trim());
    const totalB = Number(b.children[5].textContent.trim());
    return totalB - totalA;
  });

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = ""; 
  rows.forEach((row, index) => {
    row.children[7].textContent = index + 1; 
    tbody.appendChild(row); 
  });
}

const deleteButtons = document.getElementsByClassName("m:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 md:table-cell hidden delete");
for (const deleteButton of deleteButtons) {
    deleteButton.addEventListener("click", function () {
        const confirmDelete = confirm("Are you sure you want to delete this student?");
        if (!confirmDelete) return;
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
            } else {
                alert('Failed to delete student!');
            }
        });
    });
}