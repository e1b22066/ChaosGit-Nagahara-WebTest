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

  public rowData_task: any[] = [];
  public columnDefs_task: ColDef[] = [];
  public defaultColDef_task: ColDef = {};

  public rowData_sabotage: any[] = [];
  public columnDefs_sabotage: ColDef[] = [];
  public defaultColDef_sabotage: ColDef = {};

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
      this.http.get<any[]>('http://localhost:8080/api/review-task-data').subscribe(data => {
        this.rowData_task = data;
      });

      console.log('取得したデータ:', this.rowData_task);
      
      this.columnDefs_task = [
        { field: 'No', headerName: 'task' },
        { field: 'taskContent', headerName: '内容', wrapText: true, autoHeight: true },
        { field: 'who', headerName: '担当者' },
        { field: 'task_count', headerName: 'チェック回数(本タスククリアにかかった回数)'},
        { field: 'chat_count', headerName: 'チャット回数'}
      ];

      this.defaultColDef_task = {
        flex: 1,
        filter: true,
        sortable: true,
      };

      this.http.get<any[]>('http://localhost:8080/api/review-sabotage-data').subscribe(data => {
        this.rowData_sabotage = data;
      });

      console.log('取得したデータ:', this.rowData_sabotage);
      
      this.columnDefs_sabotage = [
        { field: 'No', headerName: 'task' },
        { field: 'sabotageContent', headerName: '内容', wrapText: true, autoHeight: true },
        { field: 'first', headerName: '障害発見者' },
        { field: 'inventor', headerName: '修正案発案者'},
        { field: 'correction', headerName: '修正方法'},
        { field: 'corrector', headerName: '修正者' },
        { field: 'correctors', headerName: '障害内容正答者' },
        { field: 'usinghint', headerName: 'ヒント使用者' },
        { field: 'talking', headerName: '障害についての話し合い' },
        { field: 'time', headerName: '障害発生から修正までの時間' }
      ];

      this.defaultColDef_sabotage = {
        flex: 1,
        filter: true,
        sortable: true,
      };
    }
  }
