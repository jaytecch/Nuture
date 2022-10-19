import React, {Component} from 'react';
import PropTypes, {func, string} from 'prop-types';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {types as sdkTypes} from '../../util/sdkLoader';
import {REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes} from '../../util/types';
import heroUrl from '../../assets/crib/crib.png';
import {
  ensureCurrentUser,
  ensurePaymentMethodCard,
  ensureStripeCustomer,
  ensureUser
} from '../../util/data';
import {withViewport} from '../../util/contextHelpers';
import {isScrollingDisabled, manageDisableScrolling} from '../../ducks/UI.duck';
import {getMarketplaceEntities} from '../../ducks/marketplaceData.duck';
import {withRouter} from 'react-router-dom';
import {TopbarContainer, NotFoundPage} from '../../containers';
import {
  Page,
  LayoutWrapperMain,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  AvatarLarge,
  NamedLink,
  Reviews,
  ButtonTabNavHorizontal,
  PrimaryButton,
  LayoutSingleColumn,
  Modal, BookingModal, AvatarDashboard, AvatarMedium,
  ModalInMobile, ReviewRating, Hero
} from '../../components';
import {
  getListing,
  loadData,
  sendEnquiry,
  getTimeSlots,
  initiateOrder,
  speculateTransaction, speculateFreeTransaction,
} from './ProfilePage.duck';
import config from '../../config';
import {getServiceType} from "../../nurtureUpLists";
import css from './ProfilePage.css';
import {EnquiryForm} from "../../forms";
import routeConfiguration from "../../routeConfiguration";
import {createResourceLocatorString} from "../../util/routes";
import {ADD_FLASH_NOTIFICATION, addFlashNotification} from "../../ducks/FlashNotification.duck";


const {UUID} = sdkTypes;
const MAX_MOBILE_SCREEN_WIDTH = 768;
// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;

export class ProfilePageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // keep track of which reviews tab to show in desktop viewport
      messageModalOpen: false,
      appointmentModalOpen: false,
      noDefaultPaymentModalOpen: false,
    };

    // this.showOfProviderReviews = this.showOfProviderReviews.bind(this);
    // this.showOfCustomerReviews = this.showOfCustomerReviews.bind(this);
    this.onContactUser = this.onContactUser.bind(this);
    this.onSubmitEnquiry = this.onSubmitEnquiry.bind(this);
    this.onMakeAppointment = this.onMakeAppointment.bind(this);
    this.onBookingSubmit = this.onBookingSubmit.bind(this);
  }

  // showOfProviderReviews() {
  //   this.setState({
  //     showReviewsType: REVIEW_TYPE_OF_PROVIDER,
  //   });
  // }
  //
  // showOfCustomerReviews() {
  //   this.setState({
  //     showReviewsType: REVIEW_TYPE_OF_CUSTOMER,
  //   });
  // }

  onContactUser() {
    const {currentUser, history, callSetInitialValues, params, location} = this.props;

    if (!currentUser) {
      const state = {from: `${location.pathname}${location.search}${location.hash}`};

      // We need to log in before showing the modal, but first we need to ensure
      // that modal does open when user is redirected back to this listing page
      //callSetInitialValues(setInitialValues, { enquiryModalOpenForListingId: params.id });

      // signup and return back to listingPage.
      history.push(createResourceLocatorString('SignupPage', routeConfiguration(), {}, {}), state);
    } else {
      this.setState({messageModalOpen: true});
    }
  }

  onMakeAppointment() {
    console.log("Appt button clicked in onMakeAppt()");
    const {currentUser, history, location} = this.props;

    const hasDefaultPaymentMethod =
      currentUser &&
      ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
      ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id;

    if(!hasDefaultPaymentMethod){
      this.setState({noDefaultPaymentModalOpen: true});
    }else {

      if (!currentUser) {
        const state = {from: `${location.pathname}${location.search}${location.hash}`};
        history.push(createResourceLocatorString('SignupPage', routeConfiguration(), {}, {}), state);
      } else {
        console.log("modalopen set to true");
        this.setState({appointmentModalOpen: true});
      }
    }
  }

  onSubmitEnquiry(values) {
    const {history, onSendEnquiry} = this.props;
    const routes = routeConfiguration();
    const {listingId, message} = values;
    const id = new UUID(listingId);

    onSendEnquiry(id, message.trim())
      .then(txId => {
        this.setState({messageModalOpen: false});

        // Redirect to OrderDetailsPage
        history.push(
          createResourceLocatorString('OrderDetailsPage', routes, {id: txId.uuid}, {})
        );
      })
      .catch(() => {
        // Ignore, error handling in duck file
      });
  };

  onBookingSubmit(values) {
    this.setState({appointmentModalOpen: false});
    console.log("Made booking, reloading usesr id = " + JSON.stringify(this.props.user.id ));
    this.props.onLoadData(this.props.user.id);

  }

  render() {
    const {
      page,
      scrollingDisabled,
      currentUser,
      user,
      userShowError,
      reviews,
      queryReviewsError,
      viewport,
      intl,
      isAuthenticated,
      onManageDisableScrolling,
      sendEnquiryError,
      sendEnquiryInProgress,
      userListingRefs,
      getListing,
      // onFetchBookings,
      // onFetchAvailabilityExceptions,
      onFetchTimeSlots,
      fetchSpeculatedTransaction,
      fetchSpeculateFreeTransaction,
      onInitiateOrder,
    } = this.props;

    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const profileUser = ensureUser(user);
    const isCurrentUser =
      ensuredCurrentUser.id && profileUser.id && ensuredCurrentUser.id.uuid === profileUser.id.uuid;
    const hasDefaultPaymentMethod =
      currentUser &&
      ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
      ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id;
    const attributes = profileUser.attributes || {};
    const profile = attributes.profile || {};
    const displayName = profile.displayName || "";
    const bio = profile.bio;
    const hasBio = !!bio;
    const rating = reviews.length > 0 ?
        reviews.reduce(((total, review) => total + review.attributes.rating), 0) / reviews.length
      : 0;
    const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;


    const noDefaultPayment = 'Error message';
    const type = 'error';

    const received = addFlashNotification(type, noDefaultPayment);


    const editLinkMobile = isCurrentUser ? (
      <NamedLink className={css.editLinkMobile} name="ProfileSettingsPage">
        <FormattedMessage id="ProfilePage.editProfileLinkMobile"/>
      </NamedLink>
    ) : null;
    const editLinkDesktop = isCurrentUser ? (
      <NamedLink className={css.editLinkDesktop} name="ProfileSettingsPage">
        <FormattedMessage id="ProfilePage.editProfileLinkDesktop"/>
      </NamedLink>
    ) : null;


    const asideContent = (
      <div className={css.asideContent}>
        {isMobileLayout ? <AvatarMedium className={css.avatar} user={user} disableProfileLink/> :
        <AvatarDashboard className={css.avatar} user={user} disableProfileLink/>}
        <h1 className={css.mobileHeading}>
          {displayName ? (
            <FormattedMessage id="ProfilePage.mobileHeading" values={{name: displayName}}/>
          ) : null}
        </h1>
        {editLinkMobile}
        {editLinkDesktop}
      </div>
    );

    const reviewsError = (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingReviewsFailed"/>
      </p>
    );

    const mobileReviews = (
      <div className={css.mobileReviews}>
        <h2 className={css.sectionHeading}>
          <FormattedMessage
            id="ProfilePage.reviewsTitle"
            values={{count: reviews.length}}
          />
        </h2>
        {queryReviewsError ? reviewsError : null}
        <Reviews reviews={reviews}/>
      </div>
    );

    const desktopReviews = (
      <div className={css.desktopReviews}>
        <h3 className={css.sectionHeading}>
          <FormattedMessage
            id="ProfilePage.reviewsTitle"
            values={{count: reviews.length}}
          />
        </h3>

        {queryReviewsError ? reviewsError : null}

        <Reviews reviews={reviews}/>
      </div>
    );

    const mainContent = (
      <div className={css.outerMainContentDiv}>
        <div className={css.headingAndButtons}>
          <div className={css.headingGroup}>
            <h1 className={css.desktopHeading}>
              {displayName}
            </h1>
            <ReviewRating
              reviewStarClassName={css.reviewStar}
              className={css.reviewStars}
              rating={rating}
            />
          </div>

          {isAuthenticated ? (
            <div className={css.buttonGroup}>
              <div className={css.buttonPadding}>
                <PrimaryButton className={css.button} onClick={this.onMakeAppointment}>Book</PrimaryButton>
              </div>
              <div className={css.buttonPadding}>
                <PrimaryButton className={css.button} onClick={this.onContactUser}>Send Message</PrimaryButton>
              </div>
            </div>
          ) : null}
        </div>

        {hasBio ?
          <div className={css.section}>
            <h2 className={css.sectionHeading}>About</h2>
            <p className={css.bio}>{bio}</p>
          </div>
          : null}

        <div className={css.section}>
          <h2 className={css.sectionHeading}>Services</h2>
          <div className={css.servicesGroup}>
            {userListingRefs.map(listing => {
              const {serviceType} = listing;
              const {label, icon} = getServiceType(serviceType);
              return (
                <div key={serviceType} className={css.service}>
                  {icon(null, css.iconCenter)}
                  <p className={css.serviceLabel}>{label}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className={css.section}>
          {isMobileLayout ? mobileReviews : desktopReviews}
        </div>

      </div>
    );

    let content;

    if (userShowError && userShowError.status === 404) {
      return <NotFoundPage/>;
    } else if (userShowError) {
      content = (
        <p className={css.error}>
          <FormattedMessage id="ProfilePage.loadingDataFailed"/>
        </p>
      );
    } else {
      content = mainContent;
    }

    const schemaTitle = intl.formatMessage(
      {id: 'ProfilePage.schemaTitle',},
      {
        name: displayName,
        siteTitle: config.siteTitle,
      }
    );

    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        title={schemaTitle}
        schema={{
          '@context': 'http://schema.org',
          '@type': 'ProfilePage',
          name: schemaTitle,
        }}
      >
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ProfilePage"/>
            <Hero
              rootClassName={css.heroRootClass}
              rootHeaderClass={css.heroHeaderRootClass}
              url={heroUrl}
              header={isMobileLayout ? displayName : "Profile"}
            >
              {isMobileLayout ? <ReviewRating
                reviewStarClassName={css.reviewStar}
                className={css.reviewStars}
                rating={rating}
              /> : null}
            </Hero>
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>

            <div className={css.contentContainer}>
              {isMobileLayout ? <AvatarLarge className={css.avatar} user={user} disableProfileLink/> :
                <AvatarDashboard className={css.avatar} user={user} disableProfileLink/>}
              <div className={css.mainContent}>
                {content}
              </div>
            </div>

            <Modal
              id="ListingPage.appointment"
              contentClassName={css.appointmentModalContent}
              isOpen={this.state.appointmentModalOpen}
              onClose={() => this.setState({appointmentModalOpen: false})}
              onManageDisableScrolling={onManageDisableScrolling}
              authorDisplayName={displayName}
            >
              <BookingModal
                listingRefs={userListingRefs}
                onManageDisableScrolling={onManageDisableScrolling}
                onSubmit={this.onBookingSubmit}
                getListing={getListing}
                availability={{
                  calendar: page.availabilityCalendar,
                  onFetchTimeSlots,
                }}
                fetchSpeculatedTransaction={fetchSpeculatedTransaction}
                fetchSpeculateFreeTransaction={fetchSpeculateFreeTransaction}
                onInitiateOrder={onInitiateOrder}
                currentUser={ensuredCurrentUser}
              />
            </Modal>

            <Modal
              id="ListingPage.enquiry"
              contentClassName={css.messageModalContent}
              isOpen={isAuthenticated && this.state.messageModalOpen}
              onClose={() => this.setState({messageModalOpen: false})}
              onManageDisableScrolling={onManageDisableScrolling}
            >
              <EnquiryForm
                className={css.messageForm}
                submitButtonWrapperClassName={css.messageSubmitButtonWrapper}
                listingTitle='no title'
                authorDisplayName={displayName}
                sendEnquiryError={sendEnquiryError}
                onSubmit={this.onSubmitEnquiry}
                inProgress={sendEnquiryInProgress}
                listings={userListingRefs}
              />
            </Modal>

            <Modal  id="ListingPage.enquiry"
                    contentClassName={css.noDefaultPaymentModalContent}
                    isOpen={isAuthenticated && this.state.noDefaultPaymentModalOpen}
                    onClose={() => this.setState({noDefaultPaymentModalOpen: false})}
                    onManageDisableScrolling={onManageDisableScrolling}>
              <p className={css.noDefaultPaymentText}> You do not have a default payment method defined.</p>

              <NamedLink name="PaymentMethodsPage" className={css.noDefaultPaymentLink}>
                Edit Payment Methods
              </NamedLink>
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

ProfilePageComponent.defaultProps = {
  currentUser: null,
  user: null,
  userShowError: null,
  reviews: [],
  queryReviewsError: null,
};

const {bool, arrayOf, number, shape, object} = PropTypes;

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  user: propTypes.user,
  userShowError: propTypes.error,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
  isAuthenticated: bool.isRequired,
  onManageDisableScrolling: func.isRequired,

  sendEnquiryError: propTypes.error,
  sendEnquiryInProgress: bool.isRequired,
  userListingRefs: arrayOf(object),

  // onFetchBookings: func.isRequired,
  // onFetchAvailabilityExceptions: func.isRequired,
  fetchSpeculatedTransaction: func.isRequired,
  onInitiateOrder: func.isRequired,
};

const mapStateToProps = state => {

  //console.log('IN profile state ' + JSON.stringify(state));
  const page = state.ProfilePage;
  const {currentUser} = state.user ;
  const {isAuthenticated} = state.Auth;
  const {
    userId,
    userShowError,
    reviews,
    queryReviewsError,
    sendEnquiryError,
    sendEnquiryInProgress,
    userListingRefs,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{type: 'user', id: userId}]);
  const user = userMatches.length === 1 ? userMatches[0] : null;
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    user,
    userShowError,
    reviews,
    queryReviewsError,
    isAuthenticated,
    sendEnquiryError,
    sendEnquiryInProgress,
    userListingRefs,
    page,
  };
};
//onSendEnquiry: (listingId, message) => dispatch(sendEnquiry(listingId, message))
const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onSendEnquiry: (listingId, message) => dispatch(sendEnquiry(listingId, message)),
  getListing: (listingId) => dispatch(getListing(listingId)),
  // onFetchBookings: params => dispatch(requestFetchBookings(params)),
  // onFetchAvailabilityExceptions: params => dispatch(requestFetchAvailabilityExceptions(params)),
  onFetchTimeSlots: (listingId, start, end, timezone) =>
    dispatch(getTimeSlots(listingId, start, end, timezone)),
  fetchSpeculatedTransaction: params => dispatch(speculateTransaction(params)),
  fetchSpeculateFreeTransaction: params => dispatch(speculateFreeTransaction(params)),
  onInitiateOrder: (params) => dispatch(initiateOrder(params)),
  onLoadData: (userId) => dispatch(loadData(userId)),
});

const ProfilePage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withViewport,
  injectIntl
)(ProfilePageComponent);

ProfilePage.loadData = params => {
  const id = new UUID(params.id);
  return loadData(id);
};

export default ProfilePage;
