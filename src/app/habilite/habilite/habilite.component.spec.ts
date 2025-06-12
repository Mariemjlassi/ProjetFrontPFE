import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabiliteComponent } from './habilite.component';

describe('HabiliteComponent', () => {
  let component: HabiliteComponent;
  let fixture: ComponentFixture<HabiliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabiliteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabiliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
