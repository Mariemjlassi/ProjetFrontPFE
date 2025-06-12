import { TestBed } from '@angular/core/testing';

import { EmployecompetenceService } from './employecompetence.service';

describe('EmployecompetenceService', () => {
  let service: EmployecompetenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployecompetenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
