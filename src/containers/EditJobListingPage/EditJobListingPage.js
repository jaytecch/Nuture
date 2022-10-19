import React, {useState} from 'react';
import css from './EditJobListingPage.css';
import {compose} from 'redux';
import {propTypes} from '../../util/types';
import {
  Footer, Hero,
  LayoutSideNavigation,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperFooter,
  LayoutWrapperMain,
  LayoutWrapperTopbar,
  Page,
  PrimaryButton
} from "../../components";
import {TopbarContainer} from "../index";
import {connect} from "react-redux";
import {isScrollingDisabled, manageDisableScrolling} from "../../ducks/UI.duck";
import {arrayOf, bool, func, object, shape, string} from "prop-types";
import {injectIntl} from "react-intl";
import {intlShape} from "../../util/reactIntl";
import {JobListingForm} from "../../forms";
import {getJobListingsEntities} from "../../ducks/jobListingsData.duck";
import {
  addAvailabilityException,
  createJobListing,
  deleteAvailabilityException,
  getListings,
  requestFetchAvailabilityExceptions,
  setAvailabilityPlan,
  setMaybeDeletes,
  updateJobListing,
} from "./EditJobListingPage.duck";
import moment from "moment";
import {getServiceType} from "../../nurtureUpLists";
import heroUrl from "../../assets/hero-img-account-settings/hero-img-account-settings.png";
import {ensureCurrentUser} from "../../util/data";

export const EditJobListingPageComponent = props => {
  const {
    currentUser,
    onManageDisableScrolling,
    scrollingDisabled,
    intl,
    onSubmitJobListing,
    updateInProgress,
    onUpdateJobListing,
    onUpdateAvailabilityPlan,
    updatedPlan,
    jobListings,
    errors,
    onReloadListings,
    getSchedule,
    maybeDeletes,
    onSetMaybeDeletes,
  } = props;

  const heroHeader = intl.formatMessage({id: "AccountSettings.heroHeader"});

  const [showForm, setShowForm] = useState(false);
  const [selectedJobListing, setSelectedJobListing] = useState({});

  const user = ensureCurrentUser(currentUser);
  const {attributes: userAttr} = user
  const {profile} = userAttr || {};
  const {privateData: userPrivData} = profile || {};
  const {paymentMethodAdded} = userPrivData || {};
  const canCreateListings = paymentMethodAdded === 'true'

  const pageTitle = intl.formatMessage({id: 'EditJobListingPage.title'});
  const isNewListing = Object.keys(selectedJobListing).length === 0;
  const attributes = selectedJobListing.attributes || {}
  const {title, description, publicData} = attributes || {};
  const {zip, preferences, experience, educationLevel, serviceType} = publicData || {};
  const hasError = Object.values(errors).findIndex(err => err != null) !== -1;

  const initValues = {
    title,
    serviceType,
    description,
    zip,
    preferences,
    experience,
    educationLevel,
  }

  const handleFormSubmit = (values) => {
    const upsert = isNewListing ? onSubmitJobListing : onUpdateJobListing;

    upsert({...values, id: selectedJobListing.id}).then(() => {
      onReloadListings();
      setShowForm(false);
    })
  };

  const handleFormCancel = () => {
    onReloadListings();
    setSelectedJobListing({});
    onUpdateAvailabilityPlan({});
    setShowForm(false);
  }

  const handleNewJobClick = e => {
    setShowForm(true);
  }

  const handleListingClick = listing => {
    const today = new Date();
    const scheduleParams = {
      listingId: listing.id,
      start: today,
      end: moment(today).add(365, 'd').toDate(),
    };

    getSchedule(scheduleParams).then(response => {
      const schedule = response.map(entry => {
        const start = moment(entry.attributes.start);
        const end = moment(entry.attributes.end);
        const date = moment(start.format('l'));
        const label = start.format("h:mm A") + " - " + end.format("h:mm A");

        return {
          id: entry.id,
          value: entry.id.uuid,
          seats: 1,
          start: start,
          end: end,
          label: label,
          date: date,
          dayOfWeek: date.format('ddd').toLowerCase(),
        }
      });

      const plan = listing.attributes.availabilityPlan;
      plan.entries = schedule;

      onUpdateAvailabilityPlan(plan);
      setSelectedJobListing(listing);
      setShowForm(true);
    });
  }

  const jobListingForm = (
    <JobListingForm
      className={css.form}
      initialValues={initValues}
      updatedPlan={updatedPlan}
      onUpdateAvailabilityPlan={onUpdateAvailabilityPlan}
      onSubmit={handleFormSubmit}
      updateInProgress={updateInProgress}
      onManageDisableScrolling={onManageDisableScrolling}
      errors={errors}
      onSetMaybeDeletes={onSetMaybeDeletes}
      maybeDeletes={maybeDeletes}
      onCancel={handleFormCancel}
      hasErrors={hasError}
      isNewListing={isNewListing}
    />
  );

  const createButtonTitle = intl.formatMessage({id: 'EditJobListingPage.createNewButton'});
  const listSection = jobListings => (
    <div className={css.listSection}>
      <div className={css.list}>
        {jobListings.length > 0 ? jobListings.map(listing => {
          const service = getServiceType(listing.attributes.publicData.serviceType)

          return (
            <div id={listing.id.uuid} key={listing.id.uuid} className={css.listing}
                 onClick={() => handleListingClick(listing)}>
              <div className={css.icon}>
                {service.icon()}
              </div>
              <div className={css.listingAboutWrapper}>
                <div className={css.listingTitle}>{listing.attributes.title}</div>
                <div className={css.listingServiceLabel}>{service.label}</div>
                <div className={css.listingDesc}>{listing.attributes.description}</div>
              </div>

            </div>
          );
        }) : (<p className={css.noListingMessage}>You have no job listings.</p>)}
      </div>

      {!canCreateListings ?
        <div className={css.errorText}>
          You cannot create a 'Job Listing' until you have added a payment method.
        </div>
        : null
      }

      <PrimaryButton onClick={handleNewJobClick} disabled={!canCreateListings}>
        {createButtonTitle}
      </PrimaryButton>
    </div>
  );

  return (
    <Page title={pageTitle} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer/>
          <Hero url={heroUrl} header={heroHeader}/>
        </LayoutWrapperTopbar>

        <LayoutWrapperAccountSettingsSideNav currentTab="EditJobListingPage"/>

        <LayoutWrapperMain>
          <div className={css.content}>
            {jobListings.length > 0 ?
            <h1 className={css.pageTitle}>{pageTitle}</h1> : null}
            {showForm ? jobListingForm : listSection(jobListings)}
          </div>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer/>
        </LayoutWrapperFooter>

      </LayoutSideNavigation>
    </Page>
  )
}

EditJobListingPageComponent.defaultProps = {
  currentUser: null,
  id: null,
  jobListings: [],
}

EditJobListingPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  intl: intlShape.isRequired,
  currentUser: propTypes.currentUser,
  getOwnListing: func.isRequired,
  onSubmitJobListing: func.isRequired,
  saveJobListingError: propTypes.error,
  updateInProgress: bool.isRequired,
  onManageDisableScrolling: func.isRequired,
  onUpdateJobListing: func.isRequired,
  id: string,
  jobListings: arrayOf(object).isRequired,
  jobListingsError: propTypes.error,
  fetchJobListingsInProgress: bool.isRequired,
  errors: shape({
    createJobError: object,
    jobListingsError: object,
    fetchExceptionsError: object,
    showListingError: object,
    updateListingError: object,
  }).isRequired,
}

const mapStateToProps = state => {
  const page = state.EditJobListingPage;

  const {
    currentUser,
  } = state.user;

  const {
    updateInProgress,
    updatedPlan,
    availabilityExceptions,
    jobListings,
    fetchJobListingsInProgress,
    fetchExceptionsInProgress,
    createJobError,
    jobListingsError,
    fetchExceptionsError,
    showListingError,
    updateListingError,
    submittedListingId,
    maybeDeletes
  } = page || {};

  const errors = {
    createJobError,
    jobListingsError,
    fetchExceptionsError,
    showListingError,
    updateListingError,
  };

  const getOwnListing = id => {
    const listings = getJobListingsEntities(state, [{id, type: 'ownListing'}]);

    return listings.length === 1 ? listings[0] : null;
  };

  return {
    currentUser,
    getOwnListing,
    scrollingDisabled: isScrollingDisabled(state),
    createJobError,
    updateInProgress,
    updatedPlan,
    availabilityExceptions,
    jobListings,
    jobListingsError,
    fetchJobListingsInProgress,
    errors,
    submittedListingId,
    fetchExceptionsInProgress,
    maybeDeletes,
  }
}

const mapDispatchToProps = dispatch => ({
  onSubmitJobListing: values => dispatch(createJobListing(values)),
  onUpdateJobListing: values => dispatch(updateJobListing(values)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onDeleteAvailabilityException: params => dispatch(deleteAvailabilityException(params)),
  onAddAvailabilityException: params => dispatch(addAvailabilityException(params)),
  onUpdateAvailabilityPlan: plan => dispatch(setAvailabilityPlan(plan)),
  onReloadListings: () => dispatch(getListings()),
  getSchedule: (params) => dispatch(requestFetchAvailabilityExceptions(params)),
  onSetMaybeDeletes: (id) => dispatch(setMaybeDeletes(id))
});

const EditJobListingPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  injectIntl
)(EditJobListingPageComponent);

EditJobListingPage.loadData = getListings;

export default EditJobListingPage;
