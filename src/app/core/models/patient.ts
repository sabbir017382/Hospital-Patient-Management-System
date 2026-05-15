export interface Patient {
  id: string;

  name: string;

  dob: Date;

  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

  gender: 'Male' | 'Female' | 'Other';

  phone: string;

  email: string;

  address: string;

  insuranceType: 'None' | 'Government' | 'Private' | 'Corporate';

  registeredAt: Date;

  emergencyContact: string;

  medicalHistory: string[];
}
