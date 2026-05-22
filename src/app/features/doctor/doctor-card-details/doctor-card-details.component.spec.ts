import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCardDetailsComponent } from './doctor-card-details.component';

describe('DoctorCardDetailsComponent', () => {
  let component: DoctorCardDetailsComponent;
  let fixture: ComponentFixture<DoctorCardDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorCardDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
