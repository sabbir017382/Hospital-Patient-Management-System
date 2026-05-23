import { Component, OnInit, Optional, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Appointment } from 'src/app/core/models/appoinment';
import { Patient } from 'src/app/core/models/patient';
import { Doctor } from 'src/app/core/models/doctor';
import { PatientService } from 'src/app/core/service/patient.service';
import { DoctorService } from 'src/app/core/service/doctor.service';

interface AppointmentDialogData {
  patient?: Patient;
  appointment?: Appointment;
  doctorId?: string;
}

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.css'],
})
export class AppointmentModalComponent implements OnInit {
  form!: FormGroup;
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  patientOptions: Patient[] = [];
  filteredPatients: Patient[] = [];
  warningMessage = '';
  isEditMode = false;
  appointment?: Appointment;
  patient?: Patient;
  timeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private snackBar: MatSnackBar,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<AppointmentModalComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data?: AppointmentDialogData,
  ) {}

  ngOnInit() {
    this.timeSlots = this.generateTimeSlots();

    this.form = this.fb.group(
      {
        patientId: ['', Validators.required],
        doctorId: ['', Validators.required],
        appointmentDate: ['', Validators.required],
        appointmentTime: ['', Validators.required],
        notes: [''],
      },
      {
        validators: this.futureDateTimeValidator.bind(this),
      },
    );

    this.doctorService.getDoctors().subscribe((doctors: Doctor[]) => {
      this.doctors = doctors;
      this.filteredDoctors = doctors;
    });

    this.patientService.getPatients().subscribe((patients) => {
      this.patientOptions = patients;
      this.filteredPatients = patients;
    });

    this.form.get('patientId')?.valueChanges.subscribe((value) => {
      this.filterPatients(value);
    });

    if (this.data?.patient) {
      this.patient = this.data.patient;
      this.form.patchValue({ patientId: this.data.patient.id });
      this.form.get('patientId')?.disable();
    }

    if (this.data?.doctorId) {
      this.form.patchValue({ doctorId: this.data.doctorId });
    }

    if (this.data?.appointment) {
      this.isEditMode = true;
      this.appointment = this.data.appointment;
      this.form.patchValue({
        patientId: this.data.appointment.patientId,
        doctorId: this.data.appointment.doctorId,
        appointmentDate: this.toDateInput(
          this.data.appointment.appointmentDate,
        ),
        appointmentTime: this.toTimeInput(
          this.data.appointment.appointmentDate,
        ),
        notes: this.data.appointment.notes,
      });
      if (!this.data.patient) {
        this.patient = this.patientOptions.find(
          (item) => item.id === this.data?.appointment?.patientId,
        );
      }
      if (this.patient) {
        this.form.get('patientId')?.disable();
      }
    }

    this.form.get('doctorId')?.valueChanges.subscribe((value) => {
      this.filterDoctors(value);
      this.updateWarning();
    });
    this.form.get('appointmentDate')?.valueChanges.subscribe((value) => {
      if (value && !this.form.get('appointmentTime')?.value) {
        this.form.get('appointmentTime')?.setValue(this.timeSlots[0]);
      }
      this.updateWarning();
    });
    this.form.get('appointmentTime')?.valueChanges.subscribe(() => {
      this.updateWarning();
    });
  }

  private futureDateTimeValidator(control: AbstractControl) {
    const group = control as FormGroup;
    const dateValue = group.get('appointmentDate')?.value;
    const timeValue = group.get('appointmentTime')?.value;
    if (!dateValue || !timeValue) {
      return null;
    }
    const appointmentDateTime = this.combineDateAndTime(dateValue, timeValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDateTime && appointmentDateTime >= today
      ? null
      : { pastDateTime: true };
  }

  private combineDateAndTime(
    dateValue: Date | string,
    time: string,
  ): Date | null {
    if (!dateValue || !time) {
      return null;
    }
    const date = new Date(dateValue);
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private toDateInput(value: Date | string | null): Date | null {
    return value ? new Date(value) : null;
  }

  private toTimeInput(value: Date | string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('18:00');
    return slots;
  }

  filterDoctors(searchValue: string) {
    const filter = (searchValue || '').toString().toLowerCase();
    this.filteredDoctors = this.doctors.filter(
      (doctor) =>
        doctor.id.toLowerCase().includes(filter) ||
        doctor.name.toLowerCase().includes(filter) ||
        doctor.specialty.toLowerCase().includes(filter),
    );
  }

  displayDoctor(doctorId: string) {
    const match = this.doctors.find((doctor) => doctor.id === doctorId);
    return match ? `${match.name} (${match.specialty})` : '';
  }

  filterPatients(searchValue: string) {
    const filter = (searchValue || '').toString().toLowerCase();
    this.filteredPatients = this.patientOptions.filter(
      (patient) =>
        patient.fullName.toLowerCase().includes(filter) ||
        patient.id.toLowerCase().includes(filter),
    );
  }

  displayPatient(patientId: string) {
    const match = this.patientOptions.find(
      (patient) => patient.id === patientId,
    );
    return match ? `${match.fullName} (${match.id})` : '';
  }

  toDateTimeLocal(value: Date | string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const offsetMinutes = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offsetMinutes * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  private sameDay(dateA: Date, dateB: Date) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  private getDayShortName(date: Date): string {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return names[date.getDay()];
  }

  private doctorAvailableOn(doctorId: string, appointmentDate: Date): boolean {
    const doctor = this.doctors.find((doc) => doc.id === doctorId);
    if (!doctor) {
      return true;
    }

    const selectedDay = this.getDayShortName(appointmentDate);
    const availableDays = (doctor.availableDays || [])
      .map((day) => this.normalizeDay(day))
      .filter(Boolean) as string[];

    if (availableDays.length) {
      return availableDays.includes(selectedDay);
    }

    if (/daily/i.test(doctor.availability)) {
      return true;
    }

    const availabilityPart = doctor.availability.split('—')[0].trim();
    const parts = availabilityPart
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      const normalized = this.normalizeDay(part);
      if (normalized === selectedDay) {
        return true;
      }

      const rangeMatch = part.match(
        /^([A-Za-z]{3,9})\s*[–-]\s*([A-Za-z]{3,9})$/,
      );
      if (rangeMatch) {
        const start = this.normalizeDay(rangeMatch[1]);
        const end = this.normalizeDay(rangeMatch[2]);
        const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const startIndex = start ? order.indexOf(start) : -1;
        const endIndex = end ? order.indexOf(end) : -1;
        const selectedIndex = order.indexOf(selectedDay);
        if (startIndex >= 0 && endIndex >= 0 && selectedIndex >= 0) {
          if (startIndex <= endIndex) {
            if (selectedIndex >= startIndex && selectedIndex <= endIndex) {
              return true;
            }
          } else {
            if (selectedIndex >= startIndex || selectedIndex <= endIndex) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private normalizeDay(day: string): string | null {
    const normalized = day.trim().substring(0, 3).toLowerCase();
    const map: Record<string, string> = {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    };
    return map[normalized] || null;
  }

  updateWarning() {
    const doctorId = this.form.get('doctorId')?.value;
    const appointmentDate = this.combineDateAndTime(
      this.form.get('appointmentDate')?.value,
      this.form.get('appointmentTime')?.value,
    );
    if (!doctorId || !appointmentDate) {
      this.warningMessage = '';
      return;
    }

    if (!this.doctorAvailableOn(doctorId, appointmentDate)) {
      this.warningMessage =
        'This doctor is not available on the selected day. Please choose another date or doctor.';
      return;
    }

    // Check for EXACT TIME conflict (same day and same time)
    const doctorAppointments =
      this.patientService.getAppointmentsByDoctor(doctorId);
    const timeConflict = doctorAppointments.some(
      (appt) =>
        appt.status !== 'Cancelled' &&
        new Date(appt.appointmentDate).getTime() === appointmentDate.getTime(),
    );

    this.warningMessage = timeConflict
      ? 'This doctor already has an appointment at this exact time. Please choose a different time.'
      : '';
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const patientId = rawValue.patientId || this.patient?.id;
    const doctorId = rawValue.doctorId;
    const appointmentDate = this.combineDateAndTime(
      rawValue.appointmentDate,
      rawValue.appointmentTime,
    );
    const notes = rawValue.notes || '';

    if (!patientId) {
      this.snackBar.open('Please select a patient.', 'OK', {
        duration: 3000,
      });
      return;
    }

    if (!rawValue.appointmentTime) {
      this.snackBar.open('Please choose an appointment time.', 'OK', {
        duration: 3000,
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!appointmentDate || appointmentDate < today) {
      this.snackBar.open(
        'Please choose today or a future appointment date and time.',
        'OK',
        {
          duration: 3000,
        },
      );
      return;
    }

    if (!this.doctorAvailableOn(doctorId, appointmentDate)) {
      this.snackBar.open(
        'Selected doctor is not available on that day. Please choose a different date or doctor.',
        'OK',
        { duration: 3000 },
      );
      return;
    }

    // Check for exact time conflict before saving
    const doctorAppointments =
      this.patientService.getAppointmentsByDoctor(doctorId);
    const timeConflict = doctorAppointments.some(
      (appt) =>
        appt.status !== 'Cancelled' &&
        new Date(appt.appointmentDate).getTime() === appointmentDate.getTime(),
    );

    if (timeConflict) {
      this.snackBar.open(
        'This doctor already has an appointment at this exact time. Please choose a different time.',
        'OK',
        { duration: 3000 },
      );
      return;
    }

    if (this.isEditMode && this.appointment) {
      const updated = this.patientService.updateAppointment(
        this.appointment.id,
        {
          patientId,
          doctorId,
          appointmentDate,
          notes,
        },
      );
      if (updated) {
        this.snackBar.open('Appointment updated', 'OK', {
          duration: 2000,
        });
        this.close(updated);
      }
      return;
    }

    const created = this.patientService.addAppointment({
      patientId,
      doctorId,
      appointmentDate,
      notes,
      status: 'Scheduled',
      followUpDate: null,
    });
    this.snackBar.open('Appointment booked', 'OK', {
      duration: 2000,
    });
    this.close(created);
  }

  cancelAppointment() {
    if (!this.appointment) {
      return;
    }
    const confirmed = this.snackBar.open(
      'Are you sure to cancle Appoinment',
      'OK',
      {
        duration: 2000,
      },
    );
    if (!confirmed) {
      return;
    }
    this.patientService.cancelAppointment(this.appointment.id);
    const cancelled = this.patientService
      .getAppointmentsSnapshot()
      .find((appt) => appt.id === this.appointment?.id);
    if (cancelled) {
      this.snackBar.open('Appointment cancelled', 'OK', {
        duration: 2000,
      });
      this.close(cancelled);
    }
  }

  onCancel() {
    if (this.dialogRef) {
      this.dialogRef.close();
      return;
    }
    this.router.navigate(['/patients']);
  }

  close(result?: Appointment) {
    if (this.dialogRef) {
      this.dialogRef.close(result);
      return;
    }
    this.router.navigate(['/patients']);
  }
}
