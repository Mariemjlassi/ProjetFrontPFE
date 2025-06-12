import { TestBed } from '@angular/core/testing';

import { JournalActionService } from './journal-action.service';

describe('JournalActionService', () => {
  let service: JournalActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
