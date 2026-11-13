import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { AnalyticsService } from '../../services/analytics.service';
import { OpenWhenComponent } from './open-when.component';

describe('OpenWhenComponent', () => {
  let fixture: ComponentFixture<OpenWhenComponent>;
  let configs: BehaviorSubject<Map<string, string>>;
  let track: jasmine.Spy;

  beforeEach(async () => {
    configs = new BehaviorSubject(new Map<string, string>());
    track = jasmine.createSpy('track');
    await TestBed.configureTestingModule({
      imports: [OpenWhenComponent],
      providers: [
        provideRouter([]),
        {
          provide: ConfigService,
          useValue: { getConfigs: () => configs.asObservable() },
        },
        { provide: AnalyticsService, useValue: { track } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenWhenComponent);
    fixture.detectChanges();
  });

  it('shows a configuration message when database notes are missing', () => {
    expect(fixture.nativeElement.querySelectorAll('.note-card').length).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('not been configured');
  });

  it('opens and closes a note accessibly', () => {
    configs.next(
      new Map([
        [
          'open-when-notes',
          JSON.stringify([
            {
              id: 'custom',
              prompt: 'Open when you need a pause',
              title: 'Take a breath',
              message: 'There is no rush.',
            },
          ]),
        ],
      ]),
    );
    fixture.detectChanges();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.note-toggle');

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.note-message')).toBeTruthy();
    expect(track).toHaveBeenCalledOnceWith('OPEN_WHEN_NOTE_OPEN');

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(
      fixture.nativeElement.querySelector('.note-message').hasAttribute('hidden'),
    ).toBeTrue();
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('tracks replaying the journey', () => {
    fixture.componentInstance.replayJourney();

    expect(track).toHaveBeenCalledOnceWith('JOURNEY_REPLAY');
  });

  it('uses database-managed notes when configured', () => {
    configs.next(
      new Map([
        [
          'open-when-notes',
          JSON.stringify([
            {
              id: 'custom',
              prompt: 'Open when you need a pause',
              title: 'Take a breath',
              message: 'There is no rush.',
            },
          ]),
        ],
      ]),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.note-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Open when you need a pause');
  });

  it('shows an error instead of hiding malformed database notes', () => {
    configs.next(new Map([['open-when-notes', '{not json}']]));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('not valid JSON');
  });
});
