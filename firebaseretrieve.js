import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

// Initialize Firestore
const db = getFirestore(app);

(async function testFirestoreConnection() {
    try {
        const wasteFormCollection = collection(db, "wasteForm");
        const querySnapshot = await getDocs(wasteFormCollection);

        querySnapshot.forEach((doc) => {
            console.log("Document:", doc.id, "=>", doc.data());
        });

        console.log("Firestore connection successful.");
    } catch (error) {
        console.error("Firestore connection failed:", error);
    }
});

/**
 * Fetch waste form data from Firestore.
 * @param {Object} filters - Optional filters for querying data.
 * @returns {Promise<Array>} - Array of waste form documents.
 */
export async function fetchWasteForms(filters = {}) {
    try {
        const wasteFormCollection = collection(db, "wasteForm");
        const querySnapshot = await getDocs(wasteFormCollection);

        const wasteForms = [];
        querySnapshot.forEach((doc) => {
            wasteForms.push({ id: doc.id, ...doc.data() });
        });

        // Apply client-side filters
        return wasteForms.filter((form) => {
            const matchesWasteType =
                !filters.wasteType || form.wasteType.toLowerCase() === filters.wasteType.toLowerCase();
            const matchesCondition =
                !filters.wasteCondition || form.wasteCondition === filters.wasteCondition;

            return matchesWasteType && matchesCondition;
        });
    } catch (error) {
        console.error("Error fetching waste forms:", error);
        return [];
    }
}

/**
 * Delete a waste form by ID.
 * @param {string} id - Document ID to delete.
 */
export async function deleteWasteForm(id) {
    try {
        console.log("Attempting to delete document with ID:", id); // Debug log
        const docRef = doc(db, "wasteForm", id);
        await deleteDoc(docRef);
        console.log("Document deleted successfully:", id);
    } catch (error) {
        console.error("Error deleting waste form:", error.message);
        throw error;
    }
}


/**
 * Update a waste form by ID.
 * @param {string} id - Document ID to update.
 * @param {Object} updatedData - New data for the document.
 */
export async function updateWasteForm(id, updatedData) {
    try {
        console.log("Updating document with ID:", id, "with data:", updatedData); // Debug log

        // Ensure the ID is being passed correctly
        if (!id) {
            throw new Error("Document ID is required to perform an update.");
        }

        // Reference the specific document in the Firestore collection
        const docRef = doc(db, "wasteForm", id);

        // Update only the fields provided in updatedData
        await updateDoc(docRef, updatedData);

        console.log("Document updated successfully:", id);
    } catch (error) {
        console.error("Error updating waste form:", error.message);
        throw error;
    }
}
