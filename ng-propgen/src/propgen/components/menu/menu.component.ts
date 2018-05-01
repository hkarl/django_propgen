import { Component } from '@angular/core';
import {DefaultBackendService} from '../../services/default-backend.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {InstantiationDialogComponent} from './dialogs/instantiation.dialog.component';
import {CreateLatexDialogComponent} from './dialogs/create-latex.dialog.component';
import {RunLatexDialogComponent, RunLatexResponse} from './dialogs/run-latex.dialog.component';

export type InstantiateResponse = {
  obj: {
    id: number;
    name: string;
  }
  result: string;
}

@Component({
  selector: 'propgen-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  public loading: boolean = false;
  constructor(private http: HttpClient, private dialog: MatDialog) {
  }
  private dispatchJob(endpoint: string, fn) {
    this.loading = true;
    this.http.get(DefaultBackendService.baseUrl + endpoint).toPromise().then((data) => {
      fn(data);
      this.loading = false;
    }).catch((error) => {
      console.error(error);
      this.loading = false;
    });
  }

  public instantiate() {
    this.dispatchJob('/instantiate/', (statusResponse: {bibresults: InstantiateResponse[], results: InstantiateResponse[], tbresults: InstantiateResponse[]}) => {
      this.dialog.open(InstantiationDialogComponent, {
        width: '70vw',
        data: [statusResponse.tbresults, statusResponse.results, statusResponse.bibresults]
      });
    });
  }
  public createLatex() {
    this.dispatchJob('/createLatex/', (statusResponse: {results: {[key:string]: string}}) => {
      this.dialog.open(CreateLatexDialogComponent, {
        width: '70vw',
        data: statusResponse.results
      });
    });
  }
  public runLatex() {
    this.dispatchJob('/runLaTeX/', (statusResponse: {startfiles: RunLatexResponse[]}) => {
      this.dialog.open(RunLatexDialogComponent, {
        width: '70vw',
        data: statusResponse.startfiles
      });
    });
  }
}
