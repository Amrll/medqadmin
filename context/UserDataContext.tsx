import * as React from "react";
import { fetchUserData } from "./userAPI";
import { useAuth } from "./auth";
import { doc, onSnapshot } from "firebase/firestore";
import { FIRESTORE_DB } from "../lib/firebase";

interface UserDataContextType {
  userData: any;
  isAdmin: boolean;
  loading: boolean; // Added loading state
}

const UserDataContext = React.createContext<UserDataContextType | null>(null);

export const UserDataProvider: React.FC = ({ children }: React.PropsWithChildren) => {
  const [userData, setUserData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true); // Initialize loading state
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true); // Set loading to true before fetching data
        const userDocRef = doc(FIRESTORE_DB, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserData(data);
            setIsAdmin(data.isAdmin || false); // Update isAdmin based on data.isAdmin
            setLoading(false); // Set loading to false after data is fetched
          } else {
            setUserData(null);
            setIsAdmin(false); // Reset isAdmin if user document doesn't exist
            setLoading(false); // Set loading to false if user document doesn't exist
          }
        });
        
        return unsubscribe; // Cleanup function to unsubscribe from the listener
      } else {
        setUserData(null);
        setIsAdmin(false); // Reset admin status if no user is logged in
        setLoading(false); // Set loading to false if no user is logged in
      }
    };
    
    fetchData();
  }, [user]);

  return (
    <UserDataContext.Provider value={{ userData, isAdmin, loading }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = React.useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
