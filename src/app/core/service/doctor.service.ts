import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Doctor } from '../models/doctor';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private readonly storageKey = 'doctorList';
  private readonly doctors$ = new BehaviorSubject<Doctor[]>(this.loadDoctors());

  constructor() {}

  getDoctors() {
    return this.doctors$.asObservable();
  }

  getDoctorById(id: string) {
    return this.doctors$.value.find((doctor) => doctor.doctorId === id);
  }

  createDoctor(doctor: Doctor): boolean {
    if (this.doctorExists(doctor)) {
      return false;
    }

    const newDoctor = this.normalizeDoctor({
      ...doctor,
      doctorId: this.generateDoctorId(),
    });
    const updatedDoctors = [...this.doctors$.value, newDoctor];
    this.doctors$.next(updatedDoctors);
    this.saveDoctors(updatedDoctors);
    return true;
  }

  doctorExists(doctor: Partial<Doctor>): boolean {
    const name = doctor.doctorName?.trim().toLowerCase();
    const email = doctor.email?.trim().toLowerCase();

    return this.doctors$.value.some((existing) => {
      const existingName = existing.doctorName?.trim().toLowerCase();
      const existingEmail = existing.email?.trim().toLowerCase();
      return (
        (name && existingName === name) || (email && existingEmail === email)
      );
    });
  }

  deleteDoctor(id: string) {
    const updatedDoctors = this.doctors$.value.filter(
      (doctor) => doctor.doctorId !== id,
    );
    this.doctors$.next(updatedDoctors);
    this.saveDoctors(updatedDoctors);
  }

  private generateDoctorId(): string {
    const existingIds = this.doctors$.value.map(
      (doctor) => doctor.doctorId || '',
    );

    const lastNumber = existingIds
      .map((id) => {
        const digits = id.replace(/[^0-9]/g, '');
        return parseInt(digits, 10);
      })
      .filter((num) => !Number.isNaN(num));

    const nextNumber = lastNumber.length ? Math.max(...lastNumber) + 1 : 1;
    return `Dr${nextNumber.toString().padStart(2, '0')}`;
  }

  private loadDoctors(): Doctor[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      const stored = JSON.parse(raw) as Doctor[];
      return stored.map((doctor) => this.normalizeDoctor(doctor));
    } catch {
      return [];
    }
  }

  private normalizeDoctor(doctor: Doctor): Doctor {
    const doctorId = doctor.doctorId || `D${Date.now()}`;
    const doctorName = doctor.doctorName || doctor.name || '';
    const chamberStart = doctor.chamberTime?.start || '';
    const chamberEnd = doctor.chamberTime?.end || '';

    return {
      ...doctor,
      doctorId,
      doctorName,
      name: doctorName,
      chamberTime: {
        start: chamberStart,
        end: chamberEnd,
      },
      availability:
        chamberStart && chamberEnd
          ? `${chamberStart} — ${chamberEnd}`
          : doctor.availability || '',
    };
  }

  private saveDoctors(doctors: Doctor[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(doctors));
  }
}
