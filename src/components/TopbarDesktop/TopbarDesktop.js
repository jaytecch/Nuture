import React, {useEffect, useState} from 'react';
import {bool, func, object, string} from 'prop-types';
import {FormattedMessage, intlShape} from '../../util/reactIntl';
import classNames from 'classnames';
import {ACCOUNT_SETTINGS_PAGES} from '../../routeConfiguration';
import {propTypes} from '../../util/types';
import {
  Avatar, IconDownTriangle,
  InlineTextButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  NamedLink,
} from '../../components';

import css from './TopbarDesktop.css';
import MenuIcon from "../Topbar/MenuIcon";
import {ACCOUNT_TYPES, LISTING_TYPES} from "../../nurtureUpLists";
import {ensureCurrentUser} from "../../util/data";
import {Link} from "react-router-dom";

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
  const isProvider = accountType === 'pro';
  const searchListingType = isProvider ? LISTING_TYPES.job : LISTING_TYPES.service

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar rootClassName={css.menuAvatarRoot} user={user} disableProfileLink />
        <IconDownTriangle rootClassName={css.menuArrowRoot} className={css.menuArrow}/>
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
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
            {isProvider ? <FormattedMessage id="TopbarDesktop.searchPro" /> : <FormattedMessage id="TopbarDesktop.searchParent" />}
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

        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="AboutPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AboutPage'))}
            name="AboutPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.about" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="Safety">
          <Link
            className={classNames(css.yourListingsLink, currentPageClass('Safety'))}
            to={"/about#safety-anchor"}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.safety" />
          </Link>
        </MenuItem>

        <MenuItem key="Blog">
          <a href={"http://nurtureup.blog"} className={css.yourListingsLink} target="_blank">
            Blog
          </a>
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
    <div className={css.topbarLink} onClick={setIsLoginModalOpen}>
        <FormattedMessage id="TopbarDesktop.login" />
    </div>
  );

  const aboutLinkClass = classNames(css.topbarLink, {
    [css.disableLink]: currentPage === 'AboutPage',
  });
  const aboutLink = isAuthenticatedOrJustHydrated ? null :  (
    <NamedLink className={aboutLinkClass} name="AboutPage">
      <FormattedMessage id="TopbarDesktop.about" />
    </NamedLink>
  ) ;

  const safetyLink = isAuthenticatedOrJustHydrated ? null :  (
    <Link className={css.topbarLink} to={"/about#safety-anchor"}>
      <FormattedMessage id="TopbarDesktop.safety" />
    </Link>
  ) ;

  const blogLink = isAuthenticatedOrJustHydrated ? null :  (
    <a href={"http://nurtureup.blog"} className={css.topbarLink} target="_blank">
      Blog
    </a>
  ) ;
  const contactLink = isAuthenticatedOrJustHydrated ? null :  (
    <div className={css.topbarLink} onClick={setIsContactModalOpen}>
        <FormattedMessage id="TopbarDesktop.contact" />
    </div>
  ) ;

  const dashboardLinkClass = classNames(css.topbarLink, {
    [css.disableLink]: currentPage === 'DashboardPage',
  });
  const dashboardLink = isAuthenticatedOrJustHydrated ? (
    <NamedLink className={dashboardLinkClass} name="Dashboard">
      <FormattedMessage id="TopbarDesktop.dashboardLink" />
    </NamedLink>
  ) : null;

  const messagesLinkClass = classNames(css.topbarLink, {
    [css.disableLink]: currentPage === 'InboxPage',
  });
  const messagesLink = isAuthenticatedOrJustHydrated ? (
    <NamedLink className={messagesLinkClass} name="InboxPage">
      <FormattedMessage id="TopbarDesktop.inbox" />
    </NamedLink>
  ) : null ;

  const searchButton = isAuthenticatedOrJustHydrated ? (
    <NamedLink name="SearchPage" className={css.quickActionButton}>
      <span className={css.searchButtonText}>
        {isProvider ? ("FIND A JOB") : ("FIND A SERVICE PRO")}
      </span>
    </NamedLink>
  ) : null;

  const verticalLink = isAuthenticatedOrJustHydrated ? null :  (
    <div className={css.verticalLink}/>
  ) ;

  return (
    <nav className={classes}>
      <div className={css.linkGroup}>
        {dashboardLink}
        {messagesLink}
        {searchButton}

        {aboutLink}
        {safetyLink}
        {blogLink}
        {contactLink}
        {verticalLink}
        {loginLink}
        {signupButton}
      </div>


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
