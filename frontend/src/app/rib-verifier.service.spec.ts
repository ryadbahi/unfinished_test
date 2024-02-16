import { TestBed } from '@angular/core/testing';

import { RibVerifierService } from './rib-verifier.service';

describe('RibVerifierService', () => {
  let service: RibVerifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RibVerifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
