import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PatientService } from 'src/app/core/service/patient.service';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { Patient } from 'src/app/core/models/patient';
import { Appointment } from 'src/app/core/models/appoinment';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentModalComponent } from 'src/app/features/Appointment/appointment-modal/appointment-modal.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit, AfterViewInit {
  patients$!: Observable<Patient[]>;
  doctors$!: Observable<any[]>;
  allPatients: Patient[] = [];
  displayedColumns: string[] = [
    'select',
    'id',
    'fullName',
    'dob',
    'bloodGroup',
    'gender',
    'insuranceType',
    'actions',
  ];
  // displayedColumnForDoctors: string[] = [
  //   'id',
  //   'name',
  //   'specialty',
  //   'availability',
  // ];

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  getAppointmentsForPatient(patientId: string): Appointment[] {
    return this.patientService.getAppointmentsByPatient(patientId);
  }

  ngOnInit() {
    this.patients$ = this.patientService.getPatients();
    this.doctors$ = this.doctorService.getDoctors();

    this.patients$.subscribe((data) => {
      this.allPatients = data;
      this.filteredPatients = data;
      this.dataSource.data = data;
    });
  }

  //for search

  searchTerm: string = '';
  filteredPatients: Patient[] = [];

  onSearch(event: any) {
    const value = event.target.value.toLowerCase();
    this.searchTerm = value;

    this.filteredPatients = this.allPatients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(value) ||
        p.phone.toLowerCase().includes(value) ||
        p.bloodGroup.toLowerCase().includes(value),
    );
    this.dataSource.data = this.filteredPatients; // dataSource updated
    // this.dataSource.sort = this.sort; //for sort
  }
  //Filter
  genderFilter: string = '';
  insuranceFilter: string = '';
  bloodGroupFilter: string = '';
  applyFilters() {
    this.patients$.subscribe((patients) => {
      this.filteredPatients = patients.filter((p) => {
        const genderMatch = this.genderFilter
          ? p.gender === this.genderFilter
          : true;

        const insuranceMatch = this.insuranceFilter
          ? p.insuranceType === this.insuranceFilter
          : true;

        const bloodMatch = this.bloodGroupFilter
          ? p.bloodGroup === this.bloodGroupFilter
          : true;

        return genderMatch && insuranceMatch && bloodMatch;
      });
      this.dataSource.data = this.filteredPatients; // dataSource updated
      this.dataSource.sort = this.sort;
    });
  }
  ///////////filter Close///////////
  ///Sort//

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Patient>([]);
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  ///////mat sort close///////

  ////MUlti Select and delete ////
  selection = new SelectionModel<Patient>(true, []);
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  deleteSelected() {
    const selectedIds = this.selection.selected.map((p) => p.id);
    this.patientService.deletePatients(selectedIds);
    // Update UI
    const remaining = this.dataSource.data.filter(
      (p) => !selectedIds.includes(p.id),
    );
    this.allPatients = this.allPatients.filter(
      (p) => !selectedIds.includes(p.id),
    );
    this.dataSource.data = remaining;
    this.selection.clear();
  }

  exportSelectedToCSV() {
    if (this.selection.isEmpty()) {
      return;
    }
    this.downloadCSV(this.selection.selected, 'selected-patients.csv');
  }

  exportVisibleToCSV() {
    this.downloadCSV(this.dataSource.data, 'visible-patients.csv');
  }
  //for dymanically handle export
  exportCSV() {
    if (this.selection.isEmpty()) {
      this.exportVisibleToCSV();
    } else {
      this.exportSelectedToCSV();
    }
  }
  /////CSV export logic
  private downloadCSV(patients: Patient[], fileName: string) {
    const headers = [
      'ID',
      'Name',
      'DOB',
      'Blood Group',
      'Gender',
      'Phone',
      'Email',
      'Address',
      'Insurance',
      'Registered At',
      'Emergency Contact',
      'Medical History',
    ];

    const rows = patients.map((patient) => [
      patient.id,
      patient.fullName,
      this.formatDate(patient.dob),
      patient.bloodGroup,
      patient.gender,
      patient.phone,
      patient.email,
      patient.address,
      patient.insuranceType,
      this.formatDate(patient.registeredAt),
      patient.emergencyContact,
      patient.medicalHistory.join('; '),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => '"' + String(value ?? '').replace(/"/g, '""') + '"')
          .join(','),
      )
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private formatDate(value: Date | string | undefined): string {
    if (!value) {
      return '';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toISOString().slice(0, 10);
  }

  confirmDelete() {
    const dialogRef = this.dialog.open(DeleteConfirmDialog);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteSelected();
      }
    });
  }

  //open appointment modal
  openAppointmentModal(patient?: any, appointment?: any) {
    const dialogRef = this.dialog.open(AppointmentModalComponent, {
      width: '520px',
      data: { patient, appointment },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Appointment saved', 'OK', {
          duration: 2000,
        });
      }
    });
  }

  viewPatient(id: string) {
    this.router.navigate(['/patients', id]);
  }

  editPatient(id: string) {
    this.router.navigate(['/patients', id, 'edit']);
  }
  //for single delete
  deletePatient(id: string) {
    const dialogRef = this.dialog.open(DeleteConfirmDialog);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.patientService.deletePatients([id]);
      }
    });
  }
}

////for reuse delete confirmation dialog written here//////
@Component({
  selector: 'delete-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Delete</h2>
    <mat-dialog-content>
      Are you sure you want to delete selected patients?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        Delete
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialog {}
