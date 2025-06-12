import { TestBed } from '@angular/core/testing';

import { DiplomeService } from './diplome.service';

describe('DiplomeService', () => {
  let service: DiplomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiplomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
