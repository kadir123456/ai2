// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set, onValue, off, runTransaction, get } from 'firebase/database';
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
  refreshBalance: () => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setCurrentUser(user);
      
      if (user) {
        const creditsRef = ref(db, `users/${user.uid}/credits`);
        try {
          const snapshot = await get(creditsRef);
          const credits = snapshot.val();
          setBalance(credits !== null ? credits : 0);
          console.log('✅ İlk bakiye yüklendi:', credits);
        } catch (error) {
          console.error('❌ İlk bakiye yükleme hatası:', error);
          setBalance(0);
        }
      } else {
        setBalance(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setBalance(null);
      return;
    }

    const creditsRef = ref(db, `users/${currentUser.uid}/credits`);
    
    const unsubscribe = onValue(creditsRef, (snapshot) => {
      const credits = snapshot.val();
      console.log('🔄 Bakiye güncellendi:', credits);
      setBalance(credits !== null ? credits : 0);
    }, (error) => {
      console.error('❌ Bakiye okuma hatası:', error);
      setBalance(0);
    });

    return () => {
      off(creditsRef);
    };
  }, [currentUser]);
  
  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await set(ref(db, `users/${user.uid}`), {
      email: user.email,
      credits: TRIAL_CREDITS,
      createdAt: new Date().toISOString(),
    });
    
    setBalance(TRIAL_CREDITS);
    console.log('✅ Kullanıcı oluşturuldu:', TRIAL_CREDITS, 'kredi');
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Giriş başarılı');
  };
  
  const logout = async () => {
    setBalance(null);
    await signOut(auth);
    console.log('✅ Çıkış yapıldı');
  };

  const updateBalance = async (newBalance: number) => {
    if (!currentUser) {
      console.error('❌ Kullanıcı oturumu yok');
      return;
    }
    
    const creditsRef = ref(db, `users/${currentUser.uid}/credits`);
    await set(creditsRef, newBalance);
    console.log('✅ Bakiye güncellendi:', newBalance);
  };

  const decrementBalance = async () => {
    if (!currentUser) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    const creditsRef = ref(db, `users/${currentUser.uid}/credits`);
    
    await runTransaction(creditsRef, (currentCredits) => {
      if (currentCredits === null) return 0;
      if (currentCredits <= 0) {
        throw new Error('Yetersiz kredi');
      }
      return currentCredits - 1;
    });
    
    console.log('✅ 1 kredi düşüldü');
  };

  const refreshBalance = async () => {
    if (!currentUser) return;
    
    const creditsRef = ref(db, `users/${currentUser.uid}/credits`);
    try {
      const snapshot = await get(creditsRef);
      const credits = snapshot.val();
      setBalance(credits !== null ? credits : 0);
      console.log('🔄 Bakiye manuel yenilendi:', credits);
    } catch (error) {
      console.error('❌ Bakiye yenileme hatası:', error);
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
    refreshBalance,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
