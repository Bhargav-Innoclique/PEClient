
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-review-evaluation-list',
  templateUrl: './review-evaluation-list.component.html',
  styleUrls: ['./review-evaluation-list.component.css']
})
export class ReviewEvaluationListComponent implements OnInit {


  public empForm: FormGroup;
  departments=[];
  jobRoles=[];
  appRoles: any;
  jobLevels: any;
  loginUser: any;

  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'gray modal-lg'
  };
  currentRowItem: any;
  // @ViewChild('addEmployee', { static: true }) addEmployeeView: TemplateRef<any>;
  @ViewChild("addEmployee", { static: true }) emoModal: ModalDirective;
  viewEmpFormRef: BsModalRef;
  countyFormReset: boolean;
  isRoleChanged: boolean;
  empDetails: any={}
  currentAction='create';
  cscData:any=undefined;

  public alert: AlertDialog;
  public currentOrganization:any={};
  managerReporteesData: any;
  tSReporteesData: any;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private modalService: BsModalService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) { 


      this.loginUser=this.authService.getCurrentUser();
    }



  ngOnInit(): void {

    this.GetReporteeEvaluationsDetails();
    this.GetTSReporteeEvDetails();
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
	//  this.clientGridOptions.api = params.api; // To access the grids API
  //       this.clientGridOptions.rowHeight = 34;
  }
  onTsGridReady(params) {
    params.api.sizeColumnsToFit();
	//  this.clientGridOptions.api = params.api; // To access the grids API
  //       this.clientGridOptions.rowHeight = 34;
  }

  
  public columnDefs = [
    {headerName: 'Employee', field: 'Name',  sortable: true, filter: true,
    // cellRenderer: (data) => {
    //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    // }
  },
    {headerName: 'No.of  Performance Goals', field: 'NoOfKpis', sortable: true, filter: true },
    {headerName: 'No.of Dev Goals', field: 'NoOfDevGoals', sortable: true, filter: true },
    {headerName: 'Evaluation Status', field: 'FRStatus', tooltipField:"FRStatus",   sortable: true, filter: true },
    {
      headerName: 'Action', field: '',  autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `
        
        
        <i class="cui-wrench" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewKPI" title="Review Performance Goal"></i>
        
        <i class="cui-pie-chart" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

        <i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewEval" title="Review Evaluation"></i>
        `;
        return returnString;
      }
    }
];


  
public tsColumnDefs = [
  {headerName: 'Employee', field: 'Name',  sortable: true, filter: true,
  // cellRenderer: (data) => {
  //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
  // }
},
  {headerName: 'No.of  Performance Goals', field: 'NoOfKpis', sortable: true, filter: true },
  {headerName: 'No.of Dev Goals', field: 'NoOfDevGoals', sortable: true, filter: true },
  {headerName: 'Evaluation Status', field: 'FRStatus', tooltipField:"FRStatus",    sortable: true, filter: true },
  {
    headerName: 'Action', field: '',  autoHeight: true, suppressSizeToFit: true,
    cellRenderer: (data) => {

      var returnString = '';
      returnString += `<i class="cui-wrench" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewKPI" title="ReviewPerformance Goal"></i>
      
      <i class="cui-pie-chart" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

      <i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewEval" title="Review Evaluation"></i>
      `;
      return returnString;
    }
  }
];

onGridSizeChanged(params) {
  params.api.sizeColumnsToFit();
}
public getRowHeight = function (params) {
return 34;
};



public onEmpGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data.RowData;;
  
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    
      case "VF":
        this.viewEmpForm('reviewEval','Manager');
        break;
        case "reviewKPI":
          this.reviewEvalForm('reviewKPI','Manager');
          break;
          case "reviewGoals":
            this.reviewEvalForm('reviewGoals','Manager');
            break;
            case "reviewEval":
              this.reviewEvalForm('reviewEval','Manager');
              break;

              case "addKPI":
                this.addKpiForm();
                break;
      
     
      default:
    }
  }
}



public onAsTSGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data.RowData;;
  
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    
      case "VF":
        this.viewEmpForm('reviewEval','TS');
        break;
        case "reviewKPI":
          this.reviewEvalForm('reviewKPI','TS');
          break;
          case "reviewGoals":
            this.reviewEvalForm('reviewGoals','TS');
            break;
            case "reviewEval":
              this.reviewEvalForm('reviewEval','TS');
              break;
          
     
      default:
    }
  }
}

  reviewEvalForm(action,actor) {
      this.router.navigate(['employee/review-evaluation',
       { action: action, empId: this.currentRowItem._id,actor:actor,empManagerId:this.currentRowItem.Manager 
        ,empName: this.currentRowItem.Name}
    ], { skipLocationChange: true });
  }

  viewEmpForm(action,actor) {
     this.router.navigate(['employee/review-evaluation',
       { action: action, empId: this.currentRowItem._id,actor:actor
        ,empName: this.currentRowItem.Name }
    ], { skipLocationChange: true });
  }


  

  addKpiForm() {


    this.router.navigate(['em/add-kpi', { action: 'add', ownerId: this.currentRowItem._id }], { skipLocationChange: true });

  }


GetReporteeEvaluationsDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetReporteeEvaluations",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    debugger
    
    this.managerReporteesData=c.map(row=> {
      let flatarray=row.Evaluation.flat()
let evaluation=flatarray.find(x=>x.Status==='Active')
row.Name= row.FirstName+' '+row.LastName;    
     return  {
         Name:row.Name,
         NoOfKpis: row.KpiList.length,
         NoOfDevGoals: row.GoalList.length,
         FRStatus: row.FRStatus,
       
        RowData:row
      }
    }
    )
  })
}






GetTSReporteeEvDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetTSReporteeEvaluations",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.tSReporteesData=c.map(row=> {
      debugger

      let flatarray=row.Evaluation.flat()
let evaluation=flatarray.find(x=>x.Status==='Active')
row.Name= row.FirstName+' '+row.LastName;    
     return  {
         Name:row.Name,
         NoOfKpis: row.KpiList.length,
         NoOfDevGoals: row.GoalList.length,
         FRStatus: row.FRStatus,
       
        RowData:row
      }
    }
    )
  })
}





}

