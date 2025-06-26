// Auto-fill date and report ID, and set up event listeners
window.addEventListener("DOMContentLoaded", () => {
  // Fill date
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("reportDate").value = today;

  // Generate Report ID (simple timestamp-based for now)
  const reportId = "REP-" + Date.now();
  document.getElementById("reportId").value = reportId;

  // Set up scope 1 listeners and add button
  setupScope1Listeners();
  setupScope2Listeners();
  setupAddButtonListener();
  
  // Initialize Firebase auth if available
  initializeFirebaseAuth();
});

// Initialize Firebase auth with error handling
async function initializeFirebaseAuth() {
  try {
    // Dynamically import Firebase modules
    const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");
    await import('./firebase-config.js');
    
    const auth = getAuth();
    
    // Auto-fill employee name from Firebase Auth
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName = user.displayName || `${user.email.split("@")[0]}`;
        document.getElementById("reportedBy").value = displayName;
      } else {
        // Not logged in
        document.getElementById("reportedBy").value = "Guest";
      }
    });
  } catch (error) {
    console.warn("Firebase auth not available:", error);
    // Set default value if Firebase is not available
    document.getElementById("reportedBy").value = "Employee";
  }
}


// Emission factors in kgCO2e per liter
const emissionFactors = {
  diesel: 2.68,
  petrol: 2.31,
  natural_gas: 2.75,
  lpg: 1.51,
  fuel_oil: 3.12,
  marine_gas_oil: 3.15,
};

function calculateScope1Emission(rowElement) {
  const fuelType = rowElement.querySelector('.fuel-type').value;
  const amount = parseFloat(rowElement.querySelector('.amount-used').value);
  const outputField = rowElement.querySelector('.emission-result');

  if (!isNaN(amount) && fuelType in emissionFactors) {
    const emission = (amount * emissionFactors[fuelType]).toFixed(2);
    outputField.value = emission;
  } else {
    outputField.value = "";
  }
  
  // Update total emissions whenever Scope 1 changes
  updateTotalEmissions();
}

function setupScope1Listeners() {
  const scope1Rows = document.querySelectorAll('.scope1-row');
  scope1Rows.forEach(row => {
    const amountInput = row.querySelector('.amount-used');
    const fuelTypeSelect = row.querySelector('.fuel-type');
    const deleteButton = row.querySelector('.delete-button');
    
    // Only add listeners if they don't already exist
    if (amountInput && !amountInput.hasAttribute('data-listener-added')) {
      amountInput.addEventListener('input', () => calculateScope1Emission(row));
      amountInput.setAttribute('data-listener-added', 'true');
    }
    
    if (fuelTypeSelect && !fuelTypeSelect.hasAttribute('data-listener-added')) {
      fuelTypeSelect.addEventListener('change', () => calculateScope1Emission(row));
      fuelTypeSelect.setAttribute('data-listener-added', 'true');
    }
    
    // Add delete button listener if it exists and doesn't already have one
    if (deleteButton && !deleteButton.hasAttribute('data-listener-added')) {
      deleteButton.addEventListener('click', () => {
        row.remove();
        updateTotalEmissions(); // Recalculate totals after deletion
      });
      deleteButton.setAttribute('data-listener-added', 'true');
    }
  });
}

function createScope1Row() {
  const row = document.createElement("div");
  row.classList.add("row-with-delete", "scope1-row");
  row.innerHTML = `
    <div class="row-fields">
      <div class="field">
        <label>Activity</label>
        <select class="activity">
          <option>Stationary Combustion</option>
          <option>Mobile Combustion</option>
        </select>
      </div>
      <div class="field">
        <label>Fuel Type</label>
        <select class="fuel-type">
          <option value="diesel">Diesel</option>
          <option value="petrol">Petrol</option>
          <option value="natural_gas">Natural Gas</option>
          <option value="lpg">LPG</option>
          <option value="fuel_oil">Fuel Oil</option>
          <option value="marine_gas_oil">Marine Gas Oil</option>
        </select>
      </div>
      <div class="field">
        <label>Amount Used (L)</label>
        <input type="number" class="amount-used" min="0">
      </div>
      <div class="field">
        <label>Emissions (kgCO2e)</label>
        <input type="text" class="emission-result" readonly value="0">
      </div>
    </div>
    <button class="delete-button" type="button" title="Delete this row">×</button>
  `;
  
  // Insert the new row before the add button
  const addButton = document.getElementById("add-scope1-row");
  const container = document.getElementById("scope1-container");
  container.insertBefore(row, addButton);
  
  // Set up event listeners for the new row
  row.querySelector('.amount-used').addEventListener('input', () => calculateScope1Emission(row));
  row.querySelector('.fuel-type').addEventListener('change', () => calculateScope1Emission(row));
  
  // Set up delete button event listener
  row.querySelector('.delete-button').addEventListener('click', () => {
    row.remove();
    updateTotalEmissions(); // Recalculate totals after deletion
  });
}

function setupAddButtonListener() {
  const addScope1RowBtn = document.getElementById("add-scope1-row");
  if (addScope1RowBtn) {
    addScope1RowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      createScope1Row();
    });
    console.log("Add button listener set up successfully");
  } else {
    console.error("Add button not found!");
  }
}

// Scope 2 emission factors (kgCO2e per kWh) for different regions in Malaysia
const scope2EmissionFactors = {
  "Port Klang (Selangor)": 0.708,
  "Penang Port (Penang)": 0.708,
  "Lumut Port (Perak)": 0.708,
  "Kuantan Port (Pahang)": 0.708,
  "Tanjung Pelepas (Johor)": 0.708,
  "Bintulu Port (Sarawak)": 0.708
};

function calculateScope2Emission() {
  const regionSelect = document.getElementById('scope2-region');
  const amountInput = document.getElementById('scope2-amount');
  const outputField = document.getElementById('scope2-result');

  const region = regionSelect.value;
  const amount = parseFloat(amountInput.value) || 0;

  if (region in scope2EmissionFactors) {
    const emission = (amount * scope2EmissionFactors[region]).toFixed(2);
    outputField.value = emission;
  } else {
    outputField.value = "0.00";
  }
  
  updateTotalEmissions();
}

function updateTotalEmissions() {
  // Calculate total Scope 1 emissions
  let totalScope1 = 0;
  const scope1Results = document.querySelectorAll('.scope1-row .emission-result');
  scope1Results.forEach(result => {
    const value = parseFloat(result.value) || 0;
    totalScope1 += value;
  });

  // Get Scope 2 emissions
  const scope2Result = document.getElementById('scope2-result');
  const totalScope2 = parseFloat(scope2Result.value) || 0;

  // Calculate total
  const grandTotal = totalScope1 + totalScope2;

  // Update the summary section
  const scope1Display = document.querySelector('.section:nth-of-type(4) .row:first-of-type .field:first-of-type input');
  const scope2Display = document.querySelector('.section:nth-of-type(4) .row:first-of-type .field:nth-of-type(2) input');
  const totalDisplay = document.querySelector('.section:nth-of-type(4) .row:first-of-type .field:nth-of-type(3) input');
  const scope1PercentDisplay = document.querySelector('.section:nth-of-type(4) .row:nth-of-type(2) .field:first-of-type input');
  const scope2PercentDisplay = document.querySelector('.section:nth-of-type(4) .row:nth-of-type(2) .field:nth-of-type(2) input');

  scope1Display.value = `${totalScope1.toFixed(2)} kgCO2e`;
  scope2Display.value = `${totalScope2.toFixed(2)} kgCO2e`;
  totalDisplay.value = `${grandTotal.toFixed(2)} kgCO2e`;

  // Calculate percentages
  if (grandTotal > 0) {
    const scope1Percent = ((totalScope1 / grandTotal) * 100).toFixed(1);
    const scope2Percent = ((totalScope2 / grandTotal) * 100).toFixed(1);
    scope1PercentDisplay.value = `${scope1Percent}%`;
    scope2PercentDisplay.value = `${scope2Percent}%`;
  } else {
    scope1PercentDisplay.value = "0%";
    scope2PercentDisplay.value = "0%";
  }
}

function setupScope2Listeners() {
  const regionSelect = document.getElementById('scope2-region');
  const amountInput = document.getElementById('scope2-amount');
  
  if (regionSelect && !regionSelect.hasAttribute('data-listener-added')) {
    regionSelect.addEventListener('change', calculateScope2Emission);
    regionSelect.setAttribute('data-listener-added', 'true');
  }
  
  if (amountInput && !amountInput.hasAttribute('data-listener-added')) {
    amountInput.addEventListener('input', calculateScope2Emission);
    amountInput.setAttribute('data-listener-added', 'true');
  }
}