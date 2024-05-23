import * as React from "react";
import { useRouter, useSegments } from "expo-router";
import { FIREBASE_AUTH } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import Splash from "@/app/Splash";

interface AuthContextType {
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const rootSegment = useSegments()[0];
  const router = useRouter();

  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true); // Track loading state

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      setLoading(false); // Set loading to false once authentication state is determined
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!loading) {
      if (!user && rootSegment !== "(auth)") {
        router.replace("/(auth)/login");
      } else if (user && rootSegment !== "(app)") {
        router.replace("/");
      } else if (user === undefined) {
        router.replace("/Landing");
      }
    }
  }, [loading, user, rootSegment, router]);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <Splash loading={loading} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {loading ? <Splash loading={loading} /> : children}
    </AuthContext.Provider>
  );
}
