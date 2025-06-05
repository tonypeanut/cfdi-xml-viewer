import { TestBed } from '@angular/core/testing';

import { XmlReaderService } from './xml-reader.service';

describe('XmlReaderService', () => {
  let service: XmlReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XmlReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
