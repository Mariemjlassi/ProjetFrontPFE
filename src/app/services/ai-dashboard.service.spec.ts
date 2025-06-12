import { TestBed } from '@angular/core/testing';

import { AiDashboardService } from './ai-dashboard.service';

describe('AiDashboardService', () => {
  let service: AiDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
