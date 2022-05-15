
import React from 'react';
import { bool, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import {Form as FinalForm} from 'react-final-form';
import { fetchCurrentUser, sendVerificationEmail } from '../../ducks/user.duck';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav, Button, Form, FieldTextInput, PrimaryButton, Hero,
} from '../../components';
import { TopbarContainer } from '../../containers';
import { isScrollingDisabled } from '../../ducks/UI.duck';
// import { saveBackgroundDisclosures, saveBackgroundDisclosuresClear } from './BackgroundDisclosuresPage.duck';
import css from './BackgroundDisclosuresPage.css';
import BackgroundDisclosures from "../../components/BackgroundDisclosures/BackgroundDisclosures";
import heroUrl from "../../assets/hero-img-account-settings/hero-img-account-settings.png";
import * as validators from "../../util/validators";

export const BackgroundDisclosuresPageComponent = props => {
  const {
    saveEmailError,
    savePhoneNumberError,
    //saveBackgroundDisclosuresInProgress,
    currentUser,
    currentUserListing,
    BackgroundDisclosuresChanged,
    onChange,
    scrollingDisabled,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    onResendVerificationEmail,
    onSubmitBackgroundDisclosures,
    intl,
  } = props;

  const heroHeader = intl.formatMessage({id: "AccountSettings.heroHeader"});

  const user = ensureCurrentUser(currentUser);
  const currentEmail = user.attributes.email || '';
  const profile = user.attributes.profile || {};
  const firstName = profile.firstName || '';
  const lastName = profile.lastName || '';

  const protectedData = user.attributes.profile.protectedData || {};
  const publicData = user.attributes.profile.publicData || {};
  const privateData = user.attributes.profile.privateData || {};

  const accountType = publicData.accountType || '';
  const currentPhoneNumber = protectedData.phoneNumber || '';
  const backgroundInvestigationSubmitted = privateData.backgroundInvestigationSubmitted || 'false';
  //console.log('private data = ' + JSON.stringify(protectedData));
  //console.log('public data = ' + JSON.stringify(publicData));
  //console.log('user = ' + JSON.stringify(user));
  //console.log('public data = ' + JSON.stringify(publicData));

  const params = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: currentEmail.trim(),
    //password: this.state.password.trim(),
    // phone: this.state.phone.trim(),
    // streetAddress1: this.state.address1.trim(),
    // streetAddress2: this.state.address2.trim(),
    // zip: this.state.zip.trim(),
    // city: this.state.city.trim(),
    // state: this.state.state.trim(),
    accountType: accountType.trim(),
    parentComponent: 'Background',
    backgroundInvestigationSubmitted: backgroundInvestigationSubmitted,
  }

  const onSubmit = values => {
    console.log('MADE');
  };
  const contactInfoForm = user.id ? (

    <FinalForm
      onSubmit={onSubmit}
      render={fieldRenderProps => {
        const {
          handleSubmit,
          invalid
        } = fieldRenderProps;

        return (
          <Form onSubmit={handleSubmit}>
            <BackgroundDisclosures values={params} parentComponent="AccountSettings"
            />

          </Form>
        );
      }}
    />


  ) : null;

  const title = intl.formatMessage({ id: 'BackgroundDisclosuresPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="BackgroundDisclosuresPage"/>
          <Hero url={heroUrl} header={heroHeader}/>
        </LayoutWrapperTopbar>

        <LayoutWrapperAccountSettingsSideNav currentTab="BackgroundDisclosuresPage" />

        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.pageTitle}>
              {title}
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

BackgroundDisclosuresPageComponent.defaultProps = {
  saveEmailError: null,
  savePhoneNumberError: null,
  currentUser: null,
  sendVerificationEmailError: null,
};

BackgroundDisclosuresPageComponent.propTypes = {
  saveEmailError: propTypes.error,
  savePhoneNumberError: propTypes.error,
  saveBackgroundDisclosuresInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  BackgroundDisclosuresChanged: bool.isRequired,
  onChange: func.isRequired,
  onSubmitBackgroundDisclosures: func.isRequired,
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
    currentUserListing,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
  } = state.user;
  // const {
  //   //saveEmailError,
  //   //savePhoneNumberError,
  //   //saveBackgroundDisclosuresInProgress,
  //   //BackgroundDisclosuresChanged,
  // } = state.BackgroundDisclosuresPage;
  return {
    //saveEmailError,
    //savePhoneNumberError,
    //saveBackgroundDisclosuresInProgress,
    currentUser,
    currentUserListing,
    //BackgroundDisclosuresChanged,
    //scrollingDisabled: isScrollingDisabled(state),
    //sendVerificationEmailInProgress,
    //sendVerificationEmailError,
  };
};

const mapDispatchToProps = dispatch => ({
  //onChange: () => dispatch(saveBackgroundDisclosuresClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  //onSubmitBackgroundDisclosures: values => dispatch(saveBackgroundDisclosures(values)),
});

const BackgroundDisclosuresPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(BackgroundDisclosuresPageComponent);

BackgroundDisclosuresPage.loadData = () => {
  // Since verify email happens in separate tab, current user's data might be updated
  return fetchCurrentUser();
};

export default BackgroundDisclosuresPage;
