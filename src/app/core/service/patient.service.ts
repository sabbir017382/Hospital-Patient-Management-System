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
    if (email === 'admin@grade.com' && password === 'admin123') {
      const user = {
        email,
        role: 'admin',
        token: 'fake-jwt-token',
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

  //get patient by id
  getPatientById(id: string) {
    return this.patients$
      .asObservable()
      .pipe(map((patients) => patients.find((p) => p.id === id)));
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

  deletePatients(ids: string[]) {
    const updated = this.patients$.value.filter((p) => !ids.includes(p.id));
    this.patients$.next(updated);
  }
  private doctors$ = new BehaviorSubject<Doctor[]>([
    {
      id: 'D001',
      name: 'Dr. Farhan Ahmed',
      specialty: 'Cardiology',
      availability: 'Mon, Wed, Fri — 9AM–1PM',
    },
    {
      id: 'D002',
      name: 'Dr. Nusrat Jahan',
      specialty: 'Neurology',
      availability: 'Tue, Thu — 10AM–3PM',
    },
    {
      id: 'D003',
      name: 'Dr. Karim Chowdhury',
      specialty: 'Orthopedics',
      availability: 'Mon–Fri — 8AM–12PM',
    },
    {
      id: 'D004',
      name: 'Dr. Anika Islam',
      specialty: 'Pediatrics',
      availability: 'Mon, Tue, Thu — 2PM–6PM',
    },
    {
      id: 'D005',
      name: 'Dr. Rafiq Hassan',
      specialty: 'General Medicine',
      availability: 'Daily — 9AM–5PM',
    },
    {
      id: 'D006',
      name: 'Dr. Sumaiya Begum',
      specialty: 'Dermatology',
      availability: 'Wed, Fri — 11AM–4PM',
    },
  ]);

  getDoctors() {
    return this.doctors$.asObservable();
  }
}
