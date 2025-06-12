import { TestBed } from '@angular/core/testing';

import { EnteteService } from './entete.service';

describe('EnteteService', () => {
  let service: EnteteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnteteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
