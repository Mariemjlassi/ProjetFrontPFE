import { TestBed } from '@angular/core/testing';

import { HabiliteService } from './habilite.service';

describe('HabiliteService', () => {
  let service: HabiliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabiliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
