import { Timestamp } from "firebase/firestore";

export type Donation = {
  donatedUsers: any;
  targetDate: any;
  createdAt: any;
  pledgeAmount: number;
  verified: boolean;
  approved: boolean;
  profilePicture: string;
  id: string;
  caption: string | null;
  image: string | null;
  userId: string;
  details: string;
  amountNeeded: string;
  donatedAmount: number;
  onGoing: boolean;
};

export type User = {
  id: string;
  birthDate: Timestamp;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  isAmin: boolean;
  donated: number;
  donatedAmount: number;
};

export type PaymentType = 'Gcash' | 'Paymaya' | 'MedQWallet' ;

export type CartItem = {
  id: string;
  donation: Donation;
  product_id: number;
  size: PaymentType;
  quantity: number;
};

export const DonationStatusList: DonationStatus[] = [
  'Processing',
  'Sending',
  'Successful',
];

export type DonationStatus = 'Processing' | 'Sending' | 'Successful';

export type Order = {
  id: number;
  created_at: string;
  total: number;
  user_id: string;
  status: DonationStatus;

  order_items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  donations: Donation;
  order_id: number;
  type: PaymentType;
  quantity: number;
};

export type Profile = {
  id: string;
  group: string;
};
