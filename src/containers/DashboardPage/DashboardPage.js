import React, {useEffect, useLayoutEffect, useState} from "react";
import {compose} from 'redux';
import {TopbarContainer} from "../../containers";
import {isScrollingDisabled, manageDisableScrolling} from "../../ducks/UI.duck";
import classNames from 'classnames';
import {connect} from "react-redux";
import config from "../../config";
import {injectIntl} from "react-intl";
import PropTypes, {arrayOf, bool, number, string, object} from 'prop-types';
import {propTypes} from '../../util/types';
import {ensureCurrentUser} from "../../util/data";
import {
  AvatarDashboard,
  CardAboutMe, CardJobListings, CardNextAppointment,
  LayoutSingleColumn,
  LayoutWrapperFooter,
  LayoutWrapperMain,
  LayoutWrapperTopbar, Modal, NamedLink, Footer,
  Page, PrimaryButton, ReviewRating, CardInbox, Hero, UserProfileProgress, CardAppointmentsCalendar,
} from '../../components';
import CardPaymentMethod from "../../components/CardPaymentMethod/CardPaymentMethod";
import {txState} from "../../components/CardInbox/CardInbox";
import {withViewport} from '../../util/contextHelpers';
import css from './DashboardPage.css';
import {AppointmentItem} from "../../components/CardNextAppointment/CardNextAppointment";
import moment from "moment";
import {fetchMessage, loadData} from "./DashboardPage.duck";
import {getMarketplaceEntities} from "../../ducks/marketplaceData.duck";
import heroUrl from '../../assets/dashboard-hero/hero-img-dashboard.png';
import mobileHeroUrl from '../../assets/dashboard-hero/hero-img-dashboard-768px.png';
import {txIsHireRequested, txIsRequested} from "../../util/transaction";
import DisputeForm from "../../forms/DisputeForm/DisputeForm";
import {contactNU} from "../../util/api";
import CardGrid from "./CardGrid";
import {useGlobalEvent, useDebouncedFn} from "beautiful-react-hooks";
import {detect} from "detect-browser";

const MAX_MOBILE_SCREEN_WIDTH = 768;

export const DashboardPageComponent = props => {
    const {
      scrollingDisabled,
      currentUser,
      intl,
      fetchInProgress,
      unitType,
      onManageDisableScrolling,
      listings,
      fetchListingsError,
      fetchListingsInProgress,
      viewport,
      reviews,
      bookings,
      transactions,
      onFetchMessage
    } = props;

    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [disputeSent, setDisputeSent] = useState(false);
    const [disputeError, setDisputeError] = useState(null);
    const [disputeType, setDisputeType] = useState(null);
    const [width, setWidth] = useState(window.innerWidth);

    // Setup window resizing handler and even listener;
    const onWindowResize = useGlobalEvent("resize");
    const onResizeHandler = useDebouncedFn(() => setWidth(window.innerWidth), 250);
    onWindowResize(onResizeHandler);


    const user = ensureCurrentUser(currentUser);
    const attributes = user.attributes || {};
    const {profile, email} = attributes || {};
    const {publicData, displayName} = profile || {};
    const {accountType} = publicData || {};
    const isProvider = accountType === 'pro';
    const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;
    const isOrders = accountType === 'parent';
    const disputeValues = [
      {value: 'Ratings', label: 'Ratings'},
      {value: 'Payment', label: 'Payment'},
      {value: 'Service', label: 'Service'},
      {value: 'Other', label: 'Other'},
    ];

    const rating = reviews.length > 0 ?
      reviews.reduce(((total, review) => total + review.attributes.rating), 0) / reviews.length
      : null;

    const retrieveNextAppointment = () => {

      // don't permanently modify the transaction array
      let copyTransactions = transactions.slice() || {};

      // remove transactions that occured before today
      let transactionsOldRemoved = copyTransactions.filter(function (tran) {
        let thisBooking = tran.booking || {};
        let thisAttributes = thisBooking.attributes || {};
        let thisStart = thisAttributes.start || {};
        return (thisStart > moment().toDate());
      });

      // sort the array by date in ascending order
      let sorted = transactionsOldRemoved.sort(function (a, b) {
        let aBooking = a.booking || {};
        let bBooking = b.booking || {};
        let aAttributes = aBooking.attributes || {};
        let bAttributes = bBooking.attributes || {};
        let aStart = aAttributes.start || {};
        let bStart = bAttributes.start || {};

        return (aStart - bStart);
      });

      // map only accepted transactions
      const tempArray = sorted.map(formatNextAppointment);

      // remove any empty transactions that were not accepted
      let filtered = tempArray.filter(function (el) {
        return el != null;
      });
      return filtered[0];
    }

    const hireRequestRefs = bookings.filter(booking => {
      const tx = transactions.find(tx => tx.id.uuid === booking[0].uuid);

      return txIsRequested(tx) || txIsHireRequested(tx);
    });

    const nonHireRequestRefs = bookings.filter(booking => {
      const tx = transactions.find(tx => tx.id.uuid === booking[0].uuid);

      return !txIsRequested(tx) && !txIsHireRequested(tx);
    });


    const formatNextAppointment = tx => {
      const txRole = isOrders ? 'customer' : 'provider';
      const stateData = txState(intl, tx, txRole);

      // Render InboxItem only if the latest transition of the transaction is handled in the `txState` function.
      return stateData && stateData.state.includes("Accepted") ? (
        <AppointmentItem unitType={unitType} type={txRole} tx={tx} intl={intl} stateData={stateData}
                         bookings={bookings}/>
      ) : null;
    };

    const siteTitle = config.siteTitle;
    const schemaTitle = intl.formatMessage({id: 'LandingPage.schemaTitle'}, {siteTitle});

    const handleDisputeSubmit = values => {
      console.log("Sending " + values.disputeType + " dispute : " + values.message);
      setDisputeError(null);

      contactNU({
        emailType: 'DISPUTE',
        subject: values.disputeType,
        message: values.message,
        name: displayName,
        email: email,
      }).then(response => {
        setDisputeSent(true);
      }).catch(e => {
        setDisputeError("There was an error sending your dispute. Please try again");
      });
    }

    const handleDisputeClose = () => {
      setDisputeError(null);
      setDisputeModalOpen(false)
    }

    const handleModalOnClose = () => {
      setDisputeModalOpen(false);
      setDisputeSent(false);
    }

    const disputeModal = (
      <Modal
        id="disputeModal"
        isOpen={disputeModalOpen}
        onClose={handleModalOnClose}
        onManageDisableScrolling={manageDisableScrolling}
      >
        {disputeSent ? (
          <div>
            <h2 className={css.modalh2}> Your dispute has been sent!</h2>
          </div>
        ) : (
          <div>
            <h2 className={css.modalh2}>File a Dispute</h2>
            {disputeError ? <p className={css.error}>{disputeError}</p> : null}
            <DisputeForm
              onSubmit={handleDisputeSubmit}
              handleClose={handleDisputeClose}
              disputeTypes={disputeValues}
            />
          </div>
        )}
      </Modal>
    )

    const myRating = isProvider ? (
      <ReviewRating
        reviewStarClassName={css.reviewStar}
        className={css.reviewStars}
        rating={rating}
      />
    ) : null;

// const myMobileRating = isProvider ? (
//   <ReviewRating
//     reviewStarClassName={css.reviewStar}
//     className={css.reviewStars}
//     rating={rating}
//   />
// ) : null;
    const aboutMeCard = (<CardAboutMe className={css.card}/>);
    const paymentCard = (<CardPaymentMethod className={css.card}/>);
    const nextApptCard = (
      <CardNextAppointment
        className={css.card}
        transactionArray={retrieveNextAppointment()}
        bookings={bookings}
      />);
    const calendarCard = (
      <CardAppointmentsCalendar
        className={classNames(css.card, css.cardLarge)}
        transactions={transactions}
        isOrders={isOrders}
      />);
    const inboxCard = (
      <CardInbox
        className={classNames(css.card, css.cardLarge)}
        header={intl.formatMessage({id: "Dashboard.messages"})}
        fetchInProgress={fetchInProgress}
        bookings={nonHireRequestRefs}
        transactions={transactions}
        onFetchMessage={onFetchMessage}
      />);
    const listingCard = isProvider ? (
      <CardInbox
        className={classNames(css.card, css.cardLarge)}
        header={intl.formatMessage({id: "Dashboard.hireRequests"})}
        noResultsMessage="You have no requests."
        fetchInProgress={fetchInProgress}
        transactions={transactions}
        bookings={hireRequestRefs}
        onFetchMessage={onFetchMessage}
      />
    ) : (
      <CardJobListings
        className={classNames(css.card, css.cardLarge)}
        listings={listings}
        fetchInProgress={fetchListingsInProgress}
        error={fetchListingsError}
      />);

    const cards = [aboutMeCard, paymentCard, nextApptCard, calendarCard, inboxCard, listingCard];

    const browser = detect();
    const isSafari = browser && browser.name === "safari";

    return (
      <Page
        className={css.root}
        scrollingDisabled={scrollingDisabled}
        title={schemaTitle}
        contentType="website"
      >
        <LayoutSingleColumn>
          <LayoutWrapperTopbar className={css.topBar}>
            <TopbarContainer currentPage='DashboardPage'/>
            <Hero url={heroUrl} mobileUrl={mobileHeroUrl} header="My Dashboard" rootClassName={css.profileHeader}>

              {isSafari ?
                <AvatarDashboard className={css.safariAvatar} user={user} disableProfileLink/>
                : <AvatarDashboard className={css.avatar} user={user} disableProfileLink/>
              }
            </Hero>

            {isMobileLayout ?
              <div className={css.mobileNameText}>
                {displayName}
                {myRating}
              </div> : null}

            <div className={css.nameWrapperLeft}>
              {!isMobileLayout ? <p className={css.nameText}>{displayName}</p> : null}
              {!isMobileLayout ? <div>{myRating}</div> : null}
            </div>
            <div className={css.buttonWrapperRight}>
              {isProvider ? (
                <NamedLink name="EditServicesPage" className={css.quickActionButton}>UPDATE
                  AVAILABILITY
                </NamedLink>
              ) : (
                <NamedLink name="EditJobListingPage" className={css.quickActionButton}>CREATE JOB
                  POSTING
                </NamedLink>
              )}

              <PrimaryButton className={css.headerPrimaryButton}
                             onClick={() => setDisputeModalOpen(true)}>
                FILE A DISPUTE
              </PrimaryButton>
              <div>{disputeModal}</div>
            </div>
          </LayoutWrapperTopbar>

          <LayoutWrapperMain>
            <UserProfileProgress currentUser={currentUser}/>

            <CardGrid cards={cards} width={width}/>

          </LayoutWrapperMain>

          <LayoutWrapperFooter>
            <Footer/>
          </LayoutWrapperFooter>

        </LayoutSingleColumn>
      </Page>
    )
  }
;

DashboardPageComponent.defaultProps = {
  unitType: config.bookingUnitType,
}

const {func, shape} = PropTypes;
DashboardPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  onManageDisableScrolling: func.isRequired,
  className: string,
  unitType: propTypes.bookingUnitType,
  currentUserListing: propTypes.ownListing,
  fetchInProgress: bool.isRequired,
  fetchOrdersOrSalesError: propTypes.error,
  providerNotificationCount: number,
  transactions: arrayOf(propTypes.transaction).isRequired,
  transactionRefs: propTypes.transactionRefs,
  listings: arrayOf(object).isRequired,
  fetchListingsError: propTypes.error.isRequired,
  fetchListingsInProgress: bool.isRequired,
  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,


}

const mapStateToProps = state => {
  const {
    currentUser,
    currentUserListing,
    currentUserNotificationCount: providerNotificationCount,
  } = state.user;

  const {
    listings,
    fetchListingsInProgress,
    fetchListingsError,
    reviews,
    bookings,
    transactionRefs,
  } = state.DashboardPage;

  return {
    currentUser,
    currentUserListing,
    providerNotificationCount,
    scrollingDisabled: isScrollingDisabled(state),
    listings,
    fetchListingsError,
    fetchListingsInProgress,
    reviews,
    bookings,
    transactions: getMarketplaceEntities(state, transactionRefs),
  };
}

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onFetchMessage: txId => dispatch(fetchMessage(txId)),
});


const DashboardPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withViewport,
  injectIntl
)(DashboardPageComponent);

DashboardPage.loadData = loadData;

export default DashboardPage;
