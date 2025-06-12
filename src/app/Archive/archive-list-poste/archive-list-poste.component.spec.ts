import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveListPosteComponent } from './archive-list-poste.component';

describe('ArchiveListPosteComponent', () => {
  let component: ArchiveListPosteComponent;
  let fixture: ComponentFixture<ArchiveListPosteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveListPosteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveListPosteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
