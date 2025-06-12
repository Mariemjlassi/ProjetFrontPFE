import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationResponsableComponent } from './formation-responsable.component';

describe('FormationResponsableComponent', () => {
  let component: FormationResponsableComponent;
  let fixture: ComponentFixture<FormationResponsableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationResponsableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationResponsableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
