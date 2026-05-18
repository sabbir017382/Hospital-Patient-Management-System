export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const INSURANCE_TYPES = [
  'None',
  'Government',
  'Private',
  'Corporate',
] as const;
export type InsuranceType = (typeof INSURANCE_TYPES)[number];

export const GENDER_TYPES = ['Male', 'Female', 'Other'] as const;
export type GenderType = (typeof GENDER_TYPES)[number];

export interface Patient {
  id: string;

  fullName: string;

  dob: Date;

  bloodGroup: BloodGroup;

  gender: GenderType;

  phone: string;

  email: string;

  address: string;

  insuranceType: InsuranceType;

  registeredAt: Date;

  emergencyContact: string;

  medicalHistory: string[];
}
