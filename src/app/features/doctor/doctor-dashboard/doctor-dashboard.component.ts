import { Component, OnInit } from '@angular/core';
import { PatientService } from 'src/app/core/service/patient.service';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { ActivatedRoute, Router } from '@angular/router';

interface CalendarDay {
  date: Date;
  label: string;
  shortLabel: string;
  iso: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: any = null;
  selectedSection: 'today' | 'upcoming' | 'history' = 'today';
  allAppointments: any[] = [];
  patientsMap: Record<string, any> = {};
  todaysAppointments: any[] = [];
  upcomingWeekDays: CalendarDay[] = [];
  selectedUpcomingDayIso = '';
  upcomingAppointmentsByDay: Record<string, any[]> = {};
  patientHistoryList: Array<{
    patientId: string;
    patientName: string;
    appointmentCount: number;
    lastVisit: Date;
    medicalHistory: string[];
    appointments: any[];
  }> = [];
  selectedPatientId: string | null = null;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // this.currentUser = this.patientService.getCurrentUser();

    const routeDoctorId = this.route.snapshot.paramMap.get('id');
    if (routeDoctorId) {
      const doctorFromService = this.doctorService.getDoctorById(routeDoctorId);
      const selectedDoctor = {
        doctorId: routeDoctorId,
        name:
          doctorFromService?.doctorName ||
          doctorFromService?.name ||
          this.currentUser?.name ||
          '',
        specialty:
          doctorFromService?.specialty || this.currentUser?.specialty || '',
        imageUrl:
          doctorFromService?.imageUrl || this.currentUser?.imageUrl || '',
        role: 'doctor',
      };
      this.currentUser = selectedDoctor;
      localStorage.setItem('selectedDoctor', JSON.stringify(selectedDoctor));
      console.log('Loaded doctor from route:', selectedDoctor);
    }

    if (!this.currentUser?.doctorId) {
      const selectedDoctorRaw = localStorage.getItem('selectedDoctor');
      if (selectedDoctorRaw) {
        try {
          this.currentUser = JSON.parse(selectedDoctorRaw);
          console.log('Loaded doctor from localStorage:', this.currentUser);
        } catch (e) {
          console.error('Failed to parse selectedDoctor:', e);
          this.currentUser = null;
        }
      }
    }

    if (!this.currentUser?.doctorId) {
      // No doctor selected, redirect to doctor selection
      console.warn('No doctor ID found, redirecting to selection');
      this.router.navigate(['/doctor-selection']);
      return;
    }

    console.log('Doctor dashboard initialized for:', this.currentUser.name);

    this.upcomingWeekDays = this.generateWeekDays();
    this.selectedUpcomingDayIso = this.upcomingWeekDays[0]?.iso || '';

    this.patientService.getAppointments().subscribe((appointments) => {
      this.allAppointments = appointments || [];
      this.refreshDashboard();
    });

    this.patientService.getPatients().subscribe((patients) => {
      this.patientsMap = {};
      patients.forEach((p: any) => (this.patientsMap[p.id] = p));
      this.refreshDashboard();
    });
  }

  private refreshDashboard() {
    this.loadTodaysAppointments(this.allAppointments);
    this.loadUpcomingAppointments(this.allAppointments);
    this.loadPatientHistory(this.allAppointments);
  }

  private generateWeekDays(): CalendarDay[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() + index);
      return {
        date: day,
        label: day.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        shortLabel: day.toLocaleDateString(undefined, {
          weekday: 'short',
        }),
        iso: this.formatIsoDate(day),
      };
    });
  }

  private formatIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }

  private loadTodaysAppointments(appointments: any[]) {
    if (!this.currentUser?.doctorId) {
      this.todaysAppointments = [];
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    this.todaysAppointments = appointments
      .filter(
        (a) =>
          a.doctorId === this.currentUser.doctorId &&
          new Date(a.appointmentDate) >= todayStart &&
          new Date(a.appointmentDate) <= todayEnd &&
          a.status === 'Scheduled',
      )
      .sort(
        (x, y) =>
          new Date(x.appointmentDate).getTime() -
          new Date(y.appointmentDate).getTime(),
      )
      .map((a) => this.enrichAppointment(a));
  }

  private loadUpcomingAppointments(appointments: any[]) {
    if (!this.currentUser?.doctorId) {
      this.upcomingAppointmentsByDay = {};
      return;
    }

    const weeks = this.upcomingWeekDays.reduce(
      (acc, day) => ({ ...acc, [day.iso]: [] as any[] }),
      {} as Record<string, any[]>,
    );

    appointments
      .filter(
        (a) =>
          a.doctorId === this.currentUser.doctorId &&
          a.status === 'Scheduled' &&
          new Date(a.appointmentDate) >= new Date(),
      )
      .map((a) => this.enrichAppointment(a))
      .forEach((appt) => {
        const iso = this.formatIsoDate(new Date(appt.appointmentDate));
        if (weeks[iso]) {
          weeks[iso].push(appt);
        }
      });

    Object.keys(weeks).forEach((key) => {
      weeks[key] = weeks[key].sort(
        (x, y) =>
          new Date(x.appointmentDate).getTime() -
          new Date(y.appointmentDate).getTime(),
      );
    });

    this.upcomingAppointmentsByDay = weeks;
  }

  private loadPatientHistory(appointments: any[]) {
    if (!this.currentUser?.doctorId) {
      this.patientHistoryList = [];
      return;
    }

    const doctorAppointments = appointments.filter(
      (appt) => appt.doctorId === this.currentUser.doctorId,
    );

    const grouped = doctorAppointments.reduce(
      (acc: Record<string, any>, appt) => {
        const patient = this.patientsMap[appt.patientId] || {
          fullName: appt.patientId,
          medicalHistory: [],
        };
        if (!acc[appt.patientId]) {
          acc[appt.patientId] = {
            patientId: appt.patientId,
            patientName: patient.fullName,
            medicalHistory: patient.medicalHistory || [],
            appointments: [],
          };
        }
        acc[appt.patientId].appointments.push(this.enrichAppointment(appt));
        return acc;
      },
      {},
    );

    this.patientHistoryList = Object.values(grouped)
      .map((entry) => ({
        ...entry,
        appointmentCount: entry.appointments.length,
        lastVisit: new Date(
          Math.max(
            ...entry.appointments.map((a: any) =>
              new Date(a.appointmentDate).getTime(),
            ),
          ),
        ),
      }))
      .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());

    if (!this.selectedPatientId && this.patientHistoryList.length) {
      this.selectedPatientId = this.patientHistoryList[0].patientId;
    }
  }

  private enrichAppointment(a: any) {
    const appointmentDate = new Date(a.appointmentDate);
    return {
      ...a,
      patientName: this.patientsMap[a.patientId]?.fullName || a.patientId,
      medicalHistory: (
        this.patientsMap[a.patientId]?.medicalHistory || []
      ).join(', '),
      appointmentTime: this.formatTime(appointmentDate),
      appointmentDateObj: appointmentDate,
    };
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatFriendlyDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  get selectedUpcomingAppointments(): any[] {
    return this.upcomingAppointmentsByDay[this.selectedUpcomingDayIso] || [];
  }

  get selectedUpcomingDayLabel(): string {
    const selected = this.upcomingWeekDays.find(
      (day) => day.iso === this.selectedUpcomingDayIso,
    );
    return selected?.label || 'Selected day';
  }

  get selectedPatientDetail() {
    return this.patientHistoryList.find(
      (patient) => patient.patientId === this.selectedPatientId,
    );
  }

  getSortedAppointments(appointments: any[]): { future: any[]; past: any[] } {
    const now = new Date();
    const future = appointments
      .filter((appt) => new Date(appt.appointmentDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime(),
      );
    const past = appointments
      .filter((appt) => new Date(appt.appointmentDate) < now)
      .sort(
        (a, b) =>
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime(),
      );
    return { future, past };
  }

  selectSection(section: 'today' | 'upcoming' | 'history') {
    this.selectedSection = section;
  }

  selectUpcomingDay(iso: string) {
    this.selectedUpcomingDayIso = iso;
  }

  selectPatient(patientId: string) {
    this.selectedPatientId = patientId;
  }

  cancelAppointment(id: string) {
    this.patientService.cancelAppointment(id);
  }

  continueToPrescription(appt: any) {
    this.router.navigate(['/create-prescription'], {
      queryParams: { appointmentId: appt.id, patientId: appt.patientId },
    });
  }

  viewPrescription(appt: any) {
    this.router.navigate(['/create-prescription'], {
      queryParams: {
        appointmentId: appt.id,
        patientId: appt.patientId,
        viewMode: 'true',
      },
    });
  }

  goBackToDoctorSelection() {
    localStorage.removeItem('selectedDoctor');
    this.router.navigate(['/doctor-selection']);
  }
}
