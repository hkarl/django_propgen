import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {ModelFormComponent} from '../base/model.form.component';
import {ModelPropertyType} from '../../base/model.property.type';
import 'rxjs/add/operator/debounceTime';
import {MessageWindow, WindowService} from '../../../../shared/services/window.service';

@Component({
  selector: 'propgen-markdown-preview',
  templateUrl: './markdown-preview.component.html',
  styleUrls: ['./markdown-preview.component.css']
})
export class MarkdownPreviewComponent extends ModelFormComponent implements OnDestroy {
  constructor(protected windowService: WindowService) {
    super();
    this.formControl.valueChanges.subscribe((value) => {
      this.data = value;
    });
    this.dataChange.asObservable().debounceTime(600).subscribe(() => {
      this.updatePreviewPopoutData();
    })
  }
  get data() {
    return this.text;
  }
  @Input() set data(text: string) {
    if(text !== this.text) {
      this.text = text;
      this.dataChange.emit(text);
      this.formControl.setValue(text);
      if(this.previewWindow) {
        this.previewWindow.sendMessage('textUpdated', text);
      }
    }
  }
  @Output() dataChange = new EventEmitter<string>();
  private text: string;
  private _propertyDescription: ModelPropertyType;
  @Input() set propertyDescription(desc: ModelPropertyType) {
    this._propertyDescription = desc;
    this.updatePlaceholder(desc);
    this.updateHelpText(desc);
    this.formControl.setValidators(desc.validators);
  };
  public setPropertyDescription(desc: ModelPropertyType) {
    this.propertyDescription = desc;
  }
  ngOnDestroy() {
    this.closePreviewPopout();
  }
  public previewPopout = false;
  private previewWindow: MessageWindow = null;
  public onPopout() {
    if(!this.previewPopout) {
      // we currently do not have a window up, create one
      this.previewWindow = this.windowService.createWindow('/popout/markdown/');
      this.previewWindow.onClose.subscribe(() => {
        this.onPopoutClose();
      });
      // we need to delay updating until the popout finished loading
      // TODO: make this event based as well
      setTimeout(() => {
        this.updatePreviewPopoutData();
      }, 1500);
    }
    else {
      this.closePreviewPopout();
    }
  }
  public onPopoutClose() {
    if(this.previewWindow) {
      this.previewPopout = false;
      this.previewWindow = null;
    }
  }

  private closePreviewPopout() {
    if(this.previewWindow) {
      this.previewWindow.close();
    }
  }

  private updatePreviewPopoutData() {
    if(this.previewWindow) {
      console.log('Sending update');
      this.previewWindow.sendMessage('textUpdated', this.data);
      this.previewPopout = true;
    }
  }

}
