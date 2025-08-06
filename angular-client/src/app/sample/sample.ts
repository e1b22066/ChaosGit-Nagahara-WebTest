import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if(isPlatformBrowser(this.platformId)) {
      ModuleRegistry.registerModules([AllCommunityModule]);
    }
  }

  ngOnInit(): void {
    // 【ここが重要です！】
    // rowData, columnDefs, defaultColDef の代入を全てこのブロック内に移動させてください。
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.rowData = [
        { who: '田中', task: 'ログイン機能の修正', incident: '最初に発見' },
        { who: '鈴木', task: 'データ連携', incident: '修正案を提案' },
        { who: '佐藤', task: 'UIデザイン', incident: '修正案を採択' }
      ];
      
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
}
