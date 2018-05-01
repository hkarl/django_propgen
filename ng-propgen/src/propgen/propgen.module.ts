import { NgModule } from '@angular/core';
import {MenuComponent} from './components/menu/menu.component';
import {
  MatButtonModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule,
  MatMenuModule, MatPaginatorModule,
  MatProgressSpinnerModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule, MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {SortableListComponent} from './components/sortable-list/sortable-list.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {SortablejsModule} from 'angular-sortablejs';
import {MarkdownModule} from 'ngx-md';
import {DetailEditorComponent} from './components/detail-editor/detail-editor.component';
import {MarkdownPreviewComponent} from './modelcreator/formcomponents/markdown-preview/markdown-preview.component';
import {StringFormComponent} from './modelcreator/formcomponents/string.form.component';
import {NumberFormComponent} from './modelcreator/formcomponents/number.form.component';
import {ForeignKeyFormComponent} from './modelcreator/formcomponents/foreign.form.component';
import {AutomaticModelFormComponent} from './components/automatic-model-form/automatic-model-form.component';
import {AutomaticModelFormListComponent} from './components/automatic-model-form-list/automatic-model-form-list.component';
import {TextFormComponent} from './modelcreator/formcomponents/text.form.component';
import {ForeignManyFormComponent} from './modelcreator/formcomponents/foreign-many.form.component';
import {EmailFormComponent} from './modelcreator/formcomponents/email.form.component';
import {BooleanFormComponent} from './modelcreator/formcomponents/boolean.form.component';
import {AutomaticModelFormVersionListComponent} from './components/automatic-model-form-version-list/automatic-model-form-version-list.component';
import {AutomaticModelFormVersionComponent} from './components/automatic-model-form-version/automatic-model-form-version.component';
import {ReorderService} from './services/reorder.service';
import {AutomatedBackendService} from './services/automated-backend.service';
import {CatchAllComponent} from './components/catch-all/catch-all.component';
import {DefaultBackendService} from './services/default-backend.service';

import {AutomatedShakePreventionService} from './services/automated-shake-prevention.service';
import {CommonModule} from '@angular/common';
import {PropgenSharedModule} from '../shared/shared.module';
import {CrossTableComponent} from './components/cross-table/cross-table.component';
import {TaskPartnerEffortComponent} from './components/task-partner-effort/task-partner-effort.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {DeliverablePartnerTaskEffortComponent} from './components/deliverable-partner-task-effort/deliverable-partner-task-effort.component';
import {MilestonePartnerTaskEffortComponent} from './components/milestone-partner-task-effort/milestone-partner-task-effort.component';
import {InstantiationDialogComponent} from './components/menu/dialogs/instantiation.dialog.component';
import {CreateLatexDialogComponent} from './components/menu/dialogs/create-latex.dialog.component';
import {RunLatexDialogComponent} from './components/menu/dialogs/run-latex.dialog.component';

const catchAll: Routes = [
  {
    path: '',
    component: MenuComponent,
  },
  {
    path: 'taskpartnerpms',
    component: TaskPartnerEffortComponent,
  },
  {
    path: 'deliverablepartnertaskpms',
    component: DeliverablePartnerTaskEffortComponent,
  },
  {
    path: 'milestonepartnertaskpms',
    component: MilestonePartnerTaskEffortComponent,
  },
  {
    path: '**',
    component: CatchAllComponent,
  }
];

@NgModule({
  declarations: [
    AutomaticModelFormComponent,
    AutomaticModelFormListComponent,
    AutomaticModelFormVersionComponent,
    AutomaticModelFormVersionListComponent,
    CatchAllComponent,
    CreateLatexDialogComponent,
    CrossTableComponent,
    DeliverablePartnerTaskEffortComponent,
    DetailEditorComponent,
    InstantiationDialogComponent,
    MenuComponent,
    MilestonePartnerTaskEffortComponent,
    RootComponent,
    RunLatexDialogComponent,
    SortableListComponent,
    TaskPartnerEffortComponent,

    BooleanFormComponent,
    EmailFormComponent,
    ForeignKeyFormComponent,
    ForeignManyFormComponent,
    NumberFormComponent,
    MarkdownPreviewComponent,
    StringFormComponent,
    TextFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(catchAll),

    SortablejsModule,
    MarkdownModule,
    NgxDatatableModule,

    PropgenSharedModule,

    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,

  ],
  providers: [
    ReorderService,
    AutomatedBackendService,
    DefaultBackendService,

    AutomatedShakePreventionService,
  ],
  bootstrap: [],
  exports: [
    MenuComponent,
    RootComponent,
    RouterModule,
  ],
  entryComponents: [
    CreateLatexDialogComponent,
    InstantiationDialogComponent,
    RunLatexDialogComponent,
  ]
})
export class PropgenModule {
  constructor(dummy: AutomatedShakePreventionService) {
    dummy.initialize();
  }
}
