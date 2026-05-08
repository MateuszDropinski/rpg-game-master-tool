import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPlus, phosphorX } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-upload-map-dialog',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorPlus, phosphorX })],
  templateUrl: './upload-map-dialog.component.html',
  styleUrl: './upload-map-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadMapDialogComponent {
  open = input(false);
  cancel = output<void>();
  submit = output<{ name: string; file: File }>();

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly name = signal('');
  readonly file = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly canSubmit = computed(() => this.name().trim().length > 0 && this.file() !== null);

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      if (this.open()) {
        if (!dialog.open) dialog.showModal();
      } else {
        if (dialog.open) dialog.close();
        this.resetForm();
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0] ?? null;
    this.revokePreview();
    this.file.set(selected);
    this.previewUrl.set(selected ? URL.createObjectURL(selected) : null);
    if (selected && !this.name().trim()) {
      this.name.set(stripExtension(selected.name));
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const file = this.file();
    const name = this.name().trim();
    if (!file || !name) return;
    this.submit.emit({ name, file });
  }

  onCancel() {
    this.cancel.emit();
  }

  onDialogClose() {
    if (this.open()) this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent) {
    const dialog = this.dialogRef()?.nativeElement;
    if (event.target === dialog) {
      this.cancel.emit();
    }
  }

  private resetForm() {
    this.name.set('');
    this.file.set(null);
    this.revokePreview();
  }

  private revokePreview() {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
  }
}

function stripExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(0, dot) : filename;
}
