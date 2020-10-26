import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccomplishmentsComponent } from './accomplishments/accomplishments.component';
import { ActionPlanComponent } from './action-plan/action-plan.component';
import { CreateGoalsComponent } from './create-goals/create-goals.component';
import { CurrentEvaluationComponent } from './current-evaluation/current-evaluation.component';
import { GoalsComponent } from './goals/goals.component';
import { KpiSettingsComponent } from './kpi-settings/kpi-settings.component';
import { KpiSetupComponent } from './kpi-setup/kpi-setup.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportsComponent } from './reports/reports.component';
import { StrengthsComponent } from './strengths/strengths.component';



const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Employee'
    },
    children: [
      {
        path: '',
        redirectTo: 'kpi-setup'
      },
     
      {
        path: 'kpi-setting',
        component: KpiSettingsComponent,
        data: {
          title: 'KPI Setting'
        }
      },

      {
        path: 'kpi-setup',
        component: KpiSetupComponent,
        data: {
          title: 'KPI Setup'
        }

      },
      {
        path:'dashboard',
        component:KpiSetupComponent,
        data:{title:'Dashboard'}
      }, {
        path:'action-plan',
        component:ActionPlanComponent,
        data:{title:'Action-Plan'}
      },
      {
        path:'goals',
         component:GoalsComponent,
        // component:CreateGoalsComponent,
        data:{title:'Goals'}
      },

      {
        path:'strengths',
        component:StrengthsComponent,
        data:{title:'Strengths'}
      },
      
      {
        path:'current-evaluation',
        component:CurrentEvaluationComponent,
        data:{title:'Current-Evaluation'}
      }, {
        path:'accomplishments',
        component:AccomplishmentsComponent,
        data:{title:'Accomplishments'}
      },
      {
        path:'reports',
        component:ReportsComponent,
        data:{title:'Reports'}
      }, {
        path:'profile',
        component:ProfileComponent,
        data:{title:'Profile'}
      },

     

     
    ]
}

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployessRoutingModule {


}
