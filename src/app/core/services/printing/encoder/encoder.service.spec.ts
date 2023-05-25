import { TestBed } from '@angular/core/testing';

import { EncoderService } from './encoder.service';

describe('EncoderService', () => {
  let service: EncoderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncoderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
