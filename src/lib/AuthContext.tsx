import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    if (email && email.toLowerCase().trim() === 'chukrirookstooleu768@gmail.com') {
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
    const cleanedEmail = email.toLowerCase().trim();
    const cleanedPassword = password.trim();
    const bgPassword = `gritpwd_${cleanedEmail}`;

    try {
      // 1. Look up the profile document in Firestore by matching the email
      const q = query(collection(db, 'profiles'), where('email', '==', cleanedEmail));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const profileDoc = querySnap.docs[0];
        const profileData = profileDoc.data();

        // If the profile has a custom password configured
        if (profileData.custom_password) {
          if (profileData.custom_password === cleanedPassword) {
            // Success! The entered password matches the admin-configured password
            try {
              // Sign in with the deterministic background password
              await signInWithEmailAndPassword(auth, cleanedEmail, bgPassword);
              return { error: null };
            } catch (authErr: any) {
              // If background sign in fails (e.g. because user was registered with old auth password),
              // try to sign in with their original password, then migrate their Auth password to bgPassword!
              try {
                const cred = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
                if (cred.user) {
                  await updatePassword(cred.user, bgPassword);
                }
                return { error: null };
              } catch (origErr: any) {
                // If Auth account doesn't exist, try creating it with bgPassword
                try {
                  await createUserWithEmailAndPassword(auth, cleanedEmail, bgPassword);
                  return { error: null };
                } catch (createErr: any) {
                  return { error: authErr };
                }
              }
            }
          } else {
            // Password mismatch
            return { error: { code: 'auth/wrong-password', message: '密碼不正確' } };
          }
        }
      }

      // 2. Fallback: No profile found yet, or no custom_password configured on the profile
      try {
        const credential = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
        if (credential.user) {
          const uid = credential.user.uid;
          const profileDocSnap = await getDoc(doc(db, 'profiles', uid));
          const pData = profileDocSnap.exists() ? profileDocSnap.data() : {};
          
          await setDoc(doc(db, 'profiles', uid), {
            ...pData,
            user_id: uid,
            email: cleanedEmail,
            custom_password: cleanedPassword
          }, { merge: true });

          try {
            await updatePassword(credential.user, bgPassword);
          } catch (upgErr) {
            console.warn("Auth password upgrade warning:", upgErr);
          }
        }
        return { error: null };
      } catch (err: any) {
        // Auto register first admin if not registerable or on first login
        if (cleanedEmail === 'chukrirookstooleu768@gmail.com' && cleanedPassword === '123456') {
          try {
            const cred = await createUserWithEmailAndPassword(auth, cleanedEmail, bgPassword);
            await setDoc(doc(db, 'user_roles', cred.user.uid), {
              user_id: cred.user.uid,
              role: 'admin'
            });
            await setDoc(doc(db, 'profiles', cred.user.uid), {
              user_id: cred.user.uid,
              display_name: 'Administrator',
              email: cleanedEmail,
              custom_password: cleanedPassword
            });
            return { error: null };
          } catch (signUpErr: any) {
            return { error: signUpErr };
          }
        }
        return { error: err };
      }
    } catch (dbErr) {
      // Offline fallback
      try {
        await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
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
