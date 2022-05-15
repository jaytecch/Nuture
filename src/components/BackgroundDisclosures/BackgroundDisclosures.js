import React, { Component, useState } from 'react';
import { ReCaptcha } from 'react-recaptcha-google';
import PropTypes, {shape} from 'prop-types';
import classNames from 'classnames';
import { isValidOrReturnDescription } from 'usdl-regex';

import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';


import css from './BackgroundDisclosures.css';
import {
  requestSaveBackgroundInfo,
  processBackgroundCheck,
  saveBackgroundInfoError
} from "../../containers/BackgroundDisclosuresPage/BackgroundDisclosuresPage.duck";
import {sendVerificationEmail} from "../../ducks/user.duck";
import {compose} from "redux";
import {connect} from "react-redux";
import {FormattedMessage, injectIntl} from "../../util/reactIntl";
import {SignupFormComponent} from "../../forms/SignupForm/SignupForm";
import SinglePagePDFViewer from "../Pdf/single-page";
import summaryOfRightsfile from './Summary_of_Rights_Under_FCRA_-_updated.pdf';
import diclosureForBackgroundInvestigation from './Disclosure_Regarding_Background_Investigation__March_2018_NurtureUp.pdf';
import ackAndAuthFile from './Acknowledgement_and_Authorization__March_2018_ NurtureUp.pdf';

import {NamedLink, PrimaryButton} from "..";
import FieldCheckbox from "../FieldCheckbox/FieldCheckbox";
import { Document, Page, pdfjs } from 'react-pdf';
import * as validators from "../../util/validators";
import FieldTextInput from "../FieldTextInput/FieldTextInput";
import {authenticationInProgress, updateMetadata} from "../../ducks/Auth.duck";
import {isScrollingDisabled} from "../../ducks/UI.duck";
import { withRouter } from 'react-router-dom';
import Button from "../Button/Button";
import {isSignupEmailTakenError, storableError} from "../../util/errors";
import moment from "moment";
import CovidWaiverPdf from "../../assets/documents/COVID-19 Waiver_Draft.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

require.resolve('react-dates/lib/css/_datepicker.css');



const CONTENT_PLACEMENT_OFFSET = 0;
const CONTENT_TO_RIGHT = 'right';
const BACKSPACE = 8;

const isControlledMenu = (isOpenProp, onToggleActiveProp) => {
  return isOpenProp !== null && onToggleActiveProp !== null;
};




const handleBackgroundInvestigationDisclosure = values => {
  this.setState({showBackgroundInvestigationDisclosure: false});
};


class BackgroundDisclosuresComponent extends Component {
  middleNameCheck;


  constructor(props) {
    super(props);
    const {history, values} = this.props;
    const {firstName, lastName, viewportWidth, email, parentComponent, backgroundInvestigationSubmitted} = values || {};

    //console.log('In BGD, firstName = ' + firstName);
    //console.log('In BGD, firstName = ' + lastName);
    this.state = { isOpen: false,
      ready: false,
      showWelcomeMessage: false,
      showCollectBackgroundPii: false,
      showBackGroundInfoDiv: true,
      showConsumerRights: false,
      showBackgroundInvestigationDisclosure: false,
      recaptchaVerified: false,
      fullSignatureEntered: false,
      checked:false,
      biChecked:false,
      authChecked:false,
      firstName:firstName,
      lastName:lastName,
      middleName:'',
      noMiddleName:'',
      dob:'',
      formattedDob:'',
      ssn:'',
      licenseNumberAndStateValid: true,
      licenseNumberAndStateErrorValue:'',
      zip:'',
      licenseNumber:'',
      licenseState:'',
      email:email,
      fullNameSignature: '',
      viewportWidth: viewportWidth,
      backgroundSubmitInProgress: false,
      parentComponent: parentComponent,
      backgroundSubmitted: backgroundInvestigationSubmitted,
      backgroundError: false,
      backgroundErrorText: '',
    };
    this.handleConsumerRights = this.handleConsumerRights.bind(this);
    this.handleBackgroundDisclosure = this.handleBackgroundDisclosure.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.showBackgroundDisclosures = this.showBackgroundDisclosures.bind(this);

    this.showDashboard = this.showDashboard.bind(this);

  }
  handleConsumerRights(){
    //window.alert('Close Consumer Rights');
    this.setState({showBackGroundInfoDiv: false});
    this.setState({showCollectBackgroundPii: false});
    this.setState({showConsumerRights: false});
    this.setState({showBackgroundInvestigationDisclosure: true});
    this.setState({showAuth: false});
  };
  handleBackgroundDisclosure(){
    //window.alert('Close Consumer Rights');
    this.setState({showBackGroundInfoDiv: false});
    this.setState({showCollectBackgroundPii: false});
    this.setState({showConsumerRights: false});
    this.setState({showBackgroundInvestigationDisclosure: false});
    this.setState({showAuth: true});
  };

  showDashboard(){
    const {history} = this.props;
    history.push('/dashboard');
  }

  showBackgroundDisclosures = values => {
    this.setState({showBackGroundInfoDiv: false});
    this.setState({showCollectBackgroundPii: false});
    this.setState({showConsumerRights: true});
    this.setState({showBackgroundInvestigationDisclosure: false});
    this.setState({showAuth: false});
  };




  componentDidMount() {
    if (this.captchaDemo) {
      //console.log("started, just a second...")
      this.captchaDemo.reset();
    }
  }
  onLoadRecaptcha() {
    //window.alert('captch check');
    if (this.captchaDemo) {
      this.captchaDemo.reset();
    }
  }
  verifyCallback(recaptchaToken) {
    // Here you will get the final recaptchaToken!!!
    //window.alert(recaptchaToken);
    //console.log(recaptchaToken, "<= your recaptcha token");
    this.setState({recaptchaVerified: true});
  }

  render() {

    //console.log('In BGD, viewportWidth= ' + this.state.viewportWidth);
    const pdfWidth = this.state.viewportWidth - 50;

    //console.log('setting pdf width to = ' + pdfWidth);
    const { className, rootClassName, requestSaveBackgroundInfo, onSubmitBackgroundDisclosures, invalid, intl,  onUpdateUserProfile, processBackgroundCheck} = this.props;
    const rootClass = rootClassName || css.root;
    const classes = classNames(rootClass, className);
    //const submitInProgress = inProgress;
    const submitDisabled = invalid; //|| submitInProgress;

    const handleAcknowledge = values => {
      this.setState({checked: !this.state.checked});
    };

    const handleBIAcknowledge = values => {
      this.setState({biChecked: !this.state.biChecked});
    };

    const handleAuthorization = values => {
      this.setState({authChecked: !this.state.authChecked});
    };

    const handleFirstNameChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({firstName: event.target.value});
    };
    const handleMiddleNameChange = (event) => {
      console.log(event)
      console.log(event.target.value)

      this.setState({middleName: event.target.value});
    };
    const handleLastNameChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({lastName: event.target.value});
    };
    const handlePhoneChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({phone: event.target.value});
    };
    // const handleEmailChange = (event) => {
    //   //console.log(event)
    //   //console.log(event.target.value)
    //   this.setState({email: event.target.value});
    // };
    const handleAddress1Change = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({address1: event.target.value});
    };
    const handleAddress2Change = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({address2: event.target.value});
    };
    const handleCityChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({city: event.target.value});
    };
    const handleStateChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({state: event.target.value});
    };
    const handleZipChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({zip: event.target.value});
    };
    const handlePasswordChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({password: event.target.value});
    };

    const handleSSNFormat= (e) => {
      const re = /[0-9A-F:]+/g;
      // remove any characters that are not digits
      if (!re.test(e.key)) {
        e.target.value = e.target.value.slice(0, -1);
        e.preventDefault();
      } else {
        if (e.keyCode !== BACKSPACE) {
          if (e.target.value.length === 3) {
            e.target.value = e.target.value + '-';
          } else if (e.target.value.length === 6) {
            e.target.value = e.target.value + '-';
          }
          // removes last character with the backspace key is hit
        } else if (e.keyCode === BACKSPACE) {
          this.setState({ssn: this.state.ssn.slice(0, -1)})
          e.preventDefault();
        }
      }
    };
    const handleSSNChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      let normalizedSSN = event.target.value.replace(/G/g, '-');
      //console.log('Normalized ssn =' + normalizedSSN);
      this.setState({ssn: normalizedSSN});
    };

    const handleLicenseStateChange = (event) => {
      console.log(event)
      console.log(event.target.value)
      this.setState({licenseState: event.target.value});
    };

    const handleLicenseNumberChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({licenseNumber: event.target.value});
    };
    const handleNoMiddleNameChange = (event) => {
      console.log(event)
      console.log(event.target.value)
      this.setState({middleName: null});
    };

    const handleFullNameSignature = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({fullNameSignature: event.target.value});
    };

    const handleDobChange = (event) => {
      //console.log(event)
      //console.log(event.target.value)
      this.setState({dob: event.target.value});
    };


    const handleFinalSubmit = values => {

      this.setState({backgroundSubmitInProgress: true});
      //console.log("in handlefinalsubmit dob = " + this.state.dob);
      let formattedDob = moment(this.state.dob).utc().format("YYYY-MM-DD");
      //console.log("in handlefinalsubmit formatted dob = " + formattedDob);

      let formattedMiddleName = this.state.noMiddleName;
      if(this.state.noMiddleName ) {
        formattedMiddleName = this.state.noMiddleName.trim();
      }

      console.log('IN BGDISCLOSURES HANDLE FINAL  SUBMIT');
      console.log('First Name ' + this.state.firstName);
      console.log('Middle Name' + this.state.middleName);
      console.log('Formatted Middle Name  '  + formattedMiddleName );
      console.log("Formatted dob = " + formattedDob);


      const params = {



        firstName: this.state.firstName.trim(),
        lastName: this.props.values.lastName.trim(),
        middleName:this.state.middleName.trim(),
        noMiddleName: formattedMiddleName,
        dateOfBirth: formattedDob.trim(),
        ssn: this.state.ssn.trim(),
        zip: this.state.zip.trim(),
        licenseNumber: this.state.licenseNumber.trim(),
        licenseState: this.state.licenseState.trim(),
        email: this.state.email.trim(),
        timestamp: new Date().getTime(),
        typedSignature: this.state.fullNameSignature.trim()

      }


      const {history} = this.props;
      onSubmitBackgroundDisclosures(params)
        .then(() => {
          this.setState({backgroundSubmitInProgress: false});
          // clear the previous error
          this.setState({backgroundError: false});
          //history.push('/dashboard');
          this.setState({showWelcomeMessage: true});
          this.setState({showBackgroundInvestigationDisclosure: false});
          this.setState({showAuth : false});
        })
        .catch(e => {
          console.log("Error, submit again " + e);
          console.log("Error, submit again " + JSON.stringify(e));
          console.log("Error, submit again " + e.error);
          const errorString = 'An error was encountered with the background information submitted: ' + e.error;
          this.setState({backgroundErrorText: errorString});
          this.setState({showBackGroundInfoDiv: true});
          this.setState({backgroundError: true});
          this.setState({showWelcomeMessage: false});
          this.setState({showBackgroundInvestigationDisclosure: false});
          this.setState({showAuth : false});
          this.setState({backgroundSubmitInProgress: false});
        });
    }

    // const stateRequiredMessage = intl.formatMessage({
    //   id: 'SignupForm.stateRequired',
    // });
    // // const stateRequired = validators.required(stateRequiredMessage);
    // const stateInvalidMessage = intl.formatMessage({
    //   id: 'SignupForm.stateInvalid',
    // });
    // const stateValid = validators.stateFormatValid(stateInvalidMessage);

    // first name
    const firstNameRequiredMessage = intl.formatMessage({
      id: 'SignupForm.firstNameRequired',
    });
    const firstNameRequired = validators.required(firstNameRequiredMessage);

    // last name
    const lastNameRequiredMessage = intl.formatMessage({
      id: 'SignupForm.lastNameRequired',
    });
    const lastNameRequired = validators.required(lastNameRequiredMessage);


    // ssn
    // const ssnLabel = intl.formatMessage({
    //   id: 'SignupForm.ssnLabel',
    // });
    // const ssnPlaceholder = intl.formatMessage({
    //   id: 'SignupForm.ssnPlaceholder',
    // });
    const ssnRequiredMessage = intl.formatMessage({
      id: 'SignupForm.ssnRequired',
    });
    const ssnRequired = validators.required(ssnRequiredMessage);

    const ssnFormatInvalidMessage = "SSN must be in form XXX-XX-XXXX";
    const ssnFormatValid = validators.ssnFormatValid(ssnFormatInvalidMessage);

    // drivers license number
    // const licenseNumberLabel = intl.formatMessage({
    //   id: 'SignupForm.licenseNumberLabel',
    // });
    // const licenseNumberPlaceholder = intl.formatMessage({
    //   id: 'SignupForm.licenseNumberPlaceholder',
    // });
    const licenseNumberRequiredMessage = intl.formatMessage({
      id: 'SignupForm.licenseNumberRequired',
    });
    const licenseNumberRequired = validators.required(licenseNumberRequiredMessage);

    // // drivers license state
    // const licenseStateLabel = intl.formatMessage({
    //   id: 'SignupForm.licenseStateLabel',
    // });
    // const licenseStatePlaceholder = intl.formatMessage({
    //   id: 'SignupForm.licenseStatePlaceholder',
    // });
    const licenseStateRequiredMessage = intl.formatMessage({
      id: 'SignupForm.licenseStateRequired',
    });
    const licenseStateRequired = validators.required(licenseStateRequiredMessage);

    // state
    const licenseStateInvalidMessage = intl.formatMessage({
      id: 'SignupForm.stateInvalid',
    });
    const licenseStateValid = validators.stateFormatValid(licenseStateInvalidMessage);


    let result;

    const licenseStateAndNumberValid = values =>{

      ////console.log('dob in validation =' + this.state.dob);

      try {
        result = isValidOrReturnDescription(this.state.licenseState.trim(), this.state.licenseNumber.trim());

        if(result === true){
          //console.log( "This is a valid combo " + result);
          this.setState({licenseNumberAndStateValid: true});
          this.setState({licenseNumberAndStateErrorValue: ''});
          this.showBackgroundDisclosures();
        }else{
          this.setState({licenseNumberAndStateValid: false});
          this.setState({licenseNumberAndStateErrorValue: result});

        }
      } catch (error){
        this.setState({licenseNumberAndStateValid: false});
        this.setState({licenseNumberAndStateErrorValue: result})
      }
    };



    // zip
    const addressZipRequiredMessage = intl.formatMessage({
      id: 'SignupForm.addressCityRequired',
    });
    const addressZipRequired = validators.required(addressZipRequiredMessage);

    const addressZipInvalidMessage = intl.formatMessage({
      id: 'SignupForm.addressZipInvalid',
    });
    const addressZipValid = validators.addressZipFormatValid(addressZipInvalidMessage);

    const skipBackground = () => {
      const {history} = this.props;
      const params = {backgroundCheckSubmitted: "false"};

      onUpdateUserProfile(params)
        .then(result => {

          //console.log('This is a seeker, so we need to go to dashboard');
          history.push('/dashboard');
        })
        .catch(error => {
          console.error(error);

        });
    };

    const backgroundFormError = (

      <div className={css.error}>
        <span>Invalid license number.  For the state of {this.state.licenseState} , the license format is {this.state.licenseNumberAndStateErrorValue}</span>
      </div>
    );

    const backgroundInfoDiv = (
      <div>
        <h1 className={css.backgroundHeaderSubText}>Fill out the form below</h1>
        <div>
          <p>NurtureUp has engaged Checkr, Inc. to obtain a consumer report and/or investigative consumer report for employment purposes. Checkr Inc. will provide a background investigation as a pre-condition of your engagement with NurtureUp and in compliance with federal and state employment laws. If you have any questions related to the screening process, plase contact us at applicant.chekr.com</p>
        </div>
        <div className={css.error}>{this.state.backgroundError? this.state.backgroundErrorText: null}</div>
        <div className={css.name}>
          <FieldTextInput
            className={css.firstNameBackground}
            type="text"
            id="fname"
            name="fname"
            autoComplete="given-name"
            //label="First Name"
            placeholder={this.state.firstName}
            //ref={this.input}
            value={this.state.firstName}
            onInput={handleFirstNameChange}
            validate={firstNameRequired}
          />
          <FieldTextInput
            className={css.middleNameBackground}
            type="text"
            id="middleName"
            name="middleName"
            autoComplete="additional-name"
            //label="Middle Name"
            placeholder="Middle Name"
            // ref={this.middleNameCheck}
            value={this.state.middleName}
            onInput={handleMiddleNameChange}
            //validate={firstNameRequired}
          />
          <FieldTextInput
            className={css.lastNameBackground}
            type="text"
            id="lname"
            name="lname"
            autoComplete="family-name"
            //label="Last Name"
            placeholder={this.state.lastName}
            value={this.state.lastName}
            onInput={handleLastNameChange}
            validate={lastNameRequired}
          />
        </div>
        <div className={css.noMiddleName}>
          <FieldCheckbox
            className={css.middleNameBackground}
            id="noMiddleName"
            name="noMiddleName"
            textClassName={css.noMiddleNameText}
            label="I do not have a middle name"
            value=''
            checked={!this.state.middleName}
            onInput={handleNoMiddleNameChange}

          />
        </div>
        <div className={css.dobRow}>
         <div className={css.birthDateContainer}>
           {/*<div>  Birthdate </div>*/}

        <SingleDatePicker
                          showDefaultInputIcon={true}
                          numberOfMonths={1}
          date={this.state.dob} // momentPropTypes.momentObj or null
          onDateChange={date => this.setState({ dob: date })} // PropTypes.func.isRequired
          focused={this.state.focused} // PropTypes.bool
          onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
          id="dateOfBirth" // PropTypes.string.isRequired,
                          wrapperClassName={css.datepicker}
          placeholder="Birthdate"
                          labelText="Birthdate"
                          inputIconPosition="before"
                          enableOutsideDays={true}
                          isOutsideRange={() => false}
                          helperText={"YYYY-MM-DD"}
        />

         </div>
          <FieldTextInput
            className={css.ssnBackground}
            type="text"
            id="ssn"
            maxlength="11"
            name="ssn"
            //label= "Social Security Number"
            placeholder="SSN (XXX-XX-XXXX)"
            value={this.state.ssn}
            onInput={handleSSNChange}
            onKeyUp={handleSSNFormat}
            validate={validators.composeValidators(ssnRequired, ssnFormatValid)}
          />

        </div>
        <div className={css.name}>
          <FieldTextInput
            className={css.licenseNumberBackground}
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            maxlength="13"
            autoComplete="licenseNumber"
            //label="License Number"
            placeholder="License #"
            value={this.state.licenseNumber}
            onInput={handleLicenseNumberChange}
            validate={validators.composeValidators(licenseNumberRequired)}
          />
          <FieldTextInput
            className={css.licenseStateBackground}
            type="text"
            id="licenseState"
            name="licenseState"
            maxlength="2"
            // autoComplete="licenseState"
            //label="State"
            placeholder="State"
            value={this.state.licenseState}
            onInput={handleLicenseStateChange}
            validate={validators.composeValidators(licenseStateRequired, licenseStateValid)}
          />
          <FieldTextInput
            className={css.zipBackground}
            type="text"
            id="licenseZip"
            name="licenseZip"
            //autoComplete="postal-code"
            //label="Zip Code"
            placeholder="Zip Code"
            value={this.state.zip}
            onInput={handleZipChange}
            validate={validators.composeValidators(addressZipRequired, addressZipValid)}
          />
        </div>
        <div>{this.state.licenseNumberAndStateValid === false ? backgroundFormError : null}</div>
        <div className={css.nextButton}>
          <PrimaryButton className={css.signupButton} inProgress={false} disabled={submitDisabled || !this.state.ssn || !this.state.licenseState || !this.state.licenseNumber || !this.state.dob}
                         onClick={licenseStateAndNumberValid}>
            Next
          </PrimaryButton>
        </div>

        {!(this.state.parentComponent === 'AccountSettings') ?
          <div className={css.skipText}>
            <a href="#" onClick={skipBackground} className={css.skipText}>
              Skip
            </a>{' '}
          </div>: null
        }

      </div>

    );

    const welcomeMessage= (
      <div className={css.welcomeMsgContent}>

          <h2 className={css.welcomeHeaderText}>Welcome to NurtureUp</h2>

        <div>
          <h3 className={css.welcomeMessageText}>Your account has been created!</h3>
          <div className={css.backgroundNotice}>You will be notified when your background check has been completed.</div>
        </div>
        <div>
          <PrimaryButton className={css.signupButton} onClick={this.showDashboard} disabled={!this.state.biChecked}>
            GO TO DASHBOARD
          </PrimaryButton>
          {/*<NamedLink name="SearchPage" className={css.signupButton}>*/}
          {/*  EXPLORE*/}
          {/*</NamedLink>*/}
        </div>
      </div>
    );

    const accountSettingsConfMessage= (
      <div className={css.welcomeMsgContent}>

        <h2 className={css.welcomeHeaderText}>Congratulations!</h2>

        <div>
          <h3 className={css.welcomeMessageText}>Your background check has been submitted to Checkr</h3>
          <div className={css.backgroundNotice}>You will be notified when your background check has been completed.</div>
        </div>
        <div>
          <PrimaryButton className={css.signupButton} onClick={this.showDashboard} disabled={!this.state.biChecked}>
            GO TO DASHBOARD
          </PrimaryButton>
        </div>
      </div>
    );


    const backgroundInvestigation = (
      <div>
        <h1 className={css.backgroundHeaderSubText}>Acknowledge</h1>
        {this.state.viewportWidth > 780 ?
           <div className={css.scrolling}>
              <SinglePagePDFViewer pdf={diclosureForBackgroundInvestigation} name={"Disclosure for Background"} width={this.state.viewportWidth}/>
           </div>
          :
          <div className={css.downloadLinkContainer}>
            <a href={diclosureForBackgroundInvestigation}
               className={css.downloadLink}
               download={"Disclosure for Background"} >
              Click here to view the required Disclosure for Background checks
            </a>
          </div>}
          {/*<SinglePagePDFViewer pdf={diclosureForBackgroundInvestigation} name={"Disclosure for Background"} width={pdfWidth}/>*/}

        <div className={css.checkbox}>
          <FieldCheckbox
            id="acknowledgeBI"
            name="acknowledgeBI"
            textClassName={css.acknowledgeReceiptText}
            label="I acknowledge receipt of the Disclosure regarding Background Investigation and certify that I have read and understand this document."
            value="acknowledgeBI"
            useSuccessColor
            onClick={handleBIAcknowledge}
          />
        </div>
        <div className={css.nextButton}>
          <PrimaryButton className={css.signupButton} onClick={this.handleBackgroundDisclosure} disabled={!this.state.biChecked}>
            Next
          </PrimaryButton>
        </div>
      </div>
    );


    const consumerRights = (
      <div>
        <h1 className={css.backgroundHeaderSubText}>Acknowledge</h1>
        {this.state.viewportWidth > 780 ?
          <div className={css.scrolling}>
          <SinglePagePDFViewer pdf={summaryOfRightsfile} name={"Consumer Rights Disclosure"} width={pdfWidth}/>
          </div>
          :  <div className={css.downloadLinkContainer}>
            <a href={summaryOfRightsfile}
               className={css.downloadLink}
               download={"Consumer Rights Disclosure"}>Click here to view the required Summary of Consumer Rights</a> </div>
        }
        <div className={css.checkbox}>
          <FieldCheckbox

            id="acknowledgeReceipt"
            name="acknowledgeReceipt"
            textClassName={css.acknowledgeReceiptText}
            label="I acknowledge receipt of the Summary of Your Rights Under the Fair Credit Reporting Act (FCRA) and certify that I have read and understand this document."
            value="acknowledgeReceipt"
            useSuccessColor
            onClick={handleAcknowledge}
          />
        </div>
        <div className={css.nextButton}>
          <PrimaryButton className={css.signupButton} onClick={this.handleConsumerRights} disabled={!this.state.checked}>
            Next
          </PrimaryButton>
        </div>
      </div>
    );


    const ackandAuth = (
      <div>
        <h1 className={css.backgroundHeaderSubText}>Acknowledge</h1>
          {this.state.viewportWidth > 780 ?
            <div className={css.scrolling}>
            <SinglePagePDFViewer pdf={ackAndAuthFile} name={"Authorization for Background"} width={pdfWidth}/>
            </div>
            :  <div className={css.downloadLinkContainer}>
              <a href={ackAndAuthFile}
                 className={css.downloadLink}
                 download={"Authorization for Background"}>Click here to view the required Authorization for Background Check</a> </div>}

        <div className={css.checkbox}>
          <FieldCheckbox
            id="ackAndAuthCheck"
            name="ackAndAuthCheck"
            textClassName={css.ackAndAuthCheckText}
            label="I would like to receive a copy of my consumer report."
            value="ackAndAuthCheck"
            useSuccessColor
            //onClick={handleAckAndAuth}
          />
        </div>
        <div className={css.scrolling}>
          <p>By typing my name below, I consent to the background checks and indicate my agreement to all of the above</p>
          <FieldTextInput
            className={css.fullName}
            type="text"
            id="fullName"
            name="fullName"
            label="Full Name"
            placeholder="Full Name"
            value={this.state.fullName}
            onBlur={handleFullNameSignature}
            //validate={validators.composeValidators(streetAddress1Required)}
          />

          {/*<div>*/}
          {/*  /!* You can replace captchaDemo with any ref word *!/*/}
          {/*  <ReCaptcha*/}
          {/*    ref={(el) => {this.captchaDemo = el;}}*/}
          {/*    size="normal"*/}
          {/*    data-theme="dark"*/}
          {/*    render="explicit"*/}
          {/*    sitekey="6LfAWLwZAAAAAPAP9PBFQfUOurORE2MMwNc9CARu"*/}
          {/*    onloadCallback={this.onLoadRecaptcha}*/}
          {/*    verifyCallback={this.verifyCallback}*/}
          {/*  />*/}
          {/*  <code>*/}
          {/*  </code>*/}
          {/*</div>*/}
        </div>
        <div>
          {/*<Button className={css.signupButton} disabled={!(this.state.recaptchaVerified && this.state.fullNameSignature)}*/}
          <PrimaryButton className={css.signupButton} disabled={!this.state.fullNameSignature} spinnerClassName={css.spinner}
                         inProgress={this.state.backgroundSubmitInProgress} onClick={handleFinalSubmit}>
            Submit Background Check
          </PrimaryButton>
        </div>
      </div>
    );
    return (




        <div className={classes}>
          {this.state.backgroundSubmitted === 'true' && this.state.parentComponent === 'AccountSettings' ?
            <div className={css.backgroundSubmitted}>You have submitted your background investigation. Please check back at a later time.</div>
            :
         <div>
          <div style={{display: this.state.showBackGroundInfoDiv ? "block" : "none"}}>
            {backgroundInfoDiv}
          </div>
          <div style={{display: this.state.showConsumerRights ? "block" : "none"}}>
            {consumerRights}
          </div>
          <div
            style={{display: this.state.showBackgroundInvestigationDisclosure ? "block" : "none"}}>
            {backgroundInvestigation}
          </div>
          <div style={{display: this.state.showAuth ? "block" : "none"}}>
            {ackandAuth}
          </div>
          <div style={{display: this.state.showWelcomeMessage ? "block" : "none"}}>
            {/*{welcomeMessage}*/}
            {this.state.parentComponent === 'AccountSettings' ? accountSettingsConfMessage : welcomeMessage}

          </div>

        </div>
  }
        </div>
    );
  }
}


BackgroundDisclosuresComponent.defaultProps = {
  className: null,
  rootClassName: '',
  contentPlacementOffset: CONTENT_PLACEMENT_OFFSET,
  contentPosition: CONTENT_TO_RIGHT,
  isOpen: null,
  onToggleActive: null,
  useArrow: true,
};

const { bool, func, node, number, string } = PropTypes;

BackgroundDisclosuresComponent.propTypes = {
  children: node.isRequired,
  className: string,
  rootClassName: string,
  contentPosition: string,
  contentPlacementOffset: number,
  useArrow: bool,
  isOpen: bool,
  onToggleActive: func,
  onSubmitBackgroundDisclosures: func.isRequired,
  history: shape({
    push: func.isRequired
  }).isRequired
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const {
    currentUser,
    currentUserListing,
  } = state.user;
  const {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    contactDetailsChanged,
  } = state.ContactDetailsPage;
  return {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    currentUser,
    currentUserListing,
    contactDetailsChanged,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const mapDispatchToProps = dispatch => ({
  //onChange: () => dispatch(saveBackgroundDisclosuresClear()),
  onSubmitBackgroundDisclosures: values => dispatch(requestSaveBackgroundInfo(values)),
  onUpdateUserProfile: params => dispatch(updateMetadata(params)),
});

const BackgroundDisclosures = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),


  injectIntl)(BackgroundDisclosuresComponent);


export default BackgroundDisclosures;
