import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { CustomValidators } from '../../../shared/custom-validators';


@Component({
  selector: 'app-create-reseller',
  templateUrl: './create-reseller.component.html',
  styleUrls: ['./create-reseller.component.css']
})
export class CreateResellerComponent implements OnInit {

 
  public clientForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  errorOnSave = false;
  errorMessage: string = "";
  isCreate:Boolean=true;
  @ViewChild('closeModal') closeModal: ElementRef
  currentRowItem: any;
  orgViewRef: BsModalRef;
  @ViewChild('orgView') orgView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  industries: any;
  evaluationPeriods: any;
  clientFormData: any = {};
  constructor(private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {


  }
  countyFormReset: boolean;
  cscData: any = null;
  currentUser: any;
  subscription: Subscription = new Subscription();
  currentRecord: any = {};
  onCSCSelect(data) {
    this.clientForm.patchValue({ City: data.City.name });
    this.clientForm.patchValue({ Country: data.Country.name });
    this.clientForm.patchValue({ State: data.State.name });
   
  }
  ngOnInit(): void {
    this.subscription.add(this.activatedRoute.params.subscribe(params => {      
      if(params['id']){
        this.currentRecord.id = params['id'];
        this.isCreate=false;
      this.getClientDataById();
      }

    }));

    this.initForm();
    this.getIndustries();
    this.sameAsContactChange();
    this.currentUser = this.authService.getCurrentUser();    
    this.getEvaluationCategories();
    
  }
  
  getClientDataById() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetOrganizationDataById",
      this.perfApp.requestBody = { id: this.currentRecord.id }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.currentRecord = c;
      console.info('client record', c);
      this.setValues(this.clientForm, c);
    }, error => {
      this.notification.error('something went wrong')
      console.error(error);

      //this.notification.error(error.error.message)
    });
  }

  initForm() {
    this.clientForm = this.formBuilder.group({
      Name: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],
      Industry: ['', [Validators.required]],
      Address: [null, Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])],
      Phone: [null, Validators.compose([
        Validators.required, 
        Validators.minLength(10),        
        Validators.pattern(/[^0-9]*/g),        
      ])],
      PhoneExt: [null, Validators.compose([
        Validators.pattern("^[0-9]*$"),        
      ])],
      Email: ['', [Validators.required, Validators.email]],
      Country: ['', [Validators.required]],
      State: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ZipCode: ['', [Validators.required]],
      ClientType: ['Reseller', [Validators.required]],
      
      AdminFirstName: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],
      AdminLastName: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],
      AdminMiddleName: ['', []],
      AdminEmail: ['', [Validators.required, Validators.email]],
      AdminPhone: [null, Validators.compose([
        Validators.required, 
        Validators.minLength(10),        
        Validators.pattern("^[0-9]*$")
      ])],
      SameAsAdmin: [false, []],
      contactPersonForm: this.formBuilder.group({

        ContactPersonFirstName: [null, Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
          CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
          Validators.minLength(2)])
        ],
        ContactPersonLastName: [null, Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
          CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
          Validators.minLength(2)])
        ],
        ContactPersonMiddleName: ['', []],
        ContactPersonEmail: ['', [Validators.required, Validators.email]],
        ContactPersonPhone: [null, Validators.compose([
          Validators.required, 
          Validators.minLength(10),        
          Validators.pattern("^[0-9]*$")
        ])]
      }),
      IsActive: ['', []]

    });
  }

  get f() {
    return this.clientForm.controls;
  }
  get a() {
    return (this.clientForm.controls['contactPersonForm'] as FormGroup).controls;
  }

  

  public createClient = () => {
    debugger
    this.clientFormData.IsDraft = false;
    this.isFormSubmitted = true;
    if (!this.clientForm.valid) {
      return;
    }
    if(this.currentRecord && this.currentRecord._id){
      this.updateClient();
    }else{
      this.saveClient();
    }
    
  }


  saveClient() {
    this.clientFormData = Object.assign(this.clientFormData, this.prepareOrgData());
    this.perfApp.route = "app";
    this.perfApp.method = "AddReseller",
      this.perfApp.requestBody = this.clientFormData; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.resetForm();
      this.notification.success('Reseller Addedd Successfully.')
      this.router.navigate(['/psa/list'])
    }, error => {
      this.errorOnSave = true;
      this.errorMessage = error.error ? error.error.message : error.message;
      //this.notification.error(error.error.message)
    });
  }

  sameAsContactChange() {
    this.clientForm.get('SameAsAdmin').valueChanges
      .subscribe(value => {
        if (value === null || value === undefined) {
          return;
        }
        var contactForm = (this.clientForm.controls['contactPersonForm'] as FormGroup)
        if (value) {
          this.removeValidators(contactForm);
          this.disableFields(contactForm);
          this.setContactPersonFields(contactForm)
        }
        else {
          this.enableFields(contactForm);
          this.addValidators(contactForm);
        }
      });
  }
  public removeValidators(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
    }
  }
  public addValidators(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).setValidators(this.validationType[key]);
    }
  }
  public disableFields(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).reset();
      form.get(key).disable();
    }
  }
  public enableFields(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).enable();
    }
  }
  public setValues(form: FormGroup, rowdata: any) {
    for (const key in form.controls) {
      const f = form.controls[key];
      //for child forms
      if (f && f instanceof FormGroup) {
        this.setValues(f, rowdata);
      } else {
        form.get(key).setValue(rowdata[key]);

      }

    }
  }
  public setContactPersonFields(form: FormGroup) {
    form.controls["ContactPersonFirstName"].setValue(this.clientForm.get('AdminFirstName').value)
    form.controls["ContactPersonMiddleName"].setValue(this.clientForm.get('AdminMiddleName').value)
    form.controls["ContactPersonLastName"].setValue(this.clientForm.get('AdminLastName').value)
    form.controls["ContactPersonPhone"].setValue(this.clientForm.get('AdminPhone').value)
    form.controls["ContactPersonEmail"].setValue(this.clientForm.get('AdminEmail').value)
  }



  validationType = {
    ContactPersonFirstName: ['', Validators.compose([
      Validators.required,
      CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
      CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      Validators.minLength(2)])
    ],
    ContactPersonLastName: ['', Validators.compose([
      Validators.required,
      CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
      CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      Validators.minLength(2)])
    ],
    ContactPersonMiddleName: ['', []],
    ContactPersonEmail: ['', [Validators.required, Validators.email]],
    ContactPersonPhone: ['', Validators.compose([
      Validators.required, Validators.minLength(10),
      CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
    ])]
  }
  resetForm() {
    this.isFormSubmitted = false;
    this.clientForm.reset();
    this.clientForm.setErrors(null);
    this.emptyForm(this.clientForm)

  }
  public emptyForm(form: FormGroup) {
    for (const key in form.controls) {
      const f = form.controls[key];
      //for child forms
      if (f && f instanceof FormGroup) {
        this.emptyForm(f);
      } else {
        form.get(key).setValue(null);

      }

    }
  }


  getIndustries() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetIndustries",
      this.perfApp.requestBody = {}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.industries = c;
      console.table(c);
    }, error => {


      //this.notification.error(error.error.message)
    });
  }

  getEvaluationCategories() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetEvaluationCategories",
      this.perfApp.requestBody = {}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.evaluationPeriods = c;
      console.table('eval periods', c);
    }, error => {


      //this.notification.error(error.error.message)
    });
  }

  //#region  update client related
  public updateClient() {
    if (this.clientForm.invalid) {
      return;
    }
    const organization = this.prepareOrgData();
    console.log('updating client',organization)
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateReseller",
      this.perfApp.requestBody = organization; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      debugger
      console.log('updated', c)
      this.notification.success('Reseller details updated successfully')
      this.router.navigate(['/psa/list'])

    }, error => {      
      console.log('eror while updating reseller :', error)
      this.notification.error(error.error.message)
    });
  }
  //#endregion

  prepareOrgData() {
    var organization = this.clientForm.getRawValue();
    var action='Create';
    if(this.currentRecord && this.currentRecord._id){
action='Update'
    }
    if (action === 'Create') {
      organization.IsActive = true;
      organization.CreatedBy = this.authService.getCurrentUser()._id;
      organization.CreatedOn = new Date();
    } else {      
      organization.id = this.currentRecord._id;
      organization.UpdatedBy = this.authService.getCurrentUser()._id;
      organization.UpdatedOn = new Date();
      organization.IsDraft=false;
    }
    organization = this.setContactPersonData(organization);
    delete organization.contactPersonForm;
    return organization;
  }

  setContactPersonData(organization) {
    if (this.clientForm.get('SameAsAdmin').value) {
      organization.ContactPersonFirstName = organization.AdminLastName;
      organization.ContactPersonMiddleName = organization.AdminMiddleName;
      organization.ContactPersonLastName = organization.AdminLastName;
      organization.ContactPersonPhone = organization.AdminPhone;
      organization.ContactPersonEmail = organization.AdminEmail;
    } else {
      organization.ContactPersonFirstName = organization.ContactPersonLastName;
      organization.ContactPersonMiddleName = organization.ContactPersonMiddleName;
      organization.ContactPersonLastName = organization.ContactPersonLastName;
      organization.ContactPersonPhone = organization.ContactPersonPhone;
      organization.ContactPersonEmail = organization.ContactPersonEmail;
    }
    return organization;
  }
  saveAsDraft() {
    this.clientFormData.IsDraft = true;
    this.isFormSubmitted = true;
    if (!this.clientForm.valid) {
      return;
    }
    this.saveClient();
  }
}