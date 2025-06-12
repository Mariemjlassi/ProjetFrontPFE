import { TestBed } from '@angular/core/testing';

import { EmoloyeService } from './emoloye.service';

describe('EmoloyeService', () => {
  let service: EmoloyeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmoloyeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
