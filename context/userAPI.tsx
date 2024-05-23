import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

export const fetchUserData = async (uid: string) => {
  try {
    const docRef = doc(FIRESTORE_DB, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
};