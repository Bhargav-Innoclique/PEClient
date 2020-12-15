import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from '../../../../../services/auth.service';
import { ReportsService } from '../../../../../services/reports.service';
import RefData from "../../data/refData";
import ReportTemplates from '../../data/reports-templates';

@Component({
    selector: 'my-app',
    templateUrl: './resellerInfo.component.html',
    styleUrls: ['./resellerInfo.component.css']
})
export class ResellerInfoComponent {

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
    constructor(
        public authService: AuthService,
        public reportService:ReportsService,
        public router: Router,
        private activatedRoute: ActivatedRoute, ) {
        this.currentUser = this.authService.getCurrentUser();
        this.currentOrganization = this.authService.getOrganization();
        this.gridOptions = <GridOptions>{};
        this.gridOptions = {
            columnDefs: this.getPsaResellerInfoColumnDefs(),
        }
        this.defaultColDef = ReportTemplates.defaultColDef;
        // this.createResellerRowData();
    }
     headerHeightSetter(event) {
        var padding = 20;
        var height = ReportTemplates.headerHeightGetter() + padding;
        this.api.setHeaderHeight(height);
        this.api.resetRowHeights();
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.getResellerInfo();
    }
    getResellerInfo(){
        let {Organization,_id} = this.currentUser;
        let orgId = Organization._id;

        let reqBody:any = {
          orgId:orgId,
          reportType:'RESELLER_INFO'
        };
        this.reportService.getReport(reqBody).subscribe(apiResponse => {
          console.log('RESELLER_INFO : ',apiResponse);
          this.createResellerRowData(apiResponse);
        });
      }

    private createResellerRowData(resellerInfo:any) {
        const rowData: any[] = [];
        //  resellerInfo = resellerInfo.ClientSummary.usage;
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        console.log('inside createRowData : ');
        for (let i = 0; i < resellerInfo.length; i++) {                                                           
            rowData.push({
                reSellerName: resellerInfo[i].Name,
                year: new Date(resellerInfo[i].CreatedOn).toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                active: resellerInfo[i].IsActive?'Yes':'No',
                resellerId:resellerInfo[i]._id,
                purchasesCount: Math.round(Math.random() * 1000),//dummy data
            });
        }
        this.rowData = rowData;
    }

    getPsaResellerInfoColumnDefs() {
        return [
            { headerName: 'Reseller', field: 'reSellerName', tooltipField: 'reSellerName', minWidth: 200 },
            { headerName: 'Reseller Since', field: 'year', minWidth: 50 },
            { headerName: 'Active', field: 'active', minWidth: 50 },
            { headerName: '#s Purchased (License)', field: 'purchasesCount',minWidth:220 },
            { headerName: '#s Purchased (# of Employees)', field: 'purchasesCount',minWidth:300  }, ,
            {
                headerName: "Actions", sorting: false, filter: false, onCellClicked: this.gotoClients.bind(this),
                cellRenderer: (data) => {
                    return `  <i class="fa fa-sitemap"   style="cursor:pointer ;padding: 7px 20px 0 0;
                    font-size: 17px;"   data-action-type="edit" title="view clients" ></i>`
                }
            }
        ];
    }

    gotoClients(event) {
        console.log(event);
        const cr= event.data;
        this.router.navigate(['/psa/reports/info/reseller/clients/'+cr.resellerId])
        return;
    }
    
    gotoDashboard() {
        this.router.navigate(['/psa/dashboard'])
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
    }

    onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}

