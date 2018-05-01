import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SortableEntity} from '../../model/SortableEntity';

@Component({
  selector: 'propgen-sortable-list',
  templateUrl: './sortable-list.component.html'
})
export class SortableListComponent {
  @Input() title: string;
  @Input() entities: SortableEntity[];
  @Input() hasVersioning: boolean = false;
  @Input() canReorder: boolean = false;
  @Input() canDelete: boolean = false;
  @Output() onCreateEntity = new EventEmitter();
  @Output() onEditEntity = new EventEmitter<SortableEntity>();
  @Output() onReorder = new EventEmitter<SortableEntity[]>();
  @Output() onVersionEntity = new EventEmitter<SortableEntity>();
  @Output() onDeleteEntity = new EventEmitter<SortableEntity>();

  public sortableOptions = {
    // see https://github.com/RubaXa/Sortable#options
    handle: '.sort-handle',
    onUpdate: ($event) => this.onDropSuccessful($event)
  };

  public onAddButtonClick() {
    this.onCreateEntity.emit();
  }

  public onEditButtonClick(entity: SortableEntity) {
    this.onEditEntity.emit(entity);
  }

  public onDropSuccessful($event) {
    this.onReorder.emit(this.entities);
  }

  public onVersionButtonClick(entity: SortableEntity) {
    this.onVersionEntity.emit(entity);
  }

  public onDeleteButtonClick(entity: SortableEntity) {
    this.onDeleteEntity.emit(entity);
  }

}
