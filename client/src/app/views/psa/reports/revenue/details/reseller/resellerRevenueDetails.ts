import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../../services/auth.service';
import { ReportsService } from '../../../../../../services/reports.service';
import ReportTemplates from '../../../data/reports-templates';
import RefData from '../../../data/refData';

@Component({
  selector: 'app-reports',
  templateUrl: './resellerRevenueDetails.html'
})
export class ResellerRevenueDetails {
  public gridOptions: GridOptions;
  public showGrid: boolean;
  public rowData: any[];
  private api: GridApi;
  detailCellRendererParams: any;
  defaultColDef: any;
  currentUser: any;
  cscData: any = undefined;
  currentOrganization: any;
  detailCellRenderer: any;
  frameworkComponents: any;
  resellerInfo: any;
  resellerRow: any;
  clientInfo: any;
  clientRow: any;
  subscription: Subscription = new Subscription();
  constructor(
    public authService: AuthService,
    public reportService: ReportsService,
    public router: Router,
    private activatedRoute: ActivatedRoute, ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getResellerRevenueDetailsColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      if (params['resellerId']) {
        this.getResellerRevenueDetails(params['resellerId']);
      }
    }));
  }

  public headerHeightSetter() {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
}

  getResellerRevenueDetails(resellerId) {
    console.log('resellerId : ', resellerId)
    let reqBody: any = {
      orgId: resellerId,
      reportType: 'RESELLER_REVENUE_DETAILS'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('RESELLER_REVENUE_DETAILS : ', apiResponse);
      this.createRowData(apiResponse);
    });
  }

  getResellerRevenueDetailsColumnDefs() {
    return [
      { headerName: 'Date of Purchase', field: 'purchasedOn' },
      { headerName: 'Usage Type', field: 'usageType' },
      { headerName: 'Revenue from Licenses (CAD)', field: 'licPurchasesCount' },
      { headerName: 'Revenue from # of Employees (CAD)', field: 'licPurchasesCount', },
    ];
  }

   createRowData(history: any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    this.resellerInfo = history.resellerInfo;
    this.resellerRow = {
      'Name': this.resellerInfo.Name,
      'year': new Date(this.resellerInfo.CreatedOn).toLocaleDateString(undefined, options),
      'active': this.resellerInfo.IsActive ? 'Yes' : 'No',
    };

    for (let i = 0; i < 20; i++) {
      rowData.push({
        evaluationPeriod: "JAN'20-DEC'20",
        purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
        evaluationsType: this.resellerInfo.EvaluationPeriod,
        usageType: RefData.usageTypes[Math.random() < 0.5 ? 1 : 0],
        licPurchasesCount: Math.round(Math.random() * 10000),
      });
    }
    this.rowData = rowData;
  }

  gotoResellers() {
    this.router.navigate(['/psa/reports/revenue/reseller'])
  }

  onBtExport() {
    var params = {
      columnWidth: parseFloat('200'),
      sheetName: 'Client-Info',
      exportMode: undefined,
      suppressTextAsCDATA: false,
      rowHeight: undefined,
      headerRowHeight: undefined,
    };
    this.api.exportDataAsExcel(params);
  }
  onReady(params: any) {
    this.api = params.api;
    console.log('onReady');
    this.api.sizeColumnsToFit();
    this.gridOptions.rowHeight = 34;
    this.gridOptions.groupMultiAutoColumn = true;
    this.gridOptions.columnApi.setColumnVisible('isPastData', false);
  }

  onQuickFilterChanged($event: any) {
    this.api.setQuickFilter($event.target.value);
}

}
