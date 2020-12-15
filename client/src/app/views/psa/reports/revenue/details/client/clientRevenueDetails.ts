import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../../services/auth.service';
import { ReportsService } from '../../../../../../services/reports.service';
import ReportTemplates from '../../../data/reports-templates';

@Component({
  selector: 'app-reports',
  templateUrl: './clientRevenueDetails.html'
})
export class ClientRevenueDetails {
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
      columnDefs: this.getClientRevenueDetailsColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      if (params['clientId']) {
        this.getClientRevenueDetails(params['clientId']);
      }
    }));
  }

   headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
}

getClientRevenueDetails(clientId) {
    console.log('clientId : ', clientId)
    let reqBody: any = {
      orgId: clientId,
      reportType: 'CLIENT_REVENUE_DETAILS'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('CLIENT_REVENUE_DETAILS : ', apiResponse);
      this.createRowData(apiResponse);
    });
  }

  getClientRevenueDetailsColumnDefs() {
    return [
      { headerName: 'Evaluation Period', field: 'evaluationPeriod' },
      { headerName: 'Type of Evaluation', field: 'evaluationsType' },
      { headerName: '#s Purchased', field: 'licPurchasesCount' },
      { headerName: 'Amount (CAD)', field: 'amount', },
    ];
  }

   createRowData(history: any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    this.clientInfo = history.clientInfo;
    this.clientRow = {
      'Name': this.clientInfo.Name,
      'year': new Date(this.clientInfo.CreatedOn).toLocaleDateString(undefined, options),
      'active': this.clientInfo.IsActive ? 'Yes' : 'No',
      'usageType': this.clientInfo.UsageType,
      'evaluationsType': this.clientInfo.EvaluationPeriod,
      'evaluationPeriod':ReportTemplates.months[this.clientInfo.StartMonth]+"'"+ReportTemplates.getYear()+' To '+ this.clientInfo.EndMonth.substring(0,3)+"'"+ReportTemplates.getYear(),
    };

    for (let i = 0; i < 20; i++) {
      rowData.push({
        evaluationPeriod: "JAN'20-DEC'20",
        purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
        evaluationsType: this.clientInfo.EvaluationPeriod,
        licPurchasesCount: Math.round(Math.random() * 100),
        amount: Math.round(Math.random() * 1000),
      });
    }
    this.rowData = rowData;
  }

  gotoClients() {
    this.router.navigate(['/psa/reports/revenue/client'])
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