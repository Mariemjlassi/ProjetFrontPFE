import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererDiplomeComponent } from './gerer-diplome.component';

describe('GererDiplomeComponent', () => {
  let component: GererDiplomeComponent;
  let fixture: ComponentFixture<GererDiplomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererDiplomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GererDiplomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
