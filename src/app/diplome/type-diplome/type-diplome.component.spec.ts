import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDiplomeComponent } from './type-diplome.component';

describe('TypeDiplomeComponent', () => {
  let component: TypeDiplomeComponent;
  let fixture: ComponentFixture<TypeDiplomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeDiplomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeDiplomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
