import { TestBed } from '@angular/core/testing';

import { RecrutementService } from './recrutement.service';

describe('RecrutementService', () => {
  let service: RecrutementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecrutementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
