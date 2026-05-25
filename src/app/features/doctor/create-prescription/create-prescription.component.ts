import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment, Prescription } from 'src/app/core/models/appoinment';
import { Patient } from 'src/app/core/models/patient';
import { Doctor } from 'src/app/core/models/doctor';
import { PatientService } from 'src/app/core/service/patient.service';
import { DoctorService } from 'src/app/core/service/doctor.service';

@Component({
  selector: 'app-create-prescription',
  templateUrl: './create-prescription.component.html',
  styleUrls: ['./create-prescription.component.css'],
})
export class CreatePrescriptionComponent implements OnInit {
  prescriptionForm!: FormGroup;
  patient?: Patient;
  doctor?: Doctor;
  appointment?: Appointment;
  currentUser: any;
  viewMode = false;
  prescriptionSaved = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.patientService.getCurrentUser();
    this.buildForm();

    this.route.queryParamMap.subscribe((params) => {
      const appointmentId = params.get('appointmentId');
      const patientId = params.get('patientId');
      this.viewMode = params.get('viewMode') === 'true';

      if (patientId) {
        this.patient = this.patientService.findPatientById(patientId);
      }

      if (appointmentId) {
        this.appointment =
          this.patientService.getAppointmentById(appointmentId);
        if (this.appointment) {
          this.patient =
            this.patient ||
            this.patientService.findPatientById(this.appointment.patientId);
          this.doctor = this.doctorService.getDoctorById(
            this.appointment.doctorId,
          );
        }
      }

      if (!this.doctor && this.currentUser?.doctorId) {
        this.doctor = this.doctorService.getDoctorById(
          this.currentUser.doctorId,
        );
      }

      this.patchDoctorPatientData();

      if (this.appointment?.prescription) {
        this.prescriptionSaved = true;
        this.patchPrescriptionData(this.appointment.prescription);
      }
    });
  }

  private buildForm() {
    this.prescriptionForm = this.fb.group({
      doctorName: ['', Validators.required],
      doctorSpecialty: ['', Validators.required],
      patientName: ['', Validators.required],
      patientAge: [''],
      patientGender: [''],
      patientPhone: [''],
      appointmentDate: [''],
      appointmentTime: [''],
      medicalHistory: ['', Validators.required],
      problems: ['', Validators.required],
      tests: [''],
      medications: this.fb.array([this.createMedicineGroup()]),
      notes: [''],
    });
  }

  get medications(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  private createMedicineGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      morning: [false],
      noon: [false],
      night: [false],
      duration: ['', Validators.required],
    });
  }

  addMedicine() {
    this.medications.push(this.createMedicineGroup());
  }

  removeMedicine(index: number) {
    if (this.medications.length > 1) {
      this.medications.removeAt(index);
    }
  }

  private patchDoctorPatientData() {
    if (this.doctor) {
      this.prescriptionForm.patchValue({
        doctorName: this.doctor.doctorName,
        doctorSpecialty: this.doctor.specialty,
      });
    } else if (this.currentUser) {
      this.prescriptionForm.patchValue({
        doctorName: this.currentUser.doctorName || '',
        doctorSpecialty: this.currentUser.specialty || '',
      });
    }

    if (this.patient) {
      this.prescriptionForm.patchValue({
        patientName: this.patient.fullName,
        patientAge: this.getAge(this.patient.dob),
        patientGender: this.patient.gender || '',
        patientPhone: this.patient.phone || '',
        medicalHistory: (this.patient.medicalHistory || []).join(', '),
      });
    }

    if (this.appointment) {
      this.prescriptionForm.patchValue({
        appointmentDate: this.formatDate(this.appointment.appointmentDate),
        appointmentTime: this.formatTime(this.appointment.appointmentDate),
      });
    }
  }

  private patchPrescriptionData(prescription: Prescription) {
    this.prescriptionForm.patchValue({
      doctorName: prescription.doctorName,
      doctorSpecialty: prescription.doctorSpecialty,
      patientName: prescription.patientName,
      patientAge: prescription.patientAge,
      patientGender: prescription.patientGender,
      patientPhone: prescription.patientPhone,
      appointmentDate: prescription.appointmentDate,
      appointmentTime: prescription.appointmentTime,
      medicalHistory: prescription.medicalHistory,
      problems: prescription.problems,
      tests: prescription.tests,
      notes: prescription.notes,
    });

    this.medications.clear();
    prescription.medications.forEach((med) => {
      this.medications.push(
        this.fb.group({
          name: [med.name, Validators.required],
          morning: [med.morning],
          noon: [med.noon],
          night: [med.night],
          duration: [med.duration, Validators.required],
        }),
      );
    });
  }

  private getAge(dob: Date | string | undefined): number | string {
    if (!dob) {
      return '';
    }
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  private formatDate(dateValue: Date | string): string {
    const date = new Date(dateValue);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatTime(dateValue: Date | string): string {
    const date = new Date(dateValue);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  generatePrescription() {
    if (this.prescriptionForm.invalid) {
      this.prescriptionForm.markAllAsTouched();
      return;
    }

    const prescription: Prescription = {
      ...this.prescriptionForm.value,
      createdAt: new Date(),
    };

    if (this.appointment) {
      const updated = this.patientService.updateAppointment(
        this.appointment.id,
        {
          prescription,
          status: 'Completed',
        },
      );
      if (updated) {
        this.appointment = updated;
        this.prescriptionSaved = true;
        this.viewMode = true;
      }
      this.snackBar.open('Prescription generated and saved.', 'OK', {
        duration: 3000,
      });
      return;
    }

    this.snackBar.open(
      'Prescription generated. Appointment was not linked.',
      'OK',
      { duration: 3000 },
    );
  }

  viewPrescriptionPreview() {
    if (!this.appointment?.prescription) {
      this.snackBar.open('No prescription available to preview.', 'OK', {
        duration: 2000,
      });
      return;
    }

    this.viewMode = true;
  }

  onBack() {
    this.viewMode = false;
    this.router.navigate(['/doctor-dashboard']);
  }
}
