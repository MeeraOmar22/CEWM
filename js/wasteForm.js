import { auth, db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Get the form element
const wasteForm = document.getElementById("wasteForm");
const addButton = document.getElementById("AddBtn");
const retrieveButton = document.getElementById("RetrieveBtn");
const updateButton = document.getElementById("UpdateBtn");
const deleteButton = document.getElementById("DeleteBtn");

addButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form from submitting normally

    // Get values from the form
    const wasteType = document.getElementById("TypeInp").value;
    const wasteCondition = document.querySelector('input[name="condition"]:checked')?.value;
    const wasteWeight = document.getElementById("WeightInp").value;
    const storageLocation = document.getElementById("LocationInp").value;
    const dateOfSubmission = document.getElementById("DateInp").value;
    const additionalComments = document.getElementById("CommentsInp").value;

    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Create a unique identifier
    const identifier = `${wasteType}_${dateOfSubmission}_${timestamp}`;

    // Ensure all required fields are filled in
    if (!wasteType || !wasteCondition || !wasteWeight || !storageLocation || !dateOfSubmission) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            console.log("User not authenticated.");
            return;
        }

        const userName = user.displayName || "Anonymous";

        // Add document to Firestore
        const docRef = await addDoc(collection(db, "wasteForm"), {
            identifier, // Include the unique identifier
            userId: user.uid,
            userName: userName,
            wasteType,
            wasteCondition,
            wasteWeight,
            storageLocation,
            dateOfSubmission,
            additionalComments,
            createdAt: new Date(),
        });

        console.log("Document written with ID: ", docRef.id);
        alert("Waste data has been added successfully!");
        wasteForm.reset(); // Reset the form after submission
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error adding waste data.");
    }
});

// Retrieve waste data based on user
retrieveButton.addEventListener("click", async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log("User not authenticated.");
            return;
        }

        const wasteType = prompt("Enter the Waste Type:");
        const dateOfSubmission = prompt("Enter the Date of Submission (YYYY-MM-DD):");

        if (!wasteType || !dateOfSubmission) {
            alert("Both Waste Type and Date of Submission are required.");
            return;
        }

        // Query the collection by matching the unique identifier
        const uniqueIdentifier = `${wasteType}_${dateOfSubmission}`;
        const q = query(collection(db, "wasteForm"), where("identifier", ">=", uniqueIdentifier), where("identifier", "<=", `${uniqueIdentifier}\uf8ff`));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("No data found for the specified criteria.");
            return;
        }

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    } catch (error) {
        console.error("Error retrieving data: ", error);
    }
});


// Update waste data by ID
updateButton.addEventListener("click", async () => {
    const wasteId = prompt("Enter the ID of the waste document to update:");

    if (!wasteId) {
        alert("No ID provided.");
        return;
    }

    try {
        const docRef = doc(db, "wasteForm", wasteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const newWasteWeight = prompt("Enter new waste weight (in kg):", docSnap.data().wasteWeight);
            await updateDoc(docRef, {
                wasteWeight: newWasteWeight,
            });

            alert("Data updated successfully!");
        } else {
            alert("No document found with that ID.");
        }
    } catch (error) {
        console.error("Error updating document: ", error);
    }
});

// Delete waste data by ID
deleteButton.addEventListener("click", async () => {
    const wasteId = prompt("Enter the ID of the waste document to delete:");

    if (!wasteId) {
        alert("No ID provided.");
        return;
    }

    try {
        const docRef = doc(db, "wasteForm", wasteId);
        await deleteDoc(docRef);
        alert("Document deleted successfully!");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
});
