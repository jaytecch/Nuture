import React from 'react';
import { bool, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { sendVerificationEmail } from '../../ducks/user.duck';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page, Hero, AvatarDashboard,
} from '../../components';
import { AboutMeForm } from '../../forms';
import { TopbarContainer } from '../../containers';

import { isScrollingDisabled } from '../../ducks/UI.duck';
import {saveInfo, saveContactDetailsClear} from './ContactDetailsPage.duck';
import css from './ContactDetailsPage.css';
import heroUrl from "../../assets/hero-img-account-settings/hero-img-account-settings.png";

export const ContactDetailsPageComponent = props => {
  const {
    saveUserError,
    saveEmailError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    onChange,
    scrollingDisabled,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    onResendVerificationEmail,
    onSubmitContactDetails,
    intl,
  } = props;

  const heroHeader = intl.formatMessage({id: "AccountSettings.heroHeader"});

  const user = ensureCurrentUser(currentUser);
  const attributes = user.attributes || {};
  const profile = attributes.profile || {};
  const publicData = profile.publicData || {};
  const protectedData = profile.protectedData || {};
  const isParent = publicData.accountType === "parent";

  const initValues = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: attributes.email,
    phone: protectedData.phone,
    birthday: protectedData.birthday,
    address1: protectedData.streetAddress1,
    address2: protectedData.streetAddress2,
    city: protectedData.city,
    state: protectedData.state,
    zip: protectedData.zip,
    preferences: publicData.preferences,
  };

  const currentValues = {
    currentFirstName: initValues.firstName,
    currentLastName: initValues.lastName,
    currentEmail: initValues.email,
    currentPhone: initValues.phone,
    currentBirthday: initValues.birthday,
    currentAddress1: initValues.address1,
    currentAddress2: initValues.address2,
    currentCity: initValues.city,
    currentState: initValues.state,
    currentZip: initValues.zip,
    currentPreferences: initValues.preferences,
  }


  const contactInfoForm = user.id ? (
    <AboutMeForm
      className={css.form}
      initialValues={initValues}
      saveUserError={saveUserError}
      saveEmailError={saveEmailError}
      currentUser={currentUser}
      onResendVerificationEmail={onResendVerificationEmail}
      onSubmit={values => onSubmitContactDetails({ ...values, ...currentValues })}
      onChange={onChange}
      inProgress={saveContactDetailsInProgress}
      ready={contactDetailsChanged}
      sendVerificationEmailInProgress={sendVerificationEmailInProgress}
      sendVerificationEmailError={sendVerificationEmailError}
      isParent={isParent}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ContactDetailsPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ContactDetailsPage"/>
          <Hero url={heroUrl} header={heroHeader} />
        </LayoutWrapperTopbar>

        <LayoutWrapperAccountSettingsSideNav currentTab="ContactDetailsPage" />

        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.pageTitle}>
              Profile
            </h1>
            {contactInfoForm}
          </div>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

ContactDetailsPageComponent.defaultProps = {
  saveEmailError: null,
  savePhoneNumberError: null,
  currentUser: null,
  sendVerificationEmailError: null,
};

ContactDetailsPageComponent.propTypes = {
  saveUserError: propTypes.error,
  saveContactDetailsInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  contactDetailsChanged: bool.isRequired,
  onChange: func.isRequired,
  onSubmitContactDetails: func.isRequired,
  scrollingDisabled: bool.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  onResendVerificationEmail: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const {
    currentUser,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
  } = state.user;
  const {
    saveUserError,
    saveEmailError,
    saveContactDetailsInProgress,
    contactDetailsChanged,
  } = state.ContactDetailsPage;
  return {
    saveUserError,
    saveEmailError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    scrollingDisabled: isScrollingDisabled(state),
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
  };
};

const mapDispatchToProps = dispatch => ({
  onChange: () => dispatch(saveContactDetailsClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  onSubmitContactDetails: values => dispatch(saveInfo(values)),
});

const ContactDetailsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ContactDetailsPageComponent);

export default ContactDetailsPage;
