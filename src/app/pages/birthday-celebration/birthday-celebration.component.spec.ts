import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { BirthdayCelebrationComponent } from './birthday-celebration.component';

describe('BirthdayCelebrationComponent', () => {
  let component: BirthdayCelebrationComponent;
  let fixture: ComponentFixture<BirthdayCelebrationComponent>;
  let configService: jasmine.SpyObj<ConfigService>;

  beforeEach(async () => {
    configService = jasmine.createSpyObj<ConfigService>('ConfigService', [
      'getConfigs',
      'getLoading',
    ]);
    configService.getConfigs.and.returnValue(of(new Map<string, string>()));
    configService.getLoading.and.returnValue(of(false));
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BirthdayCelebrationComponent],
      providers: [
        { provide: ConfigService, useValue: configService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BirthdayCelebrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the celebration page', () => {
    expect(component).toBeTruthy();
    expect(component.balloons.length).toBe(3);
  });

  it('pops the next balloon when a non-navigation key is pressed', () => {
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'x' }));

    expect(component.poppedBalloons.size).toBe(1);
    expect(component.phase).toBe('balloons');
  });

  it('does not pop balloons for Tab or repeated key events', () => {
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    component.handleKeydown(
      new KeyboardEvent('keydown', { key: 'x', repeat: true }),
    );

    expect(component.poppedBalloons.size).toBe(0);
  });
});
