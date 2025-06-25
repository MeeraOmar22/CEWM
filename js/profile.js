import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, updateEmail } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const fName = document.getElementById('profileFirstName');
  const lName = document.getElementById('profileLastName');
  const email = document.getElementById('profileEmail');
  const saveBtn = document.getElementById('saveProfileBtn');

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        fName.value = data.firstName || '';
        lName.value = data.lastName || '';
        email.value = data.email || '';
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  });

  saveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        firstName: fName.value,
        lastName: lName.value,
        email: email.value
      });
      if (user.email !== email.value) {
        await updateEmail(user, email.value);
      }
      alert('Profile updated');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Unable to update profile');
    }
  });
});
