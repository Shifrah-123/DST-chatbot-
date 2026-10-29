
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebase/config';

// Register a new user
export async function registerUser(displayName, email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName });

    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      email: user.email,
      photoURL: null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // If profile creation fails, don't leave an untracked account.
    await user.delete().catch(() => {});
    throw error;
  }

  return user;
}

// Sign in an existing user
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
}

// Sign out the current user
export async function logoutUser() {
  await signOut(auth);
}
