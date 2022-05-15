import React, {useEffect, useState} from 'react';
import {bool, func, object, string} from 'prop-types';
import {FormattedMessage, intlShape} from '../../util/reactIntl';
import classNames from 'classnames';
import {ACCOUNT_SETTINGS_PAGES} from '../../routeConfiguration';
import {propTypes} from '../../util/types';
import {
  InlineTextButton,
  Logo,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  NamedLink,
  OwnListingLink,
} from '../../components';

import css from './TopbarDesktop.css';
import MenuIcon from "../Topbar/MenuIcon";
import {ACCOUNT_TYPES, LISTING_TYPES} from "../../nurtureUpLists";
import {ensureCurrentUser} from "../../util/data";

const TopbarDesktop = props => {
  const {
    className,
    currentPage,
    rootClassName,
    currentUser,
    currentUserListing,
    currentUserListingFetched,
    intl,
    isAuthenticated,
    onLogout,
    setIsLoginModalOpen,
    setIsContactModalOpen
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const classes = classNames(rootClassName || css.root, className);

  const user = ensureCurrentUser(currentUser)
  const {profile} = user.attributes || {};
  const {publicData} = profile || {};
  const {accountType} = publicData || {};
  const searchListingType = accountType === "pro" ? LISTING_TYPES.job : LISTING_TYPES.service

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <MenuIcon className={css.menuIcon}/>
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="Dashboard">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('Dashboard'))}
            name="Dashboard"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.dashboardLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="Search">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('SearchPage'))}
            name="SearchPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.searchLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="Inbox">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('InboxPage'))}
            name="InboxPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.inbox" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  ) : null;


  const signupButton = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupPage" className={css.signupButtonPrimary} >
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );

  const loginLink = isAuthenticatedOrJustHydrated ? null : (
    <div className={css.loginLink} onClick={setIsLoginModalOpen}>
      <span className={css.login}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </div>
  );

  const logoLink = (
    <NamedLink className={css.logoLink} name="LandingPage">
      <Logo
        format="desktop"
        className={css.logo}
        alt={intl.formatMessage({ id: 'TopbarDesktop.logo' })}
      />
    </NamedLink>
  );

  const aboutLink = isAuthenticatedOrJustHydrated ? null :  (
    <NamedLink className={css.aboutLink} name="AboutPage">

      <FormattedMessage id="TopbarDesktop.about" />

    </NamedLink>
  ) ;

  const safetyLink = isAuthenticatedOrJustHydrated ? null :  (
    <NamedLink className={css.safetyLink} name="AboutPage">

      <FormattedMessage id="TopbarDesktop.safety" />

    </NamedLink>
  ) ;

  const contactLink = isAuthenticatedOrJustHydrated ? null :  (
    <div className={css.contactLink} onClick={setIsContactModalOpen}>

        <FormattedMessage id="TopbarDesktop.contact" />

    </div>
  ) ;

  const verticalLink = isAuthenticatedOrJustHydrated ? null :  (
    <div className={css.verticalLink}>
      <div className={css.login}/>
    </div>
  ) ;

  return (
    <nav className={classes}>
      {aboutLink}
      {safetyLink}
      {contactLink}
      {verticalLink}
      {loginLink}
      {signupButton}
      {profileMenu}
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  initialSearchFormValues: {},
  currentUserListing: null,
  currentUserListingFetched: false,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  setIsLoginModalOpen: func.isRequired,
  setIsContactModalOpen: func.isRequired,
};

export default TopbarDesktop;
