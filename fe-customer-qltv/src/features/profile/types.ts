export interface ProfilePageUser {
  id: string;
  username: string;
  email: string;
  role: string;
  accountStatus: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileEditFormData {
  fullName: string;
  dob: string;
  gender: "male" | "female" | "other";
  address: string;
  phone: string;
}
