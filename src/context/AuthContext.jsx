
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Stop listening when the provider unmounts
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    logout: logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
