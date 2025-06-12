import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveListDirectionComponent } from './archive-list-direction.component';

describe('ArchiveListDirectionComponent', () => {
  let component: ArchiveListDirectionComponent;
  let fixture: ComponentFixture<ArchiveListDirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveListDirectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveListDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
