import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetallEmployeexistantComponent } from './getall-employeexistant.component';

describe('GetallEmployeexistantComponent', () => {
  let component: GetallEmployeexistantComponent;
  let fixture: ComponentFixture<GetallEmployeexistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetallEmployeexistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetallEmployeexistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
