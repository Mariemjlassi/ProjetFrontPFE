import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarexmplComponent } from './navbarexmpl.component';

describe('NavbarexmplComponent', () => {
  let component: NavbarexmplComponent;
  let fixture: ComponentFixture<NavbarexmplComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarexmplComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarexmplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
