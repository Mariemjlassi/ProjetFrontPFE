import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveListeTypediplomeComponent } from './archive-liste-typediplome.component';

describe('ArchiveListeTypediplomeComponent', () => {
  let component: ArchiveListeTypediplomeComponent;
  let fixture: ComponentFixture<ArchiveListeTypediplomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveListeTypediplomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveListeTypediplomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
