import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.html',
  styleUrl: './sample.scss',
  imports: [AgGridAngular, CommonModule]
})

export class Sample implements OnInit {

  public rowData: any[] = [];
  public columnDefs: ColDef[] = [];
  public defaultColDef: ColDef = {};

  public isBrowser: boolean = false;

  /*
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object) {
    if(isPlatformBrowser(this.platformId)) {
      ModuleRegistry.registerModules([AllCommunityModule]);
    }
  }
  */

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    ModuleRegistry.registerModules([ AllCommunityModule ]);
    // rowData, columnDefs, defaultColDef の代入を全てこのブロック内に移動させてください。
    this.isBrowser = isPlatformBrowser(this.platformId);
      this.http.get<any[]>('http://localhost:8080/api/review-data').subscribe(data => {
        this.rowData = data;
      });

      console.log('取得したデータ:', this.rowData);
      
      this.columnDefs = [
        { field: 'who', headerName: '誰が' },
        { field: 'task', headerName: 'どのタスク' },
        { field: 'incident', headerName: 'トラブル対応' }
      ];
      
      this.defaultColDef = {
        flex: 1,
        filter: true,
        sortable: true,
      };
    }
  }
