import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheck,
  phosphorNote,
  phosphorPencilSimple,
} from '@ng-icons/phosphor-icons/regular';
import {
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram';
import { NoteData } from '../../../models/note.model';
import { NotesStore } from '../../../state/notes.store';

@Component({
  selector: 'app-note-node',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorCheck, phosphorNote, phosphorPencilSimple }),
  ],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './note-node.component.html',
  styleUrl: './note-node.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteNodeComponent implements NgDiagramNodeTemplate<NoteData> {
  private readonly store = inject(NotesStore);

  node = input.required<Node<NoteData>>();

  protected readonly editing = signal(false);
  protected readonly draftText = signal('');

  startEdit(): void {
    this.draftText.set(this.node().data.text);
    this.editing.set(true);
  }

  onDraftInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.draftText.set(target.value);
  }

  save(): void {
    if (!this.editing()) {
      return;
    }
    this.store.updateText(this.node().id, this.draftText());
    this.editing.set(false);
  }
}
