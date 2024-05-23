import { FIRESTORE_DB } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

// Define the structure of a post
interface Post {
  pledgeAmount: number;
  verified: boolean;
  approved: boolean;
  id: string;
  userId: string;
  image: string;
  caption: string;
  details: string;
  amountNeeded: string;
  donatedAmount: number;
  location: { latitude: number; longitude: number };
  createdAt: string;
  profilePicture: string;
  onGoing: boolean;
  targetDate: string;
  donatedUsers: string[];
}

const fetchPosts = async (): Promise<Post[]> => {
  const postsQuery = query(
    collection(FIRESTORE_DB, "posts"),
    where("approved", "==", true),
    where("onGoing", "==", true),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(postsQuery);
  const fetchedPosts: Post[] = querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Post)
  );

  // Separate verified and unverified posts
  const verifiedPosts = fetchedPosts.filter((post) => post.verified);
  const unverifiedPosts = fetchedPosts.filter((post) => !post.verified);

  // Sort verified posts to appear first
  verifiedPosts.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Combine sorted verified posts with unverified posts
  return [...verifiedPosts, ...unverifiedPosts];
};

export default fetchPosts;
