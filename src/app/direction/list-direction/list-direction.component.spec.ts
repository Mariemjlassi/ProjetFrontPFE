import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDirectionComponent } from './list-direction.component';

describe('ListDirectionComponent', () => {
  let component: ListDirectionComponent;
  let fixture: ComponentFixture<ListDirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDirectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
