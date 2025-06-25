// ✅ FINAL WORKING CODE for retrievePage.js — NO FILTERING ISSUE, CHART WORKING

import { fetchWasteForms, deleteWasteForm, updateWasteForm } from "./firebaseretrieve.js";

let chartInstance = null;

async function loadWasteForms() {
    const loader = document.getElementById("loading");
    loader.style.display = "block";

    try {
        const wasteForms = await fetchWasteForms();
        loader.style.display = "none";

        console.log("✅ Waste data fetched:", wasteForms);
        displayWasteForms(wasteForms);
        updateSummaryCards(wasteForms);
        renderChart(wasteForms);
        renderPieChart(wasteForms);    // new pie chart
        renderLineChart(wasteForms); // ← add this
    
    } catch (error) {
        console.error("🚨 Failed to load waste forms:", error);
        loader.style.display = "none";
    }
}

function displayWasteForms(wasteForms) {
    const tableBody = document.getElementById("wasteFormsTableBody");
    tableBody.innerHTML = "";

    wasteForms.forEach((form) => {
        const row = document.createElement("tr");
        row.dataset.id = form.id;

        // 🔍 Debug-safe normalization of condition
        const conditionRaw = form.wasteCondition || "";
        const condition = conditionRaw.trim().toLowerCase();

        console.log(`🧪 Condition Debug | Raw: "${conditionRaw}" → Normalized: "${condition}"`);

        // ✅ Add conditional styling
        if (condition === "reusable") row.classList.add("condition-reusable");
        else if (condition === "flawed") row.classList.add("condition-flawed");

        row.innerHTML = `
            <td contenteditable="true" data-field="wasteType">${form.wasteType}</td>
            <td contenteditable="true" data-field="wasteCondition">${form.wasteCondition}</td>
            <td contenteditable="true" data-field="wasteWeight">${form.wasteWeight}</td>
            <td contenteditable="true" data-field="storageLocation">${form.storageLocation}</td>
            <td contenteditable="true" data-field="dateOfSubmission">${form.dateOfSubmission}</td>
            <td contenteditable="true" data-field="additionalComments">${form.additionalComments || "-"}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="updateRow(this)">Update</button>
                    <button onclick="deleteRow('${form.id}', this)">Delete</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    if (wasteForms.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No data available</td></tr>`;
    }
}


function updateSummaryCards(data) {
    const totalWeight = data.reduce((sum, d) => sum + parseFloat(d.wasteWeight || 0), 0);
    const total = data.length;
    const topType = Object.entries(data.reduce((acc, d) => {
        acc[d.wasteType] = (acc[d.wasteType] || 0) + 1;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    document.getElementById("total-submissions").innerText = total;
    document.getElementById("total-weight").innerText = `${totalWeight.toFixed(2)} kg`;
    document.getElementById("top-type").innerText = topType;
}

function renderChart(data) {
    const ctx = document.getElementById("wasteChart").getContext("2d");
    if (!ctx || !data || data.length === 0) return;

    const wasteData = data.reduce((acc, item) => {
        const type = item.wasteType || "Unknown";
        const weight = parseFloat(item.wasteWeight || 0);
        acc[type] = (acc[type] || 0) + weight;
        return acc;
    }, {});

    const labels = Object.keys(wasteData);
    const values = Object.values(wasteData);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Waste Weight (kg)",
                data: values,
                backgroundColor: '#3b5998',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Waste Weight by Type" }
            }
        }
    });
}

let pieChartInstance;

function renderPieChart(data) {
    if (!data || data.length === 0) return;

    // Count waste types
    const typeCounts = data.reduce((acc, item) => {
        const type = item.wasteType || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(typeCounts);
    const values = Object.values(typeCounts);

    const ctx = document.getElementById("wastePieChart")?.getContext("2d");
    if (!ctx) return;

    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ["#3b5998", "#8b9dc3", "#f4b400", "#db4437", "#0f9d58", "#ff7043"],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "right" },
                title: {
                    display: true,
                    text: "Waste Type Distribution"
                }
            }
        }
    });
}

let lineChartInstance;

function renderLineChart(data) {
    if (!data || data.length === 0) return;

    // Group total weight by submission date
    const dateMap = {};
    data.forEach(item => {
        const date = item.dateOfSubmission;
        const weight = parseFloat(item.wasteWeight || 0);
        if (!date) return;
        dateMap[date] = (dateMap[date] || 0) + weight;
    });

    const sortedDates = Object.keys(dateMap).sort();
    const weights = sortedDates.map(date => dateMap[date]);

    const ctx = document.getElementById("wasteLineChart")?.getContext("2d");
    if (!ctx) return;

    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Total Waste Weight (kg)',
                data: weights,
                borderColor: '#3b5998',
                backgroundColor: 'rgba(59,89,152,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#3b5998',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: 'Waste Trend by Date'
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Date' }
                },
                y: {
                    title: { display: true, text: 'Weight (kg)' },
                    beginAtZero: true
                }
            }
        }
    });
}


window.updateRow = async function (button) {
    const row = button.closest("tr");
    const id = row.dataset.id;
    if (!id) return alert("Missing document ID.");

    const updatedData = {};
    row.querySelectorAll("[contenteditable]").forEach(cell => {
        updatedData[cell.dataset.field] = cell.textContent.trim();
    });

    try {
        await updateWasteForm(id, updatedData);
        alert("Row updated successfully.");
    } catch (error) {
        console.error("❌ Update failed:", error);
        alert("Failed to update data.");
    }
};

window.deleteRow = async function (id, button) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
        await deleteWasteForm(id);
        button.closest("tr").remove();
        alert("Record deleted.");
    } catch (error) {
        console.error("❌ Delete error:", error);
        alert("Delete failed.");
    }
};

window.applyFilters = async function () {
    const searchText = document.getElementById("searchText").value.toLowerCase();
    const wasteType = document.getElementById("filterWasteType").value;
    const wasteCondition = document.getElementById("filterCondition").value;

    let wasteForms = await fetchWasteForms(); // No filtering on fetch

    // Manual filtering
    wasteForms = wasteForms.filter(form => {
        const matchType = !wasteType || form.wasteType === wasteType;
        const matchCond = !wasteCondition || form.wasteCondition === wasteCondition;
        return matchType && matchCond;
    });

    if (searchText) {
        wasteForms = wasteForms.filter(form =>
            Object.values(form).join(" ").toLowerCase().includes(searchText)
        );
    }

    displayWasteForms(wasteForms);
    updateSummaryCards(wasteForms);
    renderChart(wasteForms);
};

document.addEventListener("DOMContentLoaded", loadWasteForms);