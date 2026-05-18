import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BLOOD_GROUPS } from 'src/app/core/models/patient';
import { INSURANCE_TYPES } from 'src/app/core/models/patient';
import { GENDER_TYPES } from 'src/app/core/models/patient';
import { Patient } from 'src/app/core/models/patient';
import { PatientService } from 'src/app/core/service/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentModalComponent } from '../../Appointment/appointment-modal/appointment-modal.component';
@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
})
export class PatientFormComponent implements OnInit {
  form!: FormGroup;
  bloodGroupOptions = BLOOD_GROUPS;
  insuranceTypeOptions = INSURANCE_TYPES;
  genderOptions = GENDER_TYPES;

  editMode = false;
  currentPatientId: string | null = null;
  currentPatient: Patient | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  //Custom DOB validator (DOB must be past)
  pastDateValidator(control: AbstractControl) {
    const inputDate = new Date(control.value);
    const today = new Date();
    return inputDate < today ? null : { futureDate: true };
  }

  //  for medical history tags input
  medicalTags: string[] = [];
  addTag(event: any) {
    const input = event?.input;
    const value = (event?.value || '').toString().trim();
    if (value && !this.medicalTags.includes(value)) {
      this.medicalTags.push(value);
    }
    if (input) {
      input.value = '';
    }
  }
  removeTag(tag: string) {
    this.medicalTags = this.medicalTags.filter((t) => t !== tag);
  }

  ngOnInit() {
    this.initializeForm();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        this.currentPatientId = id;
        this.patientService.getPatientById(id).subscribe((patient) => {
          if (patient) {
            this.currentPatient = patient;
            // Load medical history - ensure it's an array
            this.medicalTags = Array.isArray(patient.medicalHistory)
              ? patient.medicalHistory
              : [];
            // ensure form control reflects loaded tags
            if (this.form && this.form.get('medicalHistory')) {
              this.form.get('medicalHistory')?.setValue(this.medicalTags);
            }
            this.form.patchValue({
              fullName: patient.fullName,
              dob: patient.dob,
              bloodGroup: patient.bloodGroup,
              gender: patient.gender,
              phone: patient.phone,
              email: patient.email,
              address: patient.address,
              insuranceType: patient.insuranceType,
              emergencyContact: patient.emergencyContact,
              medicalHistory: this.medicalTags,
            });
          }
        });
      }
    });
  }

  private initializeForm() {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      dob: ['', [Validators.required, this.pastDateValidator]],
      bloodGroup: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/)]],
      email: ['', [Validators.email]],
      address: ['', Validators.required],
      insuranceType: ['', Validators.required],
      emergencyContact: ['', Validators.required],
      medicalHistory: [[]],
    });
  }
  onSubmit() {
    if (this.form.invalid) return;

    const patientData = {
      ...this.form.value,
      medicalHistory: this.medicalTags,
    };

    if (this.editMode && this.currentPatientId && this.currentPatient) {
      const updatedPatient: Patient = {
        ...this.currentPatient,
        ...patientData,
      };
      this.patientService.updatePatient(updatedPatient);
      this.snackBar.open('Patient updated!', 'OK', { duration: 2000 });
    } else {
      this.patientService.addPatient(patientData);
      this.snackBar.open('Patient saved!', 'OK', { duration: 2000 });
    }

    this.router.navigate(['/patient-list']);
  }

  onCancel() {
    this.router.navigate(['/patient-list']);
  }
}
