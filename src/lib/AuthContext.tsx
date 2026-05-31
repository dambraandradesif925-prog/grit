import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  session: any | null; // Kept for compatibility, can be the user object or null
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkAdminRole(userId: string, email?: string | null) {
    if (email === 'chukrirookstooleu768@gmail.com') {
      setIsAdmin(true);
      return;
    }
    try {
      const roleDocRef = doc(db, 'user_roles', userId);
      const roleSnap = await getDoc(roleDocRef);
      if (roleSnap.exists() && roleSnap.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkAdminRole(currentUser.uid, currentUser.email);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err: any) {
      // Auto register first admin if not registerable or on first login
      if (email === 'chukrirookstooleu768@gmail.com' && password === '123456') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          // Set role in firestore
          await setDoc(doc(db, 'user_roles', cred.user.uid), {
            user_id: cred.user.uid,
            role: 'admin'
          });
          await setDoc(doc(db, 'profiles', cred.user.uid), {
            user_id: cred.user.uid,
            display_name: 'Administrator'
          });
          return { error: null };
        } catch (signUpErr: any) {
          return { error: signUpErr };
        }
      }
      return { error: err };
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, session: user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
