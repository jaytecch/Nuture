import React, {Component} from "react";
import {arrayOf, bool, func, object} from 'prop-types';
import css from './JobListingPage.css';
import {propTypes} from "../../util/types";
import {compose} from "redux";
import {connect} from "react-redux";
import {types as sdkTypes} from "../../util/sdkLoader";
import {
  apply,
  getApplicantListings,
  getAssociatedProListing,
  hireApplicant,
  loadData
} from "./JobListingPage.duck";
import {withRouter} from 'react-router-dom';
import * as moment from 'moment';
import {
  Footer, Hero, IconEmail,
  LayoutSingleColumn,
  LayoutWrapperFooter,
  LayoutWrapperMain,
  LayoutWrapperTopbar, ListingCard, Modal, NamedLink,
  Page, PrimaryButton
} from "../../components";
import {injectIntl} from "react-intl";
import {TopbarContainer} from "../index";
import {isScrollingDisabled, manageDisableScrolling} from "../../ducks/UI.duck";
import {ensureCurrentUser, ensureListing} from "../../util/data";
import {getPreference, getServiceType} from "../../nurtureUpLists";
import bullet from '../../assets/nu-logo.png';
import heroUrl from '../../assets/crib/crib.png';
import {getListingsById} from "../../ducks/marketplaceData.duck";

const {UUID} = sdkTypes;

export class JobListingPageComponent extends Component {
  constructor(props) {
    super(props);

    this.handleApply = this.handleApply.bind(this);

    this.state = {
      applySuccessModalOpen: false,
    }
  }

  handleApply(listingId, serviceType, currentUser) {
    const {onApply} = this.props;
    const {id, attributes} = currentUser;
    const {profile} = attributes;
    const {firstName, lastName} = profile;

    this.props.getApplicableProListing(id, serviceType)
      .then(listing => {
        const applicant = {
          id: id.uuid,
          listingId: listing.id.uuid,
          name: firstName + " " + lastName
        }

        onApply(listingId.uuid, applicant)
          .then(() => {
            console.log("you have applied for the job");
            this.setState({applySuccessModalOpen: true})
          });
      })
  }

  render() {
    const {
      currentUser,
      listing,
      scrollingDisabled,
      schedule,
      isOwner,
      intl,
      onManageDisableScrolling,
      onHire,
      onGetApplicantListings,
    } = this.props;

    const currentListing = ensureListing(listing);
    const {
      description = '',
      title = '',
      publicData,
    } = currentListing.attributes;
    const {
      serviceType,
      preferences = [],
      applicants = [],
    } = publicData

    const {label: serviceLabel, icon: serviceIcon} = getServiceType(serviceType) || {}
    const hasApplicants = applicants.length > 0;


    const headerButtonGroup = isOwner ? null : (
      <div className={css.buttonGroup}>
        <PrimaryButton className={css.button}
                       onClick={() => this.handleApply(listing.id, serviceType, currentUser)}>
          Apply
        </PrimaryButton>
      </div>
    );

    const requestedServiceSection = serviceType ? (
      <div className={css.requested}>
        < h2 className={css.sectionHeader}>Requested Service</h2>
        <div key={serviceType} className={css.service}>
          {serviceIcon(null, css.iconRootClass)}
          <p className={css.serviceLabel}>{serviceLabel}</p>
        </div>
      </div>
    ) : null;

    const preferencesSection = (
      <div className={css.preferencesSection}>
        < h2 className={css.sectionHeader}>Preferences</h2>
        <ul>
          {preferences.map(pref => (
            <li>
              <img className={css.bullet} src={bullet} alt="-"/>
              {getPreference(pref).label}
            </li>
          ))}
        </ul>
      </div>
    );

    const getStart = () => {
      if (!schedule[0]) return null;

      const attributes = schedule[0].attributes;
      const start = moment(attributes.start);

      return (
        <div>
          <h2 className={css.sectionHeader}>Start Date</h2>
          <p>{start.format("ll")}</p>
        </div>
      );
    };

    const scheduleSection = () => {
      const overflowClass = schedule && schedule.length > 4 ? css.overflow : null;

      return (
        <div className={css.cellSection}>
          <h2 className={css.sectionHeader}>Schedule</h2>
          <div className={css.overflow}>
            <ul>
              {schedule.map(entry => {
                const {attributes} = entry || {};
                const start = moment(attributes.start);
                const end = moment(attributes.end);
                return (
                  <li>
                    {start.format("ddd MMM Do YYYY")}: {start.format("h A")} - {end.format("h A")}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )
    }

    const handleHire = applicantId => {
      const stripeCustomer = currentUser.stripeCustomer || {};
      const defaultPaymentMethod = stripeCustomer.defaultPaymentMethod || {};
      const attributes = defaultPaymentMethod.attributes || {};
      const stripePayment = attributes.stripePaymentMethodId;

      onHire(new UUID(applicantId), serviceType, stripePayment);
    }

    // <NamedLink className={css.applicantLink} name="ProfilePage"
    //            params={{id: applicant.id}}>
    //   <h3 className={css.applicantName}>{applicant.name}</h3>
    // </NamedLink>
    // <div className={css.applicantBtnGroup}>
    //   <PrimaryButton className={css.applicantButton}
    //                  onClick={() => handleHire(applicant.id)}>
    //     Hire
    //   </PrimaryButton>
    //
    //   <PrimaryButton className={css.applicantButton}>
    //     <IconEmail/>
    //   </PrimaryButton>
    // </div>

    const applicantItem = applicantListing => {
      return applicantListing ? (
        <div className={css.applicant}>
          <ListingCard
            className={css.listingCard}
            key={applicantListing.id.uuid}
            listing={applicantListing}
            authorId={applicantListing.author.id}
            isMobile={false}
          />
        </div>
      ) : null;
    }

    const applicantsSection = isOwner ? (
      <div className={css.applicantsSection}>
        <h2 className={css.sectionHeader}>Applicants</h2>
        {
          hasApplicants ? (
            onGetApplicantListings(applicants).map(applicantListing => applicantItem(applicantListing))
          ) : <h3 className={css.noApplicants}>There are no applicants</h3>
        }
      </div>
    ) : null;



    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        title={title}
      >
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="JobListingPage"/>
            <Hero url={heroUrl} header="Job Listing"/>
          </LayoutWrapperTopbar>

          <LayoutWrapperMain>
            <div className={css.listingContainer}>
              <div className={css.headerGroup}>
                <h2 className={css.titleH2}>{title}</h2>
                {headerButtonGroup}
              </div>

              <div className={css.descriptionSection}>
                <h2 className={css.sectionHeader}>Job Description</h2>
                <p>{description}</p>
              </div>

              <div className={css.table}>
                <div className={css.left}>
                  {scheduleSection()}
                  {requestedServiceSection}
                </div>

                <div className={css.right}>
                  {getStart()}
                  {preferencesSection}
                </div>
              </div>

              {applicantsSection}
            </div>

            <Modal
              id="ApplySuccess"
              isOpen={this.state.applySuccessModalOpen}
              onClose={() => this.setState({applySuccessModalOpen: false})}
              onManageDisableScrolling={onManageDisableScrolling}
            >
              <h2 className={css.successMessage}>You have successfully applied for {title}</h2>
            </Modal>

          </LayoutWrapperMain>

          <LayoutWrapperFooter>
            <Footer/>
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

JobListingPageComponent.defaultProps = {
  listing: null,
  schedule: [],
  isOwner: false,
};

JobListingPageComponent.propTypes = {
  listing: propTypes.listing,
  scrollingDisabled: bool.isRequired,
  onApply: func.isRequired,
  currentUser: propTypes.currentUser,
  schedule: arrayOf(object),
  isOwner: bool,
  onManageDisableScrolling: func.isRequired,
  onHire: func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onApply: (listingId, applicant) => dispatch(apply(listingId, applicant)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onHire: (id, type, payment) => dispatch(hireApplicant(id, type, payment)),
  onGetApplicantListings: applicants => dispatch(getApplicantListings(applicants)),
  getApplicableProListing: (proId, serviceType) => dispatch(getAssociatedProListing(proId, serviceType)),
});

const mapStateToProps = state => {
  const {currentUser} = state.user;
  const {
    listing,
    schedule,
  } = state.JobListingPage;


  const isOwner = listing && listing.type === 'ownListing';

  return {
    scrollingDisabled: isScrollingDisabled(state),
    listing,
    currentUser,
    schedule,
    isOwner,
  }
}

const JobListingPage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(JobListingPageComponent);

JobListingPage.loadData = params => {
  return loadData(new UUID(params.id));
}

export default JobListingPage;
