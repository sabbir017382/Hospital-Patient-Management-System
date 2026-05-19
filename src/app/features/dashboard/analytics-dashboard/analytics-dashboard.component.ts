import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartOptions,
  ChartType,
  registerables,
} from 'chart.js';
import { Subscription } from 'rxjs';
import { Appointment } from 'src/app/core/models/appoinment';
import { Patient } from 'src/app/core/models/patient';
import { PatientService } from 'src/app/core/service/patient.service';

Chart.register(...registerables);

interface StatusLegendItem {
  label: string;
  count: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css'],
})
export class AnalyticsDashboardComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(BaseChartDirective) barChart?: BaseChartDirective;
  @ViewChild('doughnutChart') doughnutChart?: BaseChartDirective;

  totalPatients = 0;
  totalAppointments = 0;
  upcomingAppointments = 0;
  completionRate = 0;

  recentAppointments: Appointment[] = [];
  patientsMap: Record<string, Patient> = {};
  doctorsMap: Record<string, string> = {};

  ageGroups = ['Child', 'Teen', 'Young Adult', 'Adult', 'Senior'];

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.ageGroups,
    datasets: [
      {
        label: 'Patients by Age Group',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [],
        borderRadius: 8,
      },
    ],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f1f1' },
      },
    },
  };

  barChartType: 'bar' = 'bar';

  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#2196f3', '#4caf50', '#f44336', '#ff9800'],
        hoverOffset: 8,
      },
    ],
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce(
              (sum, item) => sum + item,
              0,
            );
            const percent = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  doughnutChartType: 'doughnut' = 'doughnut';

  statusLegend: StatusLegendItem[] = [
    { label: 'Scheduled', count: 0, percent: 0, color: '#2196f3' },
    { label: 'Completed', count: 0, percent: 0, color: '#4caf50' },
    { label: 'Cancelled', count: 0, percent: 0, color: '#f44336' },
    { label: 'No-show', count: 0, percent: 0, color: '#ff9800' },
  ];

  private subscriptions: Subscription[] = [];

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.patientService.getPatients().subscribe((patients) => {
        this.patientsMap = {};
        patients.forEach((patient) => {
          this.patientsMap[patient.id] = patient;
        });
        this.totalPatients = patients.length;
        this.updatePatientChart(patients);
      }),
    );

    this.subscriptions.push(
      this.patientService.getAppointments().subscribe((appointments) => {
        if (this.cancelMissedAppointments(appointments)) {
          return;
        }
        this.totalAppointments = appointments.length;
        this.upcomingAppointments =
          this.patientService.getUpcomingAppointments().length;
        this.updateAppointmentCharts(appointments);
        this.recentAppointments = [...appointments]
          .sort(
            (a, b) =>
              new Date(b.appointmentDate).getTime() -
              new Date(a.appointmentDate).getTime(),
          )
          .slice(0, 5);
      }),
    );

    this.subscriptions.push(
      this.patientService.getDoctors().subscribe((doctors) => {
        this.doctorsMap = {};
        doctors.forEach((doctor) => {
          this.doctorsMap[doctor.id] = doctor.name;
        });
      }),
    );
  }

  ngAfterViewInit(): void {
    this.applyBarGradient();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getDoctorName(id: string): string {
    return this.doctorsMap[id] || id;
  }

  getPatientName(id: string): string {
    return this.patientsMap[id]?.fullName || id;
  }

  private updatePatientChart(patients: Patient[]): void {
    const counts = [0, 0, 0, 0, 0];
    patients.forEach((patient) => {
      const age = this.calculateAge(patient.dob);
      if (age <= 12) {
        counts[0] += 1;
      } else if (age <= 17) {
        counts[1] += 1;
      } else if (age <= 35) {
        counts[2] += 1;
      } else if (age <= 60) {
        counts[3] += 1;
      } else {
        counts[4] += 1;
      }
    });
    this.barChartData.datasets[0].data = counts;
    this.applyBarGradient();
  }

  private updateAppointmentCharts(appointments: Appointment[]): void {
    const statusCounts = {
      Scheduled: 0,
      Completed: 0,
      Cancelled: 0,
      'No-show': 0,
    };

    appointments.forEach((appointment) => {
      statusCounts[appointment.status] =
        (statusCounts[appointment.status] || 0) + 1;
    });

    const values = [
      statusCounts.Scheduled,
      statusCounts.Completed,
      statusCounts.Cancelled,
      statusCounts['No-show'],
    ];

    const total = values.reduce((sum, value) => sum + value, 0);

    // Reassign data object to trigger Angular change detection
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: values,
        },
      ],
    };

    this.statusLegend = [
      {
        label: 'Scheduled',
        count: statusCounts.Scheduled,
        percent: total ? Math.round((statusCounts.Scheduled / total) * 100) : 0,
        color: '#2196f3',
      },
      {
        label: 'Completed',
        count: statusCounts.Completed,
        percent: total ? Math.round((statusCounts.Completed / total) * 100) : 0,
        color: '#4caf50',
      },
      {
        label: 'Cancelled',
        count: statusCounts.Cancelled,
        percent: total ? Math.round((statusCounts.Cancelled / total) * 100) : 0,
        color: '#f44336',
      },
      {
        label: 'No-show',
        count: statusCounts['No-show'],
        percent: total
          ? Math.round((statusCounts['No-show'] / total) * 100)
          : 0,
        color: '#ff9800',
      },
    ];

    this.completionRate = total
      ? Math.round((statusCounts.Completed / total) * 100)
      : 0;

    // Refresh the doughnut chart to apply color changes
    if (this.doughnutChart?.chart) {
      this.doughnutChart.update();
    }
  }

  private calculateAge(dob: Date | string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }
    return age;
  }

  completeAppointment(appointment: Appointment): void {
    this.patientService.updateAppointment(appointment.id, {
      status: 'Completed',
    });
  }

  private cancelMissedAppointments(appointments: Appointment[]): boolean {
    const now = new Date();
    let didCancel = false;
    appointments.forEach((appointment) => {
      if (
        appointment.status === 'Scheduled' &&
        new Date(appointment.appointmentDate) < now
      ) {
        this.patientService.cancelAppointment(appointment.id);
        didCancel = true;
      }
    });
    return didCancel;
  }

  private applyBarGradient(): void {
    if (!this.barChart?.chart) {
      return;
    }

    const chart = this.barChart.chart;
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    if (!chartArea) {
      return;
    }

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top,
    );
    gradient.addColorStop(0, '#2196f3');
    gradient.addColorStop(1, '#7c4dff');
    this.barChartData.datasets[0].backgroundColor = gradient as any;
    this.barChart.update();
  }
}
