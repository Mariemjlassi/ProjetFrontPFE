import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployecompetenceComponent } from './employecompetence.component';

describe('EmployecompetenceComponent', () => {
  let component: EmployecompetenceComponent;
  let fixture: ComponentFixture<EmployecompetenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployecompetenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployecompetenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
