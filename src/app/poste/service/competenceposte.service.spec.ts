import { TestBed } from '@angular/core/testing';

import { CompetenceposteService } from './competenceposte.service';

describe('CompetenceposteService', () => {
  let service: CompetenceposteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompetenceposteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
