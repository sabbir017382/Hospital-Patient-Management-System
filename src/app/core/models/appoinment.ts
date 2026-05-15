export interface Appointment {
  id: string;

  patientId: string;

  doctorId: string;

  appointmentDate: Date;

  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';

  notes: string;

  createdAt: Date;

  followUpDate: Date | null;
}
