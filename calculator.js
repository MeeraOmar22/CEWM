import { db }                               from './firebase-config.js'
import { collection, addDoc, serverTimestamp } from "./firebaseretrieve.js";

async function addRecord(record) {
  try {
    const docRef = await addDoc(collection(db, 'co2eRecords'), {
      ...record,
      timestamp: serverTimestamp()
    });
    console.log('Record saved with ID:', docRef.id);
  } catch(e) {
    console.error('Error adding record:', e);
  }
}

// in your computeBtn listener, after computing:
const record = {
  shipFuel:    shipVal,
  rtgDiesel:   rtgVal,
  electricity: elecVal,
  totalCO2e:   total,
  treesEquiv:  trees,
};
addRecord(record);
// Read

import { onSnapshot, query, orderBy } from 'firebase/firestore';

const q = query(collection(db, 'co2eRecords'), orderBy('timestamp', 'desc'));
onSnapshot(q, snapshot => {
  const container = document.getElementById('recordsList');
  container.innerHTML = ''; 
  snapshot.forEach(doc => {
    const data = doc.data();
    const el = document.createElement('div');
    el.innerHTML = `
      <strong>${new Date(data.timestamp?.toDate()).toLocaleString()}</strong><br>
      Total CO₂e: ${data.totalCO2e.toFixed(2)} kg —
      Trees: ${data.treesEquiv.toFixed(1)}
      <button onclick="editRecord('${doc.id}')">✎</button>
      <button onclick="deleteRecord('${doc.id}')">🗑️</button>
    `;
    container.appendChild(el);
  });
});
// Update 
import { doc, getDoc, updateDoc } from 'firebase/firestore';

async function editRecord(id) {
  const ref = doc(db, 'co2eRecords', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert('Not found');
  const d = snap.data();
  // fill inputs:
  shipIn.value = d.shipFuel;
  rtgIn.value  = d.rtgDiesel;
  elecIn.value = d.electricity;
  // swap your Compute button to “Save Changes”:
  computeBtn.textContent = 'Save Changes';
  computeBtn.onclick = async () => {
    const updated = {
      shipFuel:    parseFloat(shipIn.value),
      rtgDiesel:   parseFloat(rtgIn.value),
      electricity: parseFloat(elecIn.value),
      totalCO2e:   parseFloat(totalDiv.textContent.split(' ')[2]),
      treesEquiv:  parseFloat(treesEqDiv.textContent.split(' ')[2]),
    };
    await updateDoc(ref, updated);
    computeBtn.textContent = 'Compute Total CO₂e';
    location.reload(); // or re-render
  };
}
//Delete 
import { deleteDoc } from 'firebase/firestore';

async function deleteRecord(id) {
  if (!confirm('Delete this entry?')) return;
  await deleteDoc(doc(db, 'co2eRecords', id));
}
