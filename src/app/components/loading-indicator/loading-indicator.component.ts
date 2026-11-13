import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss',
})
export class LoadingIndicatorComponent {
  @Input() label = 'Loading...';
}
