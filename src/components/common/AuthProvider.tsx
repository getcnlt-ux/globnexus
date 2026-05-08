import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'admin' | 'super_admin';
  referralCode?: string;
  referredBy?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

// Unique code generator for referral codes
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Force super_admin role for the developer email
          const isSuperAdminEmail = user.email === 'getcnlt@gmail.com';
          
          // Fetch or create user profile
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            let data = userDoc.data() as UserProfile;
            let needsUpdate = false;

            // Auto-promote developer to super_admin if not already
            if (isSuperAdminEmail && data.role !== 'super_admin') {
              data.role = 'super_admin';
              needsUpdate = true;
            }

            // Generate referral code if missing
            if (!data.referralCode) {
              data.referralCode = generateReferralCode();
              needsUpdate = true;
            }

            if (needsUpdate) {
              await setDoc(userDocRef, data, { merge: true });
            }
            setProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              role: isSuperAdminEmail ? 'super_admin' : 'user',
              referralCode: generateReferralCode()
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Error managing user profile:', error);
          // Fallback
          if (user.email === 'getcnlt@gmail.com') {
            setProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Admin',
              role: 'super_admin',
              referralCode: 'ADMIN-REF'
            });
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
