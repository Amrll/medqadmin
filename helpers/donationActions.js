import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Alert } from 'react-native';
import { FIRESTORE_DB } from '@/lib/firebase';

export const closeDonation = async (id) => {
  try {
    const userRef = doc(FIRESTORE_DB, 'posts', id);
    await updateDoc(userRef, {
      onGoing: false,
    });

    Alert.alert('Donation Closed', 'The donation has been successfully closed.');
  } catch (error) {
    console.error('Error closing donation:', error);
    Alert.alert('Error', 'An error occurred while closing the donation.');
  }
};

export const approveDonation = async (id, userId, postImage, caption ) => {
  try {
    const donationRef = doc(FIRESTORE_DB, 'posts', id);
    await updateDoc(donationRef, {
      approved: true,
    });

    const notificationsRef = doc(FIRESTORE_DB, 'notifications', userId);
    const currentTime = new Date().toISOString();

    // Update notifications using arrayUnion
    await updateDoc(notificationsRef, {
      notifications: arrayUnion({
        postImage: postImage,
        approved: true,
        time: currentTime,
        caption: caption,
      })
    });


    Alert.alert('Donation Approved', 'The donation has been approved successfully.');
  } catch (error) {
    console.error('Error approving donation:', error);
    Alert.alert('Error', 'An error occurred while approving the donation.');
  }
};

export const removeDonation = async (id) => {
  try {
    const donationRef = doc(FIRESTORE_DB, 'posts', id);
    await updateDoc(donationRef, {
      approved: false,
    });
    Alert.alert('Donation Approved', 'The donation has been approved successfully.');
  } catch (error) {
    console.error('Error approving donation:', error);
    Alert.alert('Error', 'An error occurred while approving the donation.');
  }
};
