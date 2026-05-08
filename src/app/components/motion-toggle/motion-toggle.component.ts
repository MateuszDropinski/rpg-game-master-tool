import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccessibilityService } from '../../core/services/accessibility.service';

@Component({
  selector: 'app-motion-toggle',
  templateUrl: './motion-toggle.component.html',
  styleUrl: './motion-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionToggleComponent {
  private readonly accessibility = inject(AccessibilityService);

  protected readonly reduced = this.accessibility.disableCubeRotation;

  toggle() {
    this.accessibility.disableCubeRotation.update((v) => !v);
  }
}
