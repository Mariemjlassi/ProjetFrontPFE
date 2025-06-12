import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveListSiteComponent } from './archive-list-site.component';

describe('ArchiveListSiteComponent', () => {
  let component: ArchiveListSiteComponent;
  let fixture: ComponentFixture<ArchiveListSiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveListSiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveListSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
