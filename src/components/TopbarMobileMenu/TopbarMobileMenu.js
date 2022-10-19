/**
 *  TopbarMobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React, {useState} from 'react';
import {bool, func, number, string} from 'prop-types';
import {FormattedMessage} from '../../util/reactIntl';
import classNames from 'classnames';
import {ACCOUNT_SETTINGS_PAGES} from '../../routeConfiguration';
import {propTypes} from '../../util/types';
import {ensureCurrentUser} from '../../util/data';
import {
  AvatarLarge,
  InlineTextButton, MenuContent, MenuItem,
  NamedLink,
  NotificationBadge,
  OwnListingLink,
} from '../../components';

import css from './TopbarMobileMenu.css';
import {ContactForm, LoginForm} from "../../forms";
import {authenticationInProgress, login} from "../../ducks/Auth.duck";
import {compose} from "redux";
import {connect} from 'react-redux';
import {ACCOUNT_TYPES, LISTING_TYPES} from "../../nurtureUpLists";
import {Link} from "react-router-dom";

const TopbarMobileMenuComponent = props => {
  const {
    isAuthenticated,
    currentPage,
    currentUserHasListings,
    currentUserListing,
    currentUserListingFetched,
    currentUser,
    notificationCount,
    onLogout,
    authInProgress,
    loginError,
    submitLogin,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const {profile} = user.attributes || {};
  const {publicData, firstName} = profile || {};
  const {accountType} = publicData || {};

  const [showLoginFrom, setShowLoginForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  if (!isAuthenticated) {
    const home = (
      <NamedLink className={css.firstNavLink} name="LandingPage">
        Home
      </NamedLink>
    )

    const about = (
      <NamedLink className={css.navigationLink} name="AboutPage">
        <FormattedMessage id="TopbarDesktop.about"/>
      </NamedLink>
    );

    const safety = (
      <NamedLink className={css.navigationLink} name="AboutPage">
        <FormattedMessage id="TopbarDesktop.safety"/>
      </NamedLink>
    )

    const blog = (
      <a href={"http://nurtureup.blog"} className={css.navigationLink} target="_blank">
        Blog
      </a>
    )

    const contact = (
      <div className={css.navigationLink} onClick={() => setShowContactForm(true)}>
        <FormattedMessage id="TopbarDesktop.contact"/>
      </div>
    )

    const loginErrorMessage = (
      <div className={css.error}>
        <FormattedMessage id="AuthenticationPage.loginFailed"/>
      </div>
    );

    const signup = (
      <NamedLink name="SignupPage" className={css.signupLink}>
        <FormattedMessage id="TopbarMobileMenu.signupLink"/>
      </NamedLink>
    );

    const login = (
      <div onClick={() => setShowLoginForm(true)}>
        <span className={css.loginLink}>
          <FormattedMessage id="TopbarMobileMenu.loginLink"/>
        </span>
      </div>
    );

    const signupOrLogin = (
      <span className={css.authenticationLinks}>
        <FormattedMessage id="TopbarMobileMenu.signupOrLogin" values={{signup, login}}/>
      </span>
    );

    const loginForm = showLoginFrom ? (
      <div className={css.form}>
        <InlineTextButton
          className={css.backLink}
          onClick={() => setShowLoginForm(false)}
        >
          Back
        </InlineTextButton>

        {loginError ? loginErrorMessage : null}
        <LoginForm
          onSubmit={submitLogin}
          inProgress={authInProgress}
        />
      </div>
    ) : null;

    const contactForm = showContactForm ? (
      <div className={css.form}>
        <InlineTextButton
          className={css.backLink}
          onClick={() => setShowContactForm(false)}
        >
          Back
        </InlineTextButton>
        <ContactForm handleSubmit={() => setShowContactForm(false)}/>
      </div>
    ) : null;

    const content = !showLoginFrom && !showContactForm ? (
      <div className={css.content}>
        <FormattedMessage
          id="TopbarMobileMenu.unauthorizedGreeting"
          values={{lineBreak: <br/>, signupOrLogin}}
        />

        {home}
        {about}
        {safety}
        {blog}
        {contact}
      </div>
    ) : null;

    return (
      <div className={css.root}>
        <div className={css.content}>
          <div className={css.authenticationGreeting}>
            {content}

            {loginForm}
            {contactForm}
          </div>
        </div>
      </div>
    );
  }

  const notificationCountBadge =
    notificationCount > 0 ? (
      <NotificationBadge className={css.notificationBadge} count={notificationCount}/>
    ) : null;

  const displayName = firstName || '';
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  return (
    <div className={css.root}>
      <AvatarLarge className={css.avatar} user={currentUser}/>
      <div className={css.content}>
        <span className={css.greeting}>
          <FormattedMessage id="TopbarMobileMenu.greeting" values={{displayName}}/>
        </span>

        <NamedLink
          className={classNames(css.firstNavLink, currentPageClass('Dashboard'))}
          name="Dashboard"
        >
          <FormattedMessage id="TopbarDesktop.dashboardLink"/>
        </NamedLink>

        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('AccountSettingsPage'))}
          name="AccountSettingsPage"
        >
          <FormattedMessage id="TopbarDesktop.accountSettingsLink"/>
        </NamedLink>

        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('SearchPage'))}
          name="SearchPage"
          params={{
            pub_listingType: (accountType ?
              (accountType === ACCOUNT_TYPES.parent ? LISTING_TYPES.job : LISTING_TYPES.service)
              : LISTING_TYPES.service)
          }}
        >
          <FormattedMessage id="TopbarDesktop.searchLink"/>
        </NamedLink>

        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('InboxPage'))}
          name="InboxPage"
        >
          <FormattedMessage id="TopbarDesktop.inbox"/>
        </NamedLink>

        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('AboutPage'))}
          name="AboutPage"
        >
          <FormattedMessage id="TopbarDesktop.about"/>
        </NamedLink>

        <Link
          className={classNames(css.navigationLink, currentPageClass('Safety'))}
          to={"/about#safety-anchor"}
        >
          <FormattedMessage id="TopbarDesktop.safety"/>
        </Link>

        <a href={"http://nurtureup.blog"} className={css.navigationLink} target="_blank">
          Blog
        </a>
      </div>

      <div className={css.footer}>
        <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
          <FormattedMessage id="TopbarMobileMenu.logoutLink"/>
        </InlineTextButton>
      </div>

    </div>
  );
};

const mapStateToProps = state => {
  const {loginError} = state.Auth;

  return {
    authInProgress: authenticationInProgress(state),
    loginError,
  }
}

const mapDispatchToProps = dispatch => ({
  submitLogin: ({email, password}) => dispatch(login(email, password)),
});

TopbarMobileMenuComponent.defaultProps = {
  currentUser: null,
  notificationCount: 0,
  currentPage: null,
  currentUserListing: null,
  currentUserListingFetched: false,
  loginError: null,
};

TopbarMobileMenuComponent.propTypes = {
  isAuthenticated: bool.isRequired,
  currentUserHasListings: bool.isRequired,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
  currentUser: propTypes.currentUser,
  currentPage: string,
  notificationCount: number,
  onLogout: func.isRequired,
  authInProgress: bool.isRequired,
  loginError: propTypes.error,
  submitLogin: func.isRequired,
};

const TopbarMobileMenu = compose(
  connect(mapStateToProps, mapDispatchToProps),
)(TopbarMobileMenuComponent);

export default TopbarMobileMenu;
