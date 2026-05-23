import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../models/appoinment';
import { Patient } from '../models/patient';
import { map } from 'rxjs/operators';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  availability: string;
};
@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  login(email: string, password: string): boolean {
    // Admin credentials
    if (email === 'admin@grade.com' && password === 'admin123') {
      const user = {
        email,
        role: 'admin',
        token: 'fake-jwt-token',
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }

    // Hardcoded doctor credentials
    const doctors: Array<{
      email: string;
      password: string;
      id: string;
      name: string;
      specialty: string;
      imageUrl?: string;
    }> = [
      {
        email: 'kasim@gmail.com',
        password: 'kasim123',
        id: 'DR01',
        name: 'Dr. Kashem Rabbi',
        specialty: 'General Medicine',
        imageUrl: '',
      },
      {
        email: 'hasim@gmail.com',
        password: 'kasim123',
        id: 'DR02',
        name: 'Dr. Hasim Rabbi',
        specialty: 'Cardiology',
        imageUrl: '',
      },
    ];

    const match = doctors.find(
      (d) => d.email === email && d.password === password,
    );
    if (match) {
      const user = {
        email: match.email,
        role: 'doctor',
        doctorId: match.id,
        name: match.name,
        specialty: match.specialty,
        imageUrl: match.imageUrl || '',
        token: 'fake-doctor-token',
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }

    return false;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  getAppointmentsSnapshot() {
    return this.appointmentsSubject.getValue();
  }

  getAppointments() {
    return this.appointmentsSubject.asObservable();
  }

  getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.getAppointmentsSnapshot().filter(
      (appt) => appt.patientId === patientId,
    );
  }

  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointmentsSnapshot().filter(
      (appt) => appt.doctorId === doctorId,
    );
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.getAppointmentsSnapshot().find((appt) => appt.id === id);
  }

  addAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt'>,
  ): Appointment {
    const current = this.appointmentsSubject.getValue();
    const appointmentDate =
      appointment.appointmentDate instanceof Date
        ? appointment.appointmentDate
        : new Date(appointment.appointmentDate);

    const toSave: Appointment = {
      ...appointment,
      appointmentDate,
      status: appointment.status || 'Scheduled',
      id: this.generateAppointmentId(),
      createdAt: new Date(),
      followUpDate: appointment.followUpDate ?? null,
    };

    this.appointmentsSubject.next([...current, toSave]);
    return toSave;
  }

  updateAppointment(
    id: string,
    updates: Partial<Appointment>,
  ): Appointment | null {
    const current = this.appointmentsSubject.getValue();
    const existing = current.find((appt) => appt.id === id);
    if (!existing) {
      return null;
    }

    const updated: Appointment = {
      ...existing,
      ...updates,
      appointmentDate: updates.appointmentDate
        ? updates.appointmentDate instanceof Date
          ? updates.appointmentDate
          : new Date(updates.appointmentDate)
        : existing.appointmentDate,
      followUpDate:
        updates.followUpDate !== undefined
          ? updates.followUpDate
          : existing.followUpDate,
    };

    this.appointmentsSubject.next(
      current.map((appt) => (appt.id === id ? updated : appt)),
    );
    return updated;
  }

  cancelAppointment(id: string): void {
    this.updateAppointment(id, { status: 'Cancelled' });
  }

  getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.getAppointmentsSnapshot().filter(
      (appt) =>
        appt.status === 'Scheduled' && new Date(appt.appointmentDate) > now,
    );
  }

  getAppointmentStats() {
    const stats = {
      total: 0,
      completed: 0,
      cancelled: 0,
      scheduled: 0,
      noShow: 0,
    };

    this.getAppointmentsSnapshot().forEach((appt) => {
      stats.total += 1;
      if (appt.status === 'Completed') {
        stats.completed += 1;
      } else if (appt.status === 'Cancelled') {
        stats.cancelled += 1;
      } else if (appt.status === 'Scheduled') {
        stats.scheduled += 1;
      } else if (appt.status === 'No-show') {
        stats.noShow += 1;
      }
    });

    return stats;
  }

  resetState() {
    this.appointmentsSubject.next([]);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  private patients$ = new BehaviorSubject<Patient[]>([
    {
      id: 'P001',
      fullName: 'Md. Rahim Uddin',
      dob: new Date('1965-03-12'),
      bloodGroup: 'O+',
      gender: 'Male',
      phone: '01911234567',
      email: 'rahim@example.com',
      address: 'Dhaka, Bangladesh',
      insuranceType: 'Government',
      registeredAt: new Date('2024-01-01'),
      emergencyContact: '01911234568',
      medicalHistory: ['Hypertension'],
    },
    {
      id: 'P002',
      fullName: 'Fatema Khatun',
      dob: new Date('1988-07-25'),
      bloodGroup: 'A+',
      gender: 'Female',
      phone: '01812345678',
      email: 'fatema@example.com',
      address: 'Chittagong, Bangladesh',
      insuranceType: 'Private',
      registeredAt: new Date('2024-01-02'),
      emergencyContact: '01812345679',
      medicalHistory: ['Diabetes'],
    },
    {
      id: 'P003',
      fullName: 'Arif Hossain',
      dob: new Date('2010-11-08'),
      bloodGroup: 'B+',
      gender: 'Male',
      phone: '01713456789',
      email: 'arif@example.com',
      address: 'Sylhet, Bangladesh',
      insuranceType: 'None',
      registeredAt: new Date('2024-01-03'),
      emergencyContact: '01713456790',
      medicalHistory: [],
    },
    {
      id: 'P004',
      fullName: 'Nasrin Akter',
      dob: new Date('1975-02-14'),
      bloodGroup: 'AB-',
      gender: 'Female',
      phone: '01614567890',
      email: 'nasrin@example.com',
      address: 'Rajshahi, Bangladesh',
      insuranceType: 'Corporate',
      registeredAt: new Date('2024-01-04'),
      emergencyContact: '01614567891',
      medicalHistory: ['Asthma'],
    },
    {
      id: 'P005',
      fullName: 'Jakir Hossain',
      dob: new Date('1995-09-30'),
      bloodGroup: 'A-',
      gender: 'Male',
      phone: '01515678901',
      email: 'jakir@example.com',
      address: 'Khulna, Bangladesh',
      insuranceType: 'Government',
      registeredAt: new Date('2024-01-05'),
      emergencyContact: '01515678902',
      medicalHistory: ['None'],
    },
    {
      id: 'P006',
      fullName: 'Roksana Begum',
      dob: new Date('2000-05-20'),
      bloodGroup: 'B-',
      gender: 'Female',
      phone: '01416789012',
      email: 'roksana@example.com',
      address: 'Barisal, Bangladesh',
      insuranceType: 'Private',
      registeredAt: new Date('2024-01-06'),
      emergencyContact: '01416789013',
      medicalHistory: ['Thyroid'],
    },
    {
      id: 'P007',
      fullName: 'Sumon Mia',
      dob: new Date('1950-12-01'),
      bloodGroup: 'O-',
      gender: 'Male',
      phone: '01317890123',
      email: 'sumon@example.com',
      address: 'Rangpur, Bangladesh',
      insuranceType: 'None',
      registeredAt: new Date('2024-01-07'),
      emergencyContact: '01317890124',
      medicalHistory: ['Cardiac'],
    },
    {
      id: 'P008',
      fullName: 'Tania Islam',
      dob: new Date('2015-06-18'),
      bloodGroup: 'AB+',
      gender: 'Female',
      phone: '01218901234',
      email: 'tania@example.com',
      address: 'Mymensingh, Bangladesh',
      insuranceType: 'Corporate',
      registeredAt: new Date('2024-01-08'),
      emergencyContact: '01218901235',
      medicalHistory: [],
    },
  ]);

  constructor() {}
  //details about UUID
  private generatePatientId(): string {
    const ids = this.patients$.value
      .map((p) => p.id)
      .filter((id): id is string => typeof id === 'string');

    const numericIds = ids
      .map((id) => {
        const match = /^P(\d+)$/.exec(id);
        return match ? Number(match[1]) : null;
      })
      .filter((num): num is number => num !== null);

    const nextNumber = numericIds.length ? Math.max(...numericIds) + 1 : 1;
    return `P${nextNumber.toString().padStart(3, '0')}`;
  }

  private generateAppointmentId(): string {
    const ids = this.appointmentsSubject.value
      .map((appt) => appt.id)
      .filter((id): id is string => typeof id === 'string');

    const numericIds = ids
      .map((id) => {
        const match = /^A(\d+)$/.exec(id);
        return match ? Number(match[1]) : null;
      })
      .filter((num): num is number => num !== null);

    const nextNumber = numericIds.length ? Math.max(...numericIds) + 1 : 1;
    return `A${nextNumber.toString().padStart(3, '0')}`;
  }
  //show all patient
  getPatients() {
    return this.patients$.asObservable();
  }
  //add new patient
  addPatient(patient: Omit<Patient, 'id' | 'registeredAt'>): Patient {
    const current = this.patients$.value;
    const normalizedMedicalHistory = Array.isArray(patient.medicalHistory)
      ? patient.medicalHistory.filter(Boolean)
      : [];

    const toSave: Patient = {
      ...patient,
      medicalHistory: normalizedMedicalHistory,
      id: this.generatePatientId(),
      registeredAt: new Date(),
    };

    this.patients$.next([...current, toSave]);
    return toSave;
  }

  //get patient by id as observable
  getPatientById(id: string) {
    return this.patients$
      .asObservable()
      .pipe(map((patients) => patients.find((p) => p.id === id)));
  }

  //get patient by id synchronously
  findPatientById(id: string): Patient | undefined {
    return this.patients$.value.find((patient) => patient.id === id);
  }

  //update patient
  updatePatient(updated: any) {
    const normalized = {
      ...updated,
      medicalHistory: Array.isArray(updated.medicalHistory)
        ? updated.medicalHistory.filter(Boolean)
        : [],
    };

    const list = this.patients$.value.map((p) =>
      p.id === normalized.id ? normalized : p,
    );
    this.patients$.next(list);
  }

  updatePatientById(id: string, updates: Partial<Patient>): Patient | null {
    const current = this.patients$.value;
    const existing = current.find((patient) => patient.id === id);
    if (!existing) {
      return null;
    }
    const normalizedMedicalHistory = Array.isArray(updates.medicalHistory)
      ? updates.medicalHistory.filter(Boolean)
      : existing.medicalHistory;

    const updatedPatient: Patient = {
      ...existing,
      ...updates,
      medicalHistory: normalizedMedicalHistory,
      dob: updates.dob ? new Date(updates.dob) : existing.dob,
    };

    this.patients$.next(
      current.map((patient) => (patient.id === id ? updatedPatient : patient)),
    );
    return updatedPatient;
  }

  deletePatients(ids: string[]) {
    const updated = this.patients$.value.filter((p) => !ids.includes(p.id));
    this.patients$.next(updated);
  }

  deletePatient(id: string): boolean {
    const patientExists = this.patients$.value.some((p) => p.id === id);
    if (!patientExists) {
      return false;
    }
    this.deletePatients([id]);
    return true;
  }

  searchPatients(query: string): Patient[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.patients$.value;
    }
    return this.patients$.value.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(normalized) ||
        patient.phone.toLowerCase().includes(normalized) ||
        patient.bloodGroup.toLowerCase().includes(normalized)
      );
    });
  }
}
