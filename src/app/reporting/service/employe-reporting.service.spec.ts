import { TestBed } from '@angular/core/testing';

import { EmployeReportingService } from './employe-reporting.service';

describe('EmployeReportingService', () => {
  let service: EmployeReportingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeReportingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
