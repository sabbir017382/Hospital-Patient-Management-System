import { Component, Input } from '@angular/core';
import { Patient } from 'src/app/core/models/patient';

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.css'],
})
export class PatientInfoComponent {
  @Input() patient: Patient | null = null;
}
