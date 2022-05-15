import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import {Form as FinalForm} from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import {propTypes} from '../../util/types';
import * as validators from '../../util/validators';
import {ensureCurrentUser} from '../../util/data';
import {
  isChangeEmailTakenError,
  isChangeEmailWrongPassword,
  isTooManyEmailVerificationRequestsError,
} from '../../util/errors';
import {
  FieldPhoneNumberInput,
  Form,
  PrimaryButton,
  FieldTextInput,
  FieldCheckboxGroup, FieldSelect
} from '../../components';

import css from './AboutMeForm.css';
import {PARENT_PREFERENCES} from "../BioForm/bioLists";
import arrayMutators from "final-form-arrays";
import {US_STATES} from "../../util/statesAndProvinces";

const SHOW_EMAIL_SENT_TIMEOUT = 2000;

class AboutMeFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {showVerificationEmailSentMessage: false};
    this.emailSentTimeoutId = null;
    this.handleResendVerificationEmail = this.handleResendVerificationEmail.bind(this);
    this.submittedValues = {};
  }

  componentWillUnmount() {
    window.clearTimeout(this.emailSentTimeoutId);
  }

  handleResendVerificationEmail() {
    this.setState({showVerificationEmailSentMessage: true});

    this.props.onResendVerificationEmail().then(() => {
      // show "verification email sent" text for a bit longer.
      this.emailSentTimeoutId = window.setTimeout(() => {
        this.setState({showVerificationEmailSentMessage: false});
      }, SHOW_EMAIL_SENT_TIMEOUT);
    });
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        mutators={{...arrayMutators}}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            currentUser,
            saveUserError,
            saveEmailError,
            formId,
            handleSubmit,
            inProgress,
            intl,
            invalid,
            sendVerificationEmailError,
            sendVerificationEmailInProgress,
            values,
            isParent,
          } = fieldRenderProps;

          const {
            email,
            phone,
            firstName,
            lastName,
            city,
            state,
            zip,
            address1,
            address2,
            preferences,
          } = values;
          const user = ensureCurrentUser(currentUser);
          if (!user.id) {
            return null;
          }

          const attributes = user.attributes || {}
          const {
            email: currentEmail,
            emailVerified,
            pendingEmail,
            profile,
          } = attributes;

          const {
            firstName: currentFirstName,
            lastName: currentLastName,
            protectedData,
            publicData,
          } = profile || {};
          const {preferences: currentPreferences} = publicData || {};
          const {
            city: currentCity,
            state: currentState,
            phone: currentPhone,
            streetAddress1: currentAddress1,
            streetAddress2: currentAddress2,
            zip: currentZip,
          } = protectedData || {};

          // firstName
          const hasFirstNameChanged = currentFirstName !== firstName;
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
          const hasLastNameChanged = currentLastName !== lastName;
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

          // email

          // has the email changed
          const emailChanged = currentEmail !== email;

          const emailLabel = intl.formatMessage({
            id: 'AboutMeForm.emailLabel',
          });

          const emailPlaceholder = currentEmail || '';

          const emailRequiredMessage = intl.formatMessage({
            id: 'AboutMeForm.emailRequired',
          });
          const emailRequired = validators.required(emailRequiredMessage);
          const emailInvalidMessage = intl.formatMessage({
            id: 'AboutMeForm.emailInvalid',
          });
          const emailValid = validators.emailFormatValid(emailInvalidMessage);

          const tooManyVerificationRequests = isTooManyEmailVerificationRequestsError(
            sendVerificationEmailError
          );

          const emailTouched = this.submittedValues.email !== values.email;
          const emailTakenErrorText = isChangeEmailTakenError(saveEmailError)
            ? intl.formatMessage({id: 'AboutMeForm.emailTakenError'})
            : null;

          let resendEmailMessage;
          if (tooManyVerificationRequests) {
            resendEmailMessage = (
              <span className={css.tooMany}>
                <FormattedMessage id="AboutMeForm.tooManyVerificationRequests"/>
              </span>
            );
          } else if (
            sendVerificationEmailInProgress ||
            this.state.showVerificationEmailSentMessage
          ) {
            resendEmailMessage = (
              <span className={css.emailSent}>
                <FormattedMessage id="AboutMeForm.emailSent"/>
              </span>
            );
          } else {
            resendEmailMessage = (
              <span
                className={css.helperLink}
                onClick={this.handleResendVerificationEmail}
                role="button"
              >
                <FormattedMessage id="AboutMeForm.resendEmailVerificationText"/>
              </span>
            );
          }

          // Email status info: unverified, verified and pending email (aka changed unverified email)
          let emailVerifiedInfo = null;

          if (emailVerified && !pendingEmail && !emailChanged) {
            // Current email is verified and there's no pending unverified email
            emailVerifiedInfo = (
              <span className={css.emailVerified}>
                <FormattedMessage id="AboutMeForm.emailVerified"/>
              </span>
            );
          } else if (!emailVerified && !pendingEmail) {
            // Current email is unverified. This is the email given in sign up form

            emailVerifiedInfo = (
              <span className={css.emailUnverified}>
                <FormattedMessage
                  id="AboutMeForm.emailUnverified"
                  values={{resendEmailMessage}}
                />
              </span>
            );
          } else if (pendingEmail) {
            // Current email has been tried to change, but the new address is not yet verified

            const pendingEmailStyled = <span className={css.emailStyle}>{pendingEmail}</span>;
            const pendingEmailCheckInbox = (
              <span className={css.checkInbox}>
                <FormattedMessage
                  id="AboutMeForm.pendingEmailCheckInbox"
                  values={{pendingEmail: pendingEmailStyled}}
                />
              </span>
            );

            emailVerifiedInfo = (
              <span className={css.pendingEmailUnverified}>
                <FormattedMessage
                  id="AboutMeForm.pendingEmailUnverified"
                  values={{pendingEmailCheckInbox, resendEmailMessage}}
                />
              </span>
            );
          }

          // phone
          // has the phone number changed
          const phoneNumberChanged = currentPhone !== phone;

          const phonePlaceholder = intl.formatMessage({
            id: 'AboutMeForm.phonePlaceholder',
          });
          const phoneLabel = intl.formatMessage({id: 'AboutMeForm.phoneLabel'});

          // street address 1
          const hasAddress1Changed = currentAddress1 !== address1;

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
          const hasAddress2Changed = currentAddress2 !== address2;
          const streetAddress2Label = intl.formatMessage({
            id: 'SignupForm.streetAddress2Label',
          });
          const streetAddress2Placeholder = intl.formatMessage({
            id: 'SignupForm.streetAddress2Placeholder',
          });

          // state
          const hasStateChanged = currentState !== state;
          const stateLabel = intl.formatMessage({
            id: 'SignupForm.stateLabel',
          });
          const statePlaceholder = intl.formatMessage({
            id: 'SignupForm.statePlaceholder',
          });

          // city
          const hasCityChanged = currentCity !== city;
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
          const hasZipChanged = currentZip !== zip;
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

          //Preferences
          const preferencesChanged = JSON.stringify(currentPreferences) !== JSON.stringify(preferences);
          const preferencesLabel = intl.formatMessage({id: 'AboutMeForm.preferencesLabel'});

          // password
          const passwordLabel = intl.formatMessage({
            id: 'AboutMeForm.passwordLabel',
          });
          const passwordPlaceholder = intl.formatMessage({
            id: 'AboutMeForm.passwordPlaceholder',
          });
          const passwordRequiredMessage = intl.formatMessage({
            id: 'AboutMeForm.passwordRequired',
          });

          const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);

          const passwordMinLengthMessage = intl.formatMessage(
            {
              id: 'AboutMeForm.passwordTooShort',
            },
            {
              minLength: validators.PASSWORD_MIN_LENGTH,
            }
          );

          const passwordMinLength = validators.minLength(
            passwordMinLengthMessage,
            validators.PASSWORD_MIN_LENGTH
          );

          const passwordValidators = emailChanged
            ? validators.composeValidators(passwordRequired, passwordMinLength)
            : null;

          const passwordFailedMessage = intl.formatMessage({
            id: 'AboutMeForm.passwordFailed',
          });
          const passwordTouched = this.submittedValues.currentPassword !== values.currentPassword;
          const passwordErrorText = isChangeEmailWrongPassword(saveEmailError)
            ? passwordFailedMessage
            : null;

          const confirmClasses = classNames(css.confirmChangesSection, {
            [css.confirmChangesSectionVisible]: emailChanged,
          });

          // generic error
          const isGenericEmailError = saveEmailError && !(emailTakenErrorText || passwordErrorText);

          let genericError = null;

          if (isGenericEmailError && saveUserError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="AboutMeForm.genericFailure"/>
              </span>
            );
          } else if (isGenericEmailError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="AboutMeForm.genericEmailFailure"/>
              </span>
            );
          } else if (saveUserError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="AboutMeForm.genericUserFailure"/>
              </span>
            );
          }

          const classes = classNames(rootClassName || css.root, className);
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid ||
            pristineSinceLastSubmit ||
            inProgress ||
            !(emailChanged || phoneNumberChanged || hasAddress1Changed || hasAddress2Changed ||
              hasLastNameChanged || hasFirstNameChanged || hasZipChanged || hasCityChanged ||
              hasStateChanged || preferencesChanged);

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.contactDetailsSection}>
                <div className={css.nameDiv}>
                  <FieldTextInput
                    className={css.firstNameRoot}
                    type="text"
                    id={formId ? `${formId}.firstName` : 'firstName'}
                    name="firstName"
                    autoComplete="given-name"
                    //label={firstNameLabel}
                    placeholder={firstNameLabel}
                    validate={firstNameRequired}
                  />
                  <FieldTextInput
                    className={css.lastNameRoot}
                    type="text"
                    id={formId ? `${formId}.lastName` : 'lastName'}
                    name="lastName"
                    autoComplete="family-name"
                    //label={lastNameLabel}
                    placeholder={lastNameLabel}
                    validate={lastNameRequired}
                  />
                </div>
                <div className={css.phoneEmailDiv}>
                  <FieldPhoneNumberInput
                    className={css.phone}
                    name="phone"
                    id={formId ? `${formId}.phone` : 'phone'}
                    //label={phoneLabel}
                    placeholder={phoneLabel}
                  />
                  <div className={css.email}>
                    <FieldTextInput
                      type="email"
                      name="email"
                      id={formId ? `${formId}.email` : 'email'}
                      //label={emailLabel}
                      placeholder={emailLabel}
                      validate={validators.composeValidators(emailRequired, emailValid)}
                      customErrorText={emailTouched ? null : emailTakenErrorText}
                    />
                    {emailVerifiedInfo}
                  </div>
                </div>

                <FieldTextInput
                  className={css.addressField1}
                  type="text"
                  id={formId ? `${formId}.address1` : 'address1'}
                  name="address1"
                  autoComplete="address-line1"
                  //label={streetAddress1Label}
                  placeholder={streetAddress1Label}
                  validate={validators.composeValidators(streetAddress1Required)}
                />
                <FieldTextInput
                  className={css.addressField2}
                  type="text"
                  id={formId ? `${formId}.address2` : 'address2'}
                  name="address2"
                  autoComplete="address-line2"
                  //label={streetAddress2Label}
                  value={currentAddress2}
                  placeholder={streetAddress2Label}
                />

                <div className={css.cityState}>
                  <FieldTextInput
                    className={css.city}
                    type="text"
                    id={formId ? `${formId}.city` : 'city'}
                    name="city"
                    autoComplete="address-level2"
                    //label={addressCityLabel}
                    placeholder={addressCityLabel}
                    validate={validators.composeValidators(addressCityRequired)}
                  />

                  <FieldSelect
                    id={formId ? `${formId}.state` : 'state'}
                    name="state"
                    className={css.state}
                    autoComplete="address-level1"
                    //label={stateLabel}
                  >
                    <option disabled value="">
                      {statePlaceholder}
                    </option>
                    {US_STATES.map(p => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </FieldSelect>

                </div>
                <FieldTextInput
                  className={css.zip}
                  type="text"
                  id={formId ? `${formId}.zip` : 'zip'}
                  name="zip"
                  autoComplete="postal-code"
                  //label={addressZipLabel}
                  placeholder={addressZipLabel}
                  validate={validators.composeValidators(addressZipRequired, addressZipValid)}
                />
              </div>

              {isParent ?
                <div className={css.schedulingPrefs}>
                  <FieldCheckboxGroup
                    label={preferencesLabel}
                    name="preferences"
                    id={formId ? `${formId}.preferences` : 'preferences'}
                    twoColumns={true}
                    options={PARENT_PREFERENCES}
                  />
                </div>
                : null}

              <div className={confirmClasses}>
                <h3 className={css.confirmChangesTitle}>
                  <FormattedMessage id="AboutMeForm.confirmChangesTitle"/>
                </h3>
                <p className={css.confirmChangesInfo}>
                  <FormattedMessage id="AboutMeForm.confirmChangesInfo"/>
                </p>

                <FieldTextInput
                  className={css.password}
                  type="password"
                  name="currentPassword"
                  id={formId ? `${formId}.currentPassword` : 'currentPassword'}
                  autoComplete="current-password"
                  //label={passwordLabel}
                  placeholder={passwordLabel}
                  validate={passwordValidators}
                  customErrorText={passwordTouched ? null : passwordErrorText}
                />
              </div>
              <div className={css.bottomWrapper}>
                {genericError}
                <PrimaryButton
                  type="submit"
                  inProgress={inProgress}
                  ready={pristineSinceLastSubmit}
                  disabled={submitDisabled}
                >
                  <FormattedMessage id="AboutMeForm.saveChanges"/>
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

AboutMeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  saveUserError: null,
  saveEmailError: null,
  inProgress: false,
  sendVerificationEmailError: null,
  sendVerificationEmailInProgress: false,
};

const {bool, func, string} = PropTypes;

AboutMeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,
  saveUserError: propTypes.error,
  saveEmailError: propTypes.error,
  inProgress: bool,
  intl: intlShape.isRequired,
  onResendVerificationEmail: func.isRequired,
  sendVerificationEmailError: propTypes.error,
  sendVerificationEmailInProgress: bool,
};

const AboutMeForm = compose(injectIntl)(AboutMeFormComponent);

AboutMeForm.displayName = 'AboutMeForm';

export default AboutMeForm;
