import { TestBed } from '@angular/core/testing';

import { EmergencyService } from './emergency.service';

describe('EmergencyService', () => {
  let service: EmergencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmergencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
