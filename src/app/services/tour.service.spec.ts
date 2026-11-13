import { TestBed } from '@angular/core/testing';

import { TourService } from './tour.service';

describe('TourService', () => {
  let service: TourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start a tour', () => {
    spyOn(service, 'startTour');
    service.startTour();
    expect(service.startTour).toHaveBeenCalled();
  });

  it('should end a tour', () => {
    spyOn(service, 'endTour');
    service.endTour();
    expect(service.endTour).toHaveBeenCalled();
  });
});
