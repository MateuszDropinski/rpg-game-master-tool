import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLock, phosphorLockOpen } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-lock-map-image-toggle',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorLock, phosphorLockOpen })],
  template: `
    <button
      type="button"
      class="lock-btn"
      [class.lock-btn--locked]="locked()"
      [title]="locked() ? 'Unlock map image' : 'Lock map image'"
      [attr.aria-pressed]="locked()"
      (click)="toggleLock.emit()"
    >
      <ng-icon
        [name]="locked() ? 'phosphorLock' : 'phosphorLockOpen'"
        size="16"
      />
      <span>{{ locked() ? 'Locked' : 'Unlocked' }}</span>
    </button>
  `,
  styles: `
    :host {
      position: absolute;
      bottom: 80px;
      left: 24px;
      z-index: 10;
    }

    .lock-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--space-2, 8px) 12px;
      border-radius: var(--radius-sm, 8px);
      border: none;
      background: var(--color-bg-overlay, #292735);
      color: var(--color-text-secondary, #cac5db);
      font: 13px/1.2 system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .lock-btn:hover {
      background: color-mix(in srgb, var(--color-bg-overlay, #292735) 100%, white 6%);
      color: var(--color-text-primary, #e5e2f1);
    }

    .lock-btn--locked {
      color: #ffd76a;
    }
  `,
})
export class LockMapImageToggleComponent {
  readonly locked = input.required<boolean>();
  readonly toggleLock = output<void>();
}
