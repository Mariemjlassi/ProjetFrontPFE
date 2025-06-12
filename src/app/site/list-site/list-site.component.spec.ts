import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSiteComponent } from './list-site.component';

describe('ListSiteComponent', () => {
  let component: ListSiteComponent;
  let fixture: ComponentFixture<ListSiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
