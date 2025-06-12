import { TestBed } from '@angular/core/testing';

import { TypeDiplomeService } from './type-diplome.service';

describe('TypeDiplomeService', () => {
  let service: TypeDiplomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeDiplomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
