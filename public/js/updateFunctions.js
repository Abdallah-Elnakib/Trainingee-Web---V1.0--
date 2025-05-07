// Function to update a single row's data without affecting other rows
function updateRowDataOnly(row, studentId) {
  if (!row) return;
  
  // Update calculations for this row only
  const degrees = Number(row.children[2]?.textContent.trim() || 0);
  const additional = Number(row.children[3]?.textContent.trim() || 0);
  const basicTotal = Number(row.children[4]?.textContent.trim() || 0);
  const totalDegrees = degrees + additional;

  // Update TotalDegrees cell
  if (row.children[5]) {
    row.children[5].textContent = totalDegrees;
  }

  // Update the row ID if it was "Auto"
  if (row.children[0] && row.children[0].textContent.trim() === "Auto" && studentId) {
    row.children[0].textContent = studentId;
  }

  console.log('Updated single row data for student ID:', studentId);
}

// Function to update a row's colors without affecting other rows
function updateRowColors(row) {
  if (!row || !row.children || row.children.length < 6) return;
  
  const degrees = Number(row.children[2]?.textContent.trim() || 0);
  const basicTotal = Number(row.children[4]?.textContent.trim() || 0);
  
  // Update ID cell color based on grades
  if (row.children[0]) {
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
  }
}

// Function to sort the table rows without destroying status dropdowns
function sortTablePreservingStatus(table) {
  if (!table) return;
  
  // Save all student status values
  const statusValues = saveStudentStatusValues(table);
  
  // Get all rows and calculate their total degrees for sorting
  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  
  const rows = Array.from(tbody.querySelectorAll("tr"));
  
  // Sort rows by TotalDegrees in descending order
  rows.sort((a, b) => {
    const totalA = Number(a.children[5]?.textContent.trim() || 0);
    const totalB = Number(b.children[5]?.textContent.trim() || 0);
    return totalB - totalA;
  });
  
  // Remove rows from DOM without destroying them
  rows.forEach(row => {
    if (row.parentNode) {
      row.parentNode.removeChild(row);
    }
  });
  
  // Add rows back in the sorted order, updating ranking
  rows.forEach((row, index) => {
    // Update ranking before adding back to DOM
    if (row.children.length >= 8) {
      row.children[7].textContent = index + 1;
    }
    tbody.appendChild(row);
  });
  
  // Restore status values
  restoreStudentStatusValues(table, statusValues);
  
  console.log('Table sorted while preserving status dropdowns');
}
