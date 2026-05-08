import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPlus } from '@ng-icons/phosphor-icons/regular';
import { MapEntry } from '../../models/map.model';
import { UploadMapDialogComponent } from '../upload-map-dialog/upload-map-dialog.component';

@Component({
  selector: 'app-map-switcher',
  imports: [NgIcon, UploadMapDialogComponent],
  providers: [provideIcons({ phosphorPlus })],
  templateUrl: './map-switcher.component.html',
  styleUrl: './map-switcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapSwitcherComponent {
  maps = input.required<MapEntry[]>();
  activeMapId = input.required<string>();
  activate = output<string>();
  add = output<{ name: string; file: File }>();

  readonly dialogOpen = signal(false);

  onActivate(id: string) {
    this.activate.emit(id);
  }

  openDialog() {
    this.dialogOpen.set(true);
  }

  onDialogCancel() {
    this.dialogOpen.set(false);
  }

  onDialogSubmit(payload: { name: string; file: File }) {
    this.add.emit(payload);
    this.dialogOpen.set(false);
  }
}
