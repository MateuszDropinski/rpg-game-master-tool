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
  phosphorAxe,
  phosphorFlame,
  phosphorHeart,
  phosphorMagicWand,
  phosphorMaskHappy,
  phosphorPawPrint,
  phosphorPlus,
  phosphorShield,
  phosphorTarget,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';

export type CharacterType = {
  id: string;
  label: string;
  icon: string;
  hp: number;
};

export const CHARACTER_TYPES: CharacterType[] = [
  { id: 'wizard',    label: 'Wizard',    icon: 'phosphorMagicWand', hp: 60  },
  { id: 'dragon',    label: 'Dragon',    icon: 'phosphorFlame',     hp: 200 },
  { id: 'wolf',      label: 'Wolf',      icon: 'phosphorPawPrint',  hp: 40  },
  { id: 'knight',    label: 'Knight',    icon: 'phosphorShield',    hp: 120 },
  { id: 'rogue',     label: 'Rogue',     icon: 'phosphorMaskHappy', hp: 75  },
  { id: 'archer',    label: 'Archer',    icon: 'phosphorTarget',    hp: 80  },
  { id: 'cleric',    label: 'Cleric',    icon: 'phosphorHeart',     hp: 90  },
  { id: 'barbarian', label: 'Barbarian', icon: 'phosphorAxe',       hp: 150 },
];

@Component({
  selector: 'app-add-character-dialog',
  imports: [NgIcon],
  providers: [
    provideIcons({
      phosphorX,
      phosphorPlus,
      phosphorMagicWand,
      phosphorFlame,
      phosphorPawPrint,
      phosphorShield,
      phosphorMaskHappy,
      phosphorTarget,
      phosphorHeart,
      phosphorAxe,
    }),
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
