import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorPlus,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import {
  CHARACTER_TYPES,
  type CharacterType,
} from '../../models/character.model';

@Component({
  selector: 'app-add-character-dialog',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorX, phosphorPlus }),
  ],
  templateUrl: './add-character-dialog.component.html',
  styleUrl: './add-character-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCharacterDialogComponent {
  open = input(false);
  cancel = output<void>();
  submit = output<CharacterType>();

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly selected = signal<CharacterType | null>(null);
  readonly characterTypes = CHARACTER_TYPES;

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      if (this.open()) {
        if (!dialog.open) dialog.showModal();
      } else {
        if (dialog.open) dialog.close();
        this.selected.set(null);
      }
    });
  }

  onSelect(type: CharacterType) {
    this.selected.set(type);
  }

  onSubmit() {
    const type = this.selected();
    if (!type) return;
    this.submit.emit(type);
  }

  onCancel() {
    this.cancel.emit();
  }

  onDialogClose() {
    if (this.open()) this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent) {
    const dialog = this.dialogRef()?.nativeElement;
    if (event.target === dialog) this.cancel.emit();
  }
}
