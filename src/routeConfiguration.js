import React from 'react';
import {
  AboutPage,
  AuthenticationPage,
  ContactDetailsPage,
  EmailVerificationPage,
  InboxPage,
  LandingPage,
  ListingPage,
  NotFoundPage,
  PasswordChangePage,
  PasswordRecoveryPage,
  PasswordResetPage,
  StripePayoutPage,
  PaymentMethodsPage,
  ProfilePage,
  SearchPage,
  DashboardPage,
  BioPage,
  EditJobListingPage,
  EditServicesPage, JobListingPage,
  ProPaymentPage,
  BackgroundDisclosuresPage,
} from './containers';

// routeConfiguration needs to initialize containers first
// Otherwise, components will import form container eventually and
// at that point css bundling / imports will happen in wrong order.
import { NamedRedirect } from './components';


export const ACCOUNT_SETTINGS_PAGES = [
  'ContactDetailsPage',
  'PasswordChangePage',
  'StripePayoutPage',
  'PaymentMethodsPage',
];

// https://en.wikipedia.org/wiki/Universally_unique_identifier#Nil_UUID
const draftId = '00000000-0000-0000-0000-000000000000';
const draftSlug = 'draft';

const RedirectToLandingPage = () => <NamedRedirect name="LandingPage" />;

// NOTE: Most server-side endpoints are prefixed with /api. Requests to those
// endpoints are intended to be handled in the server instead of the browser and
// they will not render the application. So remember to avoid routes starting
// with /api and if you encounter clashing routes see server/index.js if there's
// a conflicting route defined there.

// Our routes are exact by default.
// See behaviour from Routes.js where Route is created.
const routeConfiguration = () => {
  return [
    {
      path: '/',
      name: 'LandingPage',
      component: props => <LandingPage {...props} />,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      auth: true,
      component: props => <DashboardPage {...props} />,
      loadData: DashboardPage.loadData,
    },
    {
      path: '/about',
      name: 'AboutPage',
      component: AboutPage,
    },
    {
      path: '/s/job',
      name: 'SearchForJobPage',
      component: props => <SearchPage {...props} searchFor="job"/>,
      loadData: params => SearchPage.loadData({...params, searchFor:"job"}),
    },
    {
      path: '/s/pro',
      name: 'SearchForProPage',
      component: props => <SearchPage {...props} searchFor="pro"/>,
      loadData: params => SearchPage.loadData({...params, searchFor:"pro"} ),
    },
    {
      path: '/s',
      name: 'SearchPage',
      component: props => <SearchPage {...props} />,
      loadData: SearchPage.loadData,
    },
    // {
    //   path: '/s/map',
    //   name: 'SearchMapPage',
    //   component: props => <SearchPage {...props} tab="map" />,
    //   loadData: SearchPage.loadData,
    // },
    {
      path: '/l',
      name: 'ListingBasePage',
      component: RedirectToLandingPage,
    },
    {
      path: '/l/:slug/:id',
      name: 'ListingPage',
      component: props => <ListingPage {...props} />,
      loadData: ListingPage.loadData,
    },
    {
      path: '/jobs',
      name: 'EditJobListingPage',
      auth: true,
      component: props => <EditJobListingPage {...props} />,
      loadData: EditJobListingPage.loadData,
    },

    // Canonical path should be after the `/l/new` path since they
    // conflict and `new` is not a valid listing UUID.
    {
      path: '/l/:id',
      name: 'ListingPageCanonical',
      component: props => <ListingPage {...props} />,
      loadData: ListingPage.loadData,
    },
    {
      path:'/j/:id',
      name:'JobListingPage',
      component: props => <JobListingPage {...props} />,
      loadData: JobListingPage.loadData
    },
    {
      path: '/u',
      name: 'ProfileBasePage',
      component: RedirectToLandingPage,
    },
    {
      path: '/u/:id',
      name: 'ProfilePage',
      component: props => <ProfilePage {...props} />,
      loadData: ProfilePage.loadData,
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: RedirectToLandingPage,
    },
    {
      path: '/signup',
      name: 'SignupPage',
      component: props => <AuthenticationPage {...props}/>,
    },
    {
      path: '/prosignup',
      name: 'ProSignupPage',
      component: props => <AuthenticationPage {...props} proFromLanding={true} />
    },
    {
      path: '/recover-password',
      name: 'PasswordRecoveryPage',
      component: props => <PasswordRecoveryPage {...props} />,
    },
    {
      path: '/inbox',
      name: 'InboxPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <InboxPage {...props} />,
      loadData: InboxPage.loadData,
    },
    {
      path: '/account',
      name: 'AccountSettingsPage',
      auth: true,
      authPage: 'LoginPage',
      component: () => <NamedRedirect name="ContactDetailsPage" />,
    },
    {
      path: '/account/contact-details',
      name: 'ContactDetailsPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <ContactDetailsPage {...props} />,
    },
    {
      path:'/bio',
      name:'BioPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <BioPage {...props} />
    },
    {
      path:'/services',
      name:'EditServicesPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <EditServicesPage {...props} />,
      loadData: EditServicesPage.loadData
    },
    {
      path:'/propayment',
      name:'ProPaymentPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <ProPaymentPage {...props} />,
      loadData: ProPaymentPage.loadData
    },
    {
      path:'/background',
      name:'BackgroundDisclosuresPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <BackgroundDisclosuresPage {...props} />,
      loadData: BackgroundDisclosuresPage.loadData
    },
    {
      path: '/account/change-password',
      name: 'PasswordChangePage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <PasswordChangePage {...props} />,
    },
    {
      path: '/account/payments',
      name: 'StripePayoutPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <StripePayoutPage {...props} />,
      loadData: StripePayoutPage.loadData,
    },
    {
      path: '/account/payments/:returnURLType',
      name: 'StripePayoutOnboardingPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <StripePayoutPage {...props} />,
      loadData: StripePayoutPage.loadData,
    },
    {
      path: '/account/payment-methods',
      name: 'PaymentMethodsPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <PaymentMethodsPage {...props} />,
      loadData: PaymentMethodsPage.loadData,
    },
    {
      path: '/notfound',
      name: 'NotFoundPage',
      component: props => <NotFoundPage {...props} />,
    },

    // Do not change this path!
    //
    // The API expects that the application implements /reset-password endpoint
    {
      path: '/reset-password',
      name: 'PasswordResetPage',
      component: props => <PasswordResetPage {...props} />,
    },

    // Do not change this path!
    //
    // The API expects that the application implements /verify-email endpoint
    {
      path: '/verify-email',
      name: 'EmailVerificationPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <EmailVerificationPage {...props} />,
      loadData: EmailVerificationPage.loadData,
    },
  ];
};

export default routeConfiguration;
