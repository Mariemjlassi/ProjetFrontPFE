import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationEmployeComponent } from './formation-employe.component';

describe('FormationEmployeComponent', () => {
  let component: FormationEmployeComponent;
  let fixture: ComponentFixture<FormationEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationEmployeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
