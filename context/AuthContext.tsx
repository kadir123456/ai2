import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set, onValue, off, update, increment } from 'firebase/database';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  balance: number | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
  decrementBalance: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const TRIAL_CREDITS = 3;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const balanceRef = ref(db, `users/${currentUser.uid}/credits`);
      onValue(balanceRef, (snapshot) => {
        const data = snapshot.val();
        setBalance(data !== null ? data : 0);
      });

      return () => {
        off(balanceRef);
        setBalance(null);
      };
    }
  }, [currentUser]);
  
  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await set(ref(db, `users/${user.uid}`), {
      email: user.email,
      credits: TRIAL_CREDITS,
      createdAt: new Date().toISOString(),
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const logout = async () => {
    await signOut(auth);
  };

  const updateBalance = async (newBalance: number) => {
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);
      await update(userRef, { credits: newBalance });
    }
  };

  const decrementBalance = async () => {
    if (currentUser) {
        const creditsRef = ref(db, `users/${currentUser.uid}/credits`);
        await set(creditsRef, increment(-1));
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    loading,
    balance,
    register,
    login,
    logout,
    updateBalance,
    decrementBalance,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};