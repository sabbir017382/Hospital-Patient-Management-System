export interface PrescriptionMedication {
  name: string;
  morning: boolean;
  noon: boolean;
  night: boolean;
  duration: string;
}

export interface Prescription {
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientAge: number | string;
  patientGender: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  medicalHistory: string;
  problems: string;
  tests: string;
  medications: PrescriptionMedication[];
  notes: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  notes: string;
  createdAt: Date;
  followUpDate: Date | null;
  prescription?: Prescription;
}
