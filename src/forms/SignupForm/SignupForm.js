import React, {Component, useState} from 'react';
import PropTypes, {number, shape} from 'prop-types';
import {compose} from 'redux';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import {Form as FinalForm} from 'react-final-form';
import classNames from 'classnames';
import * as validators from '../../util/validators';
import PhoneInput, {format, normalize} from "react-phone-input-auto-format";

import {withRouter} from 'react-router-dom';

import css from './SignupForm.css';
import {PaymentMethodsForm} from "../index";
import {ensureCurrentUser} from "../../util/data";
import {isScrollingDisabled, manageDisableScrolling} from "../../ducks/UI.duck";
import {
  chargeProFee,
  createStripeSetupIntent,
  stripeCustomer
} from "../../containers/PaymentMethodsPage/PaymentMethodsPage.duck";
import {handleCardSetup} from "../../ducks/stripe.duck";
import {deletePaymentMethod, savePaymentMethod} from "../../ducks/paymentMethods.duck";
import {connect} from "react-redux";
import FieldTextInput from "../../components/FieldTextInput/FieldTextInput";
import {
  Button,
  IconSearchCareGiver,
  IconSearchCareJob,
  PrimaryButton
} from "../../components";

import IconSearchCareJobSmall
  from "../../components/Icons/IconSearchCareJob/IconSearchCareJobSmall";
import IconSearchCareGiverSmall
  from "../../components/Icons/IconSearchCareGiver/IconSearchCareGiverSmall";
import {authenticationInProgress, signup, updateMetadata} from "../../ducks/Auth.duck";
import {sendVerificationEmail} from "../../ducks/user.duck";
import BackgroundDisclosures from "../../components/BackgroundDisclosures/BackgroundDisclosures";
import ProSubscriptionPaymentForm from "../PaymentMethodsForm/ProSubscriptionPaymentForm";
import {withViewport} from '../../util/contextHelpers';
import {
  Modal,
} from '../../components';
import SinglePagePDFViewer from "../../components/Pdf/single-page";
import CovidWaiverPdf from "../../assets/documents/COVID-19 Waiver_Draft.pdf"
import FieldCheckbox from "../../components/FieldCheckbox/FieldCheckbox";

const KEY_CODE_ENTER = 13;
const BACKSPACE = 8;


export class SignupFormComponent extends Component {
  constructor(props) {

    super(props);

    const {history, proFromLanding, pdfWidth} = props;
    //console.log(history);
    this.state = {
      iconState: '',
      showPaymentDiv: false,
      showDisclosures: false,
      showGeneralInfo: proFromLanding ? true : false,
      proSubPaymentInProgress: false,
      parentSubPaymentInProgress: false,
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      email: '',
      address1: '',
      address2: '',
      state: '',
      city: '',
      zip: '',
      password: '',
      ssn: '',
      licenseNumber: '',
      licenseState: '',
      accountType: proFromLanding ? 'pro' : '',
      cardErrorMsg: '',
      hasCardError: false,
      modalOpen: false,
      viewportWidth: '',
      pdfWidth: pdfWidth,
      covidAndTermsAck: false,
      proSubscriptionPaid: false,
    };

  }

  render() {

    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            formId,
            //           handleSubmit,
            inProgress,
            invalid,
            intl,
            onOpenTermsOfService,
            currentUser,
            onCreateSetupIntent,
            onUpdateUserProfile,
            onChargeProFee,
            onHandleCardSetup,
            onSavePaymentMethod,
            fetchStripeCustomer,
            submitSignup,
            onManageDisableScrolling,
            viewport,
          } = fieldRenderProps;

          const windowWidth = viewport.width;

          const {attributes} = currentUser || {};
          const {profile} = attributes || {};
          const {privateData} = profile || {};
          const {proSubscriptionPaid} = privateData || {};

          // email
          const emailLabel = intl.formatMessage({
            id: 'SignupForm.emailLabel',
          });
          const emailPlaceholder = intl.formatMessage({
            id: 'SignupForm.emailPlaceholder',
          });
          const emailRequiredMessage = intl.formatMessage({
            id: 'SignupForm.emailRequired',
          });
          const emailRequired = validators.required(emailRequiredMessage);
          const emailInvalidMessage = intl.formatMessage({
            id: 'SignupForm.emailInvalid',
          });
          const emailValid = validators.emailFormatValid(emailInvalidMessage);

          // phone
          const phoneLabel = intl.formatMessage({
            id: 'SignupForm.phoneLabel',
          });
          const phonePlaceholder = intl.formatMessage({
            id: 'SignupForm.phonePlaceholder',
          });
          const phoneRequiredMessage = intl.formatMessage({
            id: 'SignupForm.phoneRequired',
          });
          const phoneRequired = validators.required(phoneRequiredMessage);
          const phoneInvalidMessage = intl.formatMessage({
            id: 'SignupForm.phoneInvalid',
          });
          const phoneValid = validators.phoneFormatValid(phoneInvalidMessage);

          // birth date
          // const birthDateLabel = intl.formatMessage({
          //   id: 'SignupForm.birthDateLabel',
          // });
          // const birthDatePlaceholder = intl.formatMessage({
          //   id: 'SignupForm.birthDatePlaceholder',
          // });
          // const birthDateRequiredMessage = intl.formatMessage({
          //   id: 'SignupForm.birthDateRequired',
          // });
          // const birthDateRequired = validators.required(birthDateRequiredMessage);

          // state
          const stateLabel = intl.formatMessage({
            id: 'SignupForm.stateLabel',
          });
          const statePlaceholder = intl.formatMessage({
            id: 'SignupForm.statePlaceholder',
          });
          const stateRequiredMessage = intl.formatMessage({
            id: 'SignupForm.stateRequired',
          });
          const stateRequired = validators.required(stateRequiredMessage);
          const stateInvalidMessage = intl.formatMessage({
            id: 'SignupForm.stateInvalid',
          });
          const stateValid = validators.stateFormatValid(stateInvalidMessage);

          const passwordLabel = intl.formatMessage({
            id: 'SignupForm.passwordLabel',
          });
          const passwordPlaceholder = intl.formatMessage({
            id: 'SignupForm.passwordPlaceholder',
          });
          const passwordRequiredMessage = intl.formatMessage({
            id: 'SignupForm.passwordRequired',
          });
          const passwordMinLengthMessage = intl.formatMessage(
            {
              id: 'SignupForm.passwordTooShort',
            },
            {
              minLength: validators.PASSWORD_MIN_LENGTH,
            }
          );
          const passwordMaxLengthMessage = intl.formatMessage(
            {
              id: 'SignupForm.passwordTooLong',
            },
            {
              maxLength: validators.PASSWORD_MAX_LENGTH,
            }
          );
          const passwordMinLength = validators.minLength(
            passwordMinLengthMessage,
            validators.PASSWORD_MIN_LENGTH
          );
          const passwordMaxLength = validators.maxLength(
            passwordMaxLengthMessage,
            validators.PASSWORD_MAX_LENGTH
          );
          const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
          const passwordValidators = validators.composeValidators(
            passwordRequired,
            passwordMinLength,
            passwordMaxLength
          );

          // firstName
          const firstNameLabel = intl.formatMessage({
            id: 'SignupForm.firstNameLabel',
          });
          const firstNamePlaceholder = intl.formatMessage({
            id: 'SignupForm.firstNamePlaceholder',
          });
          const firstNameRequiredMessage = intl.formatMessage({
            id: 'SignupForm.firstNameRequired',
          });
          const firstNameRequired = validators.required(firstNameRequiredMessage);

          // lastName
          const lastNameLabel = intl.formatMessage({
            id: 'SignupForm.lastNameLabel',
          });
          const lastNamePlaceholder = intl.formatMessage({
            id: 'SignupForm.lastNamePlaceholder',
          });
          const lastNameRequiredMessage = intl.formatMessage({
            id: 'SignupForm.lastNameRequired',
          });
          const lastNameRequired = validators.required(lastNameRequiredMessage);

          // middleName
          const middleNameLabel = intl.formatMessage({
            id: 'SignupForm.middleNameLabel',
          });
          const middleNamePlaceholder = intl.formatMessage({
            id: 'SignupForm.middleNamePlaceholder',
          });

          // street address 1
          const streetAddress1Label = intl.formatMessage({
            id: 'SignupForm.streetAddress1Label',
          });
          const streetAddress1Placeholder = intl.formatMessage({
            id: 'SignupForm.streetAddress1Placeholder',
          });
          const streetAddress1RequiredMessage = intl.formatMessage({
            id: 'SignupForm.streetAddress1Required',
          });
          const streetAddress1Required = validators.required(streetAddress1RequiredMessage);

          // street address 2
          const streetAddress2Label = intl.formatMessage({
            id: 'SignupForm.streetAddress2Label',
          });
          const streetAddress2Placeholder = intl.formatMessage({
            id: 'SignupForm.streetAddress2Placeholder',
          });


          // city
          const addressCityLabel = intl.formatMessage({
            id: 'SignupForm.addressCityLabel',
          });
          const addressCityPlaceholder = intl.formatMessage({
            id: 'SignupForm.addressCityPlaceholder',
          });
          const addressCityRequiredMessage = intl.formatMessage({
            id: 'SignupForm.addressCityRequired',
          });
          const addressCityRequired = validators.required(addressCityRequiredMessage);

          // zip
          const addressZipLabel = intl.formatMessage({
            id: 'SignupForm.addressZipLabel',
          });
          const addressZipPlaceholder = intl.formatMessage({
            id: 'SignupForm.addressZipPlaceholder',
          });
          const addressZipRequiredMessage = intl.formatMessage({
            id: 'SignupForm.addressCityRequired',
          });
          const addressZipRequired = validators.required(addressZipRequiredMessage);

          const addressZipInvalidMessage = intl.formatMessage({
            id: 'SignupForm.addressZipInvalid',
          });
          const addressZipValid = validators.addressZipFormatValid(addressZipInvalidMessage);

          // ssn
          // const ssnLabel = intl.formatMessage({
          //   id: 'SignupForm.ssnLabel',
          // });
          // const ssnPlaceholder = intl.formatMessage({
          //   id: 'SignupForm.ssnPlaceholder',
          // });
          // const ssnRequiredMessage = intl.formatMessage({
          //   id: 'SignupForm.ssnRequired',
          // });
          // const ssnRequired = validators.required(ssnRequiredMessage);

          // // drivers license number
          // const licenseNumberLabel = intl.formatMessage({
          //   id: 'SignupForm.licenseNumberLabel',
          // });
          // const licenseNumberPlaceholder = intl.formatMessage({
          //   id: 'SignupForm.licenseNumberPlaceholder',
          // });
          // const licenseNumberRequiredMessage = intl.formatMessage({
          //   id: 'SignupForm.licenseNumberRequired',
          // });
          // const licenseNumberRequired = validators.required(licenseNumberRequiredMessage);
          //
          // // drivers license state
          // const licenseStateLabel = intl.formatMessage({
          //   id: 'SignupForm.licenseStateLabel',
          // });
          // const licenseStatePlaceholder = intl.formatMessage({
          //   id: 'SignupForm.licenseStatePlaceholder',
          // });
          // const licenseStateRequiredMessage = intl.formatMessage({
          //   id: 'SignupForm.licenseStateRequired',
          // });
          // const licenseStateRequired = validators.required(licenseStateRequiredMessage);


          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = inProgress;
          const submitDisabled = invalid || submitInProgress;
          //const hasCardError = this.state.error && !submitInProgress;

          const handleTermsKeyUp = e => {
            // Allow click action with keyboard like with normal links
            if (e.keyCode === KEY_CODE_ENTER) {
              onOpenTermsOfService();
            }
          };


          const covidAndTermsAcknowledge = values => {
            this.setState({covidAndTermsAck: !this.state.covidAndTermsAck});
          };


          const termsLink = (
            <span
              className={css.termsLink}
              onClick={onOpenTermsOfService}
              role="button"
              tabIndex="0"
              onKeyUp={handleTermsKeyUp}
            >
          <FormattedMessage id="SignupForm.termsAndConditionsLinkText"/>
        </span>
          );

          const covidWaiver = (
            <Modal
              id="covidAgreementModal"
              isOpen={this.state.modalOpen}
              onClose={() => closeModal()}
              onManageDisableScrolling={onManageDisableScrolling}
            >
              <SinglePagePDFViewer pdf={CovidWaiverPdf}/>
            </Modal>
          )

          const getClientSecret = setupIntent => {
            return setupIntent && setupIntent.attributes ? setupIntent.attributes.clientSecret : null;
          };
          const getPaymentParams = (currentUser, formValues) => {
            const {name, addressLine1, addressLine2, postal, state, city, country} = formValues;
            const addressMaybe =
              addressLine1 && postal
                ? {
                  address: {
                    city: city,
                    country: country,
                    line1: addressLine1,
                    line2: addressLine2,
                    postal_code: postal,
                    state: state,
                  },
                }
                : {};
            const billingDetails = {
              name,
              email: ensureCurrentUser(currentUser).attributes.email,
              ...addressMaybe,
            };

            const paymentParams = {
              payment_method_data: {
                billing_details: billingDetails,
              },
            };

            return paymentParams;
          };

          const handleParentSignup = values => {
            this.setState({accountType: 'parent'});
            this.setState({showGeneralInfo: true});
            //this.setState({iconState: true});
          };
          const handleServiceProSignup = values => {
            this.setState({accountType: 'pro'});
            this.setState({showGeneralInfo: true});
          };


          const handleSubmitSignup = values => {
            this.setState({viewportWidth: windowWidth});
            //console.log('In Signup, viewportWidth set to ' + this.state.viewportWidth);

            this.setState({showPaymentDiv: true});


            const params = {
              firstName: this.state.firstName.trim(),
              lastName: this.state.lastName.trim(),
              email: this.state.email.trim(),
              password: this.state.password.trim(),
              phone: this.state.phone.trim(),
              streetAddress1: this.state.address1.trim(),
              streetAddress2: this.state.address2.trim(),
              zip: this.state.zip.trim(),
              city: this.state.city.trim(),
              state: this.state.state.trim(),
              accountType: this.state.accountType.trim()
            }
            submitSignup(params).then(result => {
              //console.log('result of erroneous signup = ' + result);
              if (result === 409) {
                this.setState({showDisclosures: false});
                this.setState({showPaymentDiv: false});
                this.setState({showGeneralInfo: true});
              }
            });

          };


          const skipPayment = () => {
            const {history} = this.props;
            const params = {paymentMethodAdded: "false"};
            if (this.state.accountType === 'pro') {
              params.proSubscriptionPaid = "false";
            }

            onUpdateUserProfile(params)
              .then(result => {

                history.push('/dashboard');
              })
              .catch(error => {
                console.error(error);
                //setIsSubmitting(false);
              });
          };

          const handlePaymentSubmit = (params, values) => {
            //setIsSubmitting = true;
            const ensuredCurrentUser = ensureCurrentUser(currentUser);
            const stripeCustomer = ensuredCurrentUser.stripeCustomer;
            const {stripe, card, formValues} = params;
            //console.log(params);
            const {history} = this.props;
            //console.log(history);
            //console.log('In Signup, pdfWidth set to ' + this.state.pdfWidth);
            this.setState({proSubPaymentInProgress: true});
            this.setState({parentSubPaymentInProgress: true});

            onCreateSetupIntent()
              .then(setupIntent => {
                const stripeParams = {
                  stripe,
                  card,
                  setupIntentClientSecret: getClientSecret(setupIntent),
                  paymentParams: getPaymentParams(currentUser, formValues),
                };

                //console.log('Stripe Params = ' + stripeParams);
                return onHandleCardSetup(stripeParams);
              })
              .then(result => {
                ////console.log('in result = ' + result);
                const newPaymentMethod = result.setupIntent.payment_method;
                // Note: stripe.handleCardSetup might return an error inside successful call (200), but those are rejected in thunk functions.
                ////console.log("stripe cust = " +stripeCustomer );

                return onSavePaymentMethod(stripeCustomer, newPaymentMethod);
              })
              .then(result => {
                // Update currentUser entity and its sub entities: stripeCustomer and defaultPaymentMethod
                //console.log("response = " + JSON.stringify(result));
                fetchStripeCustomer();
                //setIsSubmitting(false);
                //setCardState('default');
                return result.attributes.stripeCustomerId;
              })
              .then(stripeCustomerId => {
                if (this.state.accountType === 'pro') {
                  return onChargeProFee(stripeCustomerId);
                } else {
                  return;
                }
              })
              .then(() => {
                const params = {paymentMethodAdded: "true"};
                if (this.state.accountType === 'pro') {
                  params.proSubscriptionPaid = "true";
                  this.setState({proSubscriptionPaid: 'true'});
                }

                onUpdateUserProfile(params).then(() => {
                  if (this.state.accountType === 'pro') {
                    //console.log('This is a PRO, so we need to open disclosures');
                    this.setState({parentSubPaymentInProgress: false});
                    this.setState({
                      showPaymentDiv: false,
                      showDisclosures: true,
                      proSubPaymentInProgress: false
                    });
                  } else {
                    //console.log('This is a PARENT, so we need to go to dashboard');
                    this.setState({proSubPaymentInProgress: false});
                    this.setState({parentSubPaymentInProgress: false});
                    history.push('/dashboard');
                  }
                });
              })
              .catch(error => {
                console.error('ERROR!!!' + JSON.stringify(error));
                const errorMsg = error.message;
                //console.log('error message in set state =' + errorMsg);
                this.setState({cardErrorMsg: errorMsg});
                this.setState({hasCardError: true});
                //console.log('this.state.error = ' + JSON.stringify(this.state.cardErrorMsg));
                ////console.log('hasCardError' + JSON.stringify(hasCardError));
                //let hasCardError = true;
                //setIsSubmitting(false);
              });

            // return  <NamedRedirect name="Dashboard"/>;

          };

          const paymentFormDiv = (
            <div>
              <h1 className={css.createAccountGeneralHeaderText}>Payment</h1>
              <h1 className={css.createAccountInfoSubText}>Add a default payment method</h1>
              {this.state.hasCardError ?
                <span className={css.error}>{this.state.cardErrorMsg}</span> : null}
              <PaymentMethodsForm
                formId="PaymentMethodsForm"
                //onSubmit={handlePaymentSubmit}
                onSubmit={(params, values) => handlePaymentSubmit(params, values)}
                inProgress={this.state.parentSubPaymentInProgress}
              />
              <div className={css.skipText}>
                <a href="#" onClick={skipPayment} className={css.skipText}>
                  Skip
                </a>{' '}
              </div>
            </div>
          );

          const proPaymentFormDiv = (
            <div>
              <h1 className={css.createAccountGeneralHeaderText}>Payment</h1>
              <h1 className={css.createAccountInfoSubText}>Pay $99 Pro Subscription Fee</h1>

              {this.state.hasCardError ?
                <span className={css.error}>{this.state.cardErrorMsg}</span> : null}

              <ProSubscriptionPaymentForm
                formId="PaymentMethodsForm"
                //onSubmit={handlePaymentSubmit}
                onSubmit={(params, values) => handlePaymentSubmit(params, values)}
                proPaymentInProgress={this.state.proSubPaymentInProgress}
              />
              <div className={css.skipText}>
                <a href="#" onClick={skipPayment} className={css.skipText}>
                  Skip
                </a>{' '}
              </div>
            </div>
          );

          const backgroundDisclosuresDiv =  (
              <div>
              <h1 className={css.createAccountGeneralHeaderText}>Background Check</h1>
              <BackgroundDisclosures
                values={this.state}/>
            </div>
            );

          // const showBackgroundDisclosures = values => {
          //   //window.alert('I made it');
          //   this.setState({showDisclosures: true});
          //   this.setState({showPaymentDiv: false});
          // };
          //
          // const Input = () => {
          //   return <PhoneInput onChange={handlePhoneChange} />;
          // };
          //
          // const handleFormatChange = value => {
          //
          // };

          const handlePhoneFormat = (phoneValue) => {
            let parts = phoneValue.match(/^\(?(\d{3})\D*(\d{3})\D*(\d{4})$/);

            let formatted = '';

            if (parts) {
              formatted = '(' + parts[1] + ') ' + parts[2] + '-' + parts[3];
            }
            return formatted;
          };


          const capitalize = (inputName) => {
            const nameCapitalized = inputName.charAt(0).toUpperCase() + inputName.slice(1);
            return nameCapitalized;
          }


          const handleNameChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)
            this.setState({testName: event.target.value});
          };
          const handleFirstNameChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)

            this.setState({firstName: capitalize(event.target.value)});
          };
          const handleMiddleNameChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)

            this.setState({middleName: capitalize(event.target.value)});
          };
          const handleLastNameChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)
            this.setState({lastName: capitalize(event.target.value)});
          };
          const handlePhoneChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)


            let userInput = event.target.value;

            if (userInput.length === 10) {
              event.target.value = handlePhoneFormat(userInput);
              //console.log('after format ' + event.target.value);
            }

            this.setState({phone: event.target.value});

          };
          const handleEmailChange = (event) => {
            //validators.composeValidators(emailRequired, emailValid);
            //console.log('In handleEmailChange');
            //console.log('Event = ' + event);
            //console.log('Event.target.value = ' + event.target.value);
            this.setState({email: event.target.value});
          };
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
          const handleSSNChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)
            this.setState({ssn: event.target.value});
          };

          const handleLicenseStateChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)
            this.setState({licenseState: event.target.value});
          };

          const handleLicenseNumberChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)
            this.setState({licenseNumber: event.target.value});
          };
          const handleNoMiddleNameChange = (event) => {
            //console.log(event)
            //console.log(event.target.value)
            this.setState({licenseNumber: event.target.value});
          };

          const closeModal = () => {
            this.setState({modalOpen: false});

          };
          const openModal = () => {
            this.setState({modalOpen: true});

          };

          const createYourAccountDiv = (
            <div className={css.createYourAccountContent}>
              <h1 className={css.createAccountGeneralHeaderText}>Create Your Account</h1>
              <h1 className={css.createAccountInfoSubText}>I am registering as a...</h1>
              <div className={css.caregiverSeekerButtons}>
                <Button rootClassName={css.searchButton} inProgress={false}
                        disabled={submitDisabled}
                        onClick={handleServiceProSignup}>
                  <span className={css.serviceProWords}> Service Pro</span>
                  <br/>
                  <span className={css.serviceProImg}>
                    <IconSearchCareGiver className={css.iconFill}/>
                  </span>
                </Button>
                <div>

                </div>
                <Button rootClassName={css.searchButton} inProgress={false}
                        disabled={submitDisabled}
                        onClick={handleParentSignup}>
                  <span className={css.parentWords}>Parent</span>
                  <br/>
                  <span className={css.parentImg}>
                    <IconSearchCareJob className={css.iconFill}/>
                  </span>
                </Button>
              </div>
            </div>
          );

          const proIcon = (
            <div className={css.iconBackground}>
              <p className={css.iconText}><IconSearchCareGiverSmall className={css.iconImage}/>Service
                Pro</p>
              {/*<div className={css.iconImage}><IconSearchCareJob/></div>*/}
            </div>
          );
          const parentIcon = (
            <div className={css.iconBackground}>
              <p className={css.iconText}><IconSearchCareJobSmall className={css.iconImage}/> Parent
              </p>
              {/*<IconSearchCareGiver className={css.iconImage}/>*/}
            </div>
          );


          const generalInfoDiv = (
            <div className={css.createYourAccountContent}>
              <h1 className={css.createAccountGeneralHeaderText}>Create Your Account</h1>
              <h1 className={css.createAccountInfoSubText}>Fill out the form below</h1>

              <div className={css.name}>
                <FieldTextInput
                  className={css.firstNameRoot}
                  type="text"
                  id={formId ? `${formId}.fname` : 'fname'}
                  name="fname"
                  autoComplete="given-name"
                  // label={firstNameLabel}
                  placeholder={firstNameLabel}
                  ref={this.input}
                  value={this.state.lastName}
                  onInput={handleFirstNameChange}
                  validate={firstNameRequired}
                />
                <FieldTextInput
                  className={css.lastNameRoot}
                  type="text"
                  id={formId ? `${formId}.lname` : 'lname'}
                  name="lname"
                  autoComplete="family-name"
                  //label={lastNameLabel}
                  placeholder={lastNameLabel}
                  value={this.state.lastName}
                  onInput={handleLastNameChange}
                  validate={lastNameRequired}
                />
              </div>
              <div className={css.phoneEmail}>
                <FieldTextInput
                  className={css.phone}
                  type="phone"
                  id={formId ? `${formId}.phone` : 'phone'}
                  name="phone"
                  maxLength="10"
                  autoComplete="phone"
                  //label={phoneLabel}
                  placeholder={phoneLabel}
                  value={this.state.phone}
                  onInput={handlePhoneChange}
                  validate={validators.composeValidators(phoneRequired, phoneValid)}
                />
                <FieldTextInput
                  className={css.email}
                  type="email"
                  id={formId ? `${formId}.email` : 'email'}
                  name="email"
                  autoComplete="email"
                  //label={emailLabel}
                  placeholder={emailLabel}
                  //value={this.state.email}
                  validate={validators.composeValidators(emailRequired, emailValid)}
                  onInput={handleEmailChange}
                />
              </div>
              <div className={css.addressFields}>
                <FieldTextInput
                  className={css.paymentAddressField}
                  type="text"
                  id={formId ? `${formId}.streetAddress1` : 'streetAddress1'}
                  name="streetAddress1"
                  autoComplete="address-line1"
                  //label={streetAddress1Label}
                  placeholder={streetAddress1Label}
                  value={this.state.address1}
                  onInput={handleAddress1Change}
                  validate={validators.composeValidators(streetAddress1Required)}
                />
                <FieldTextInput
                  className={css.paymentAddressField}
                  type="text"
                  id={formId ? `${formId}.streetAddress2` : 'streetAddress2'}
                  name="streetAddress2"
                  autoComplete="address-line2"
                  //label={streetAddress2Label}
                  value={this.state.address2}
                  onInput={handleAddress2Change}
                  placeholder={streetAddress2Label}
                />
              </div>

              <div className={css.cityStateZip}>
                <FieldTextInput
                  className={css.city}
                  type="text"
                  id={formId ? `${formId}.city` : 'city'}
                  name="city"
                  autoComplete="address-level2"
                  //label={addressCityLabel}
                  placeholder={addressCityLabel}
                  value={this.state.city}
                  onInput={handleCityChange}
                  validate={validators.composeValidators(addressCityRequired)}
                />
                <FieldTextInput
                  id={formId ? `${formId}.state` : 'state'}
                  name="state"
                  maxLength="2"
                  className={css.state}
                  type="text"
                  autoComplete="address-level1"
                  //label={stateLabel}
                  value={this.state.state}
                  onInput={handleStateChange}
                  placeholder={stateLabel}
                  validate={validators.composeValidators(stateRequired, stateValid)}
                />
              </div>
              <div className={css.cityStateZip}>
                <FieldTextInput
                  className={css.zip}
                  type="text"
                  id={formId ? `${formId}.zip` : 'zip'}
                  name="zip"
                  maxLength="10"
                  autoComplete="postal-code"
                  //label={addressZipLabel}
                  placeholder={addressZipLabel}
                  value={this.state.zip}
                  onInput={handleZipChange}
                  validate={validators.composeValidators(addressZipRequired, addressZipValid)}
                />
              </div>

              <div>
                <FieldTextInput
                  className={css.password}
                  type="password"
                  id={formId ? `${formId}.password` : 'password'}
                  name="password"
                  autoComplete="new-password"
                  //label={passwordLabel}
                  placeholder={passwordLabel}
                  value={this.state.password}
                  onInput={handlePasswordChange}
                  validate={passwordValidators}
                />
              </div>

              <div className={css.bottomWrapper}>

                <p className={css.bottomWrapperText}>
              <span className={css.termsText}>
                <FieldCheckbox
                  id="covidAndTermsCheck"
                  name="covidAndTermsCheck"
                  // textClassName={css.termsLink}
                  // label=""
                  value="covidAndTermsCheck"
                  useSuccessColor
                  onClick={covidAndTermsAcknowledge}
                />
                <FormattedMessage
                  id="SignupForm.termsAndConditionsAcceptText"
                  values={{termsLink}}
                />&nbsp;and {covidWaiver}
                {windowWidth > 700 ?
                  <a href="#" className={css.termsLink} onClick={() => openModal(true)}> COVID-19
                    Waiver</a> :
                  <a href={CovidWaiverPdf} download={"Covid-19 Waiver"}>COVID-19 Waiver</a>}


              </span>


                </p>

                <PrimaryButton className={css.signupButton} inProgress={false}
                               disabled={submitDisabled || !this.state.covidAndTermsAck}
                               onClick={handleSubmitSignup} spinnerClassName={css.spinner}>
                  Submit
                </PrimaryButton>
                {/*<div className={css.caregiverSeekerButtons}>*/}
                {/*  <div className={css.seeker}>*/}
                {/*    <PrimaryButton inProgress={false} disabled={submitDisabled}*/}
                {/*                   onClick={handleSubmitSignup}>*/}
                {/*      I am a Care Seeker*/}
                {/*    </PrimaryButton>*/}
                {/*  </div>*/}
                {/*  <div className={css.caregiver}>*/}
                {/*    <PrimaryButton inProgress={false} disabled={submitDisabled}*/}
                {/*                   onClick={handleGiverSignup}>*/}
                {/*      I am a Care Giver*/}
                {/*    </PrimaryButton>*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>
            </div>
          );

          return (

            <div className={css.content}>
              {
                this.state.accountType === 'parent' ? parentIcon :
                  this.state.accountType === 'pro' ? proIcon : null
              }

              {
                this.state.showPaymentDiv && this.state.accountType === 'parent' ? paymentFormDiv :
                  this.state.showPaymentDiv && this.state.accountType === 'pro' ? proPaymentFormDiv :
                    this.state.showDisclosures ? backgroundDisclosuresDiv :
                      this.state.showGeneralInfo ? generalInfoDiv : createYourAccountDiv
              }
            </div>

          );
        }}
      />
    );
  };
}


SignupFormComponent.defaultProps = {
  inProgress: false,
  proFromLanding: false,
};

const {bool, func, oneOf} = PropTypes;

SignupFormComponent.propTypes = {
  inProgress: bool,
  proFromLanding: bool,

  onOpenTermsOfService: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  submitSignup: func.isRequired,
  //sendVerificationEmailInProgress: bool.isRequired,
  //sendVerificationEmailError: propTypes.error,
  onResendVerificationEmail: func.isRequired,
  // from injectIntl
  intl: intlShape.isRequired,
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired
  }).isRequired
};

const mapStateToProps = state => {
  const {isAuthenticated, signupError} = state.Auth;
  const {currentUser, sendVerificationEmailInProgress, sendVerificationEmailError} = state.user;
  return {
    authInProgress: authenticationInProgress(state),
    currentUser,
    isAuthenticated,
    scrollingDisabled: isScrollingDisabled(state),
    signupError,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
  };
};
const mapDispatchToProps = dispatch => ({

  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  fetchStripeCustomer: () => dispatch(stripeCustomer()),
  onHandleCardSetup: params => dispatch(handleCardSetup(params)),
  onCreateSetupIntent: params => dispatch(createStripeSetupIntent(params)),
  onUpdateUserProfile: params => dispatch(updateMetadata(params)),
  onChargeProFee: (stripeCustomer) => dispatch(chargeProFee(stripeCustomer)),
  onSavePaymentMethod: (stripeCustomer, newPaymentMethod) =>
    dispatch(savePaymentMethod(stripeCustomer, newPaymentMethod)),
  onDeletePaymentMethod: params => dispatch(deletePaymentMethod(params)),
  submitSignup: params => dispatch(signup(params)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const SignupForm = compose(
  withRouter,
  withViewport,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl)(SignupFormComponent);
SignupForm.displayName = 'SignupForm';

export default SignupForm;
