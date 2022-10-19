/**
 * Export reducers from ducks modules of different containers (i.e. default export)
 * We are following Ducks module proposition:
 * https://github.com/erikras/ducks-modular-redux
 */
import BioPage from './BioPage/BioPage.duck';
import CheckoutPage from './CheckoutPage/CheckoutPage.duck';
import ContactDetailsPage from './ContactDetailsPage/ContactDetailsPage.duck';
import DashboardPage from "./DashboardPage/DashboardPage.duck";
import EditJobListingPage from "./EditJobListingPage/EditJobListingPage.duck";
import EditListingPage from './EditListingPage/EditListingPage.duck';
import EditServicesPage from "./EditServicesPage/EditServicesPage.duck";
import InboxPage from './InboxPage/InboxPage.duck';
import JobListingPage from './JobListingPage/JobListingPage.duck'
import ListingPage from './ListingPage/ListingPage.duck';
import ManageListingsPage from './ManageListingsPage/ManageListingsPage.duck';
import PasswordChangePage from './PasswordChangePage/PasswordChangePage.duck';
import PasswordRecoveryPage from './PasswordRecoveryPage/PasswordRecoveryPage.duck';
import PasswordResetPage from './PasswordResetPage/PasswordResetPage.duck';
import PaymentMethodsPage from './PaymentMethodsPage/PaymentMethodsPage.duck';
import ProfilePage from './ProfilePage/ProfilePage.duck';
import ProfileSettingsPage from './ProfileSettingsPage/ProfileSettingsPage.duck';
import ProfileSettings from '../ducks/ProfileSettings.duck';
import SearchPage from './SearchPage/SearchPage.duck';
import StripePayoutPage from './StripePayoutPage/StripePayoutPage.duck';
import TransactionContainer from "./TransactionContainer/TransactionContainer.duck";

export {
  BioPage,
  CheckoutPage,
  ContactDetailsPage,
  DashboardPage,
  EditJobListingPage,
  EditListingPage,
  EditServicesPage,
  InboxPage,
  JobListingPage,
  ListingPage,
  ManageListingsPage,
  PasswordChangePage,
  PasswordRecoveryPage,
  PasswordResetPage,
  PaymentMethodsPage,
  ProfilePage,
  ProfileSettingsPage,
  ProfileSettings,
  SearchPage,
  StripePayoutPage,
  TransactionContainer,
};
