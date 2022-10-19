import React, {useState} from 'react';
import heroUrl from '../../assets/hero-messages/hero-img-messages.png';
import mobileHeroUrl from '../../assets/hero-messages/hero-img-messages-1226px.png';
import {arrayOf, bool, number, oneOf, func, object, shape, string} from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {FormattedMessage, injectIntl, intlShape} from '../../util/reactIntl';
import classNames from 'classnames';
import {
  txIsAccepted,
  txIsCanceled,
  txIsDeclined,
  txIsEnquired,
  txIsRequested,
  txHasBeenDelivered, txIsDisableCancel, txIsHireRequested,
} from '../../util/transaction';
import {propTypes, DATE_TYPE_DATETIME} from '../../util/types';
import {createSlug, stringify} from '../../util/urlHelpers';
import {ensureCurrentUser, ensureListing} from '../../util/data';
import {getMarketplaceEntities} from '../../ducks/marketplaceData.duck';
import {isScrollingDisabled} from '../../ducks/UI.duck';
import {
  Avatar,
  BookingTimeInfo,
  NamedLink,
  Page,
  LayoutWrapperMain,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  IconSpinner,
  UserDisplayName,
  Hero,
} from '../../components';
import {TopbarContainer} from '../../containers';
import config from '../../config';
import {loadData, resetBooking, selectBooking, setPage} from './InboxPage.duck';
import css from './InboxPage.css';
import TransactionContainer from "../TransactionContainer/TransactionContainer";
import {withViewport} from "../../util/contextHelpers";
import InboxPagingLinks from "./InboxPagingLinks";

const MAX_MOBILE_SCREEN_WIDTH = 768;

const formatDate = (intl, date) => {
  return {
    short: intl.formatDate(date, {
      month: 'short',
      day: 'numeric',
    }),
    long: `${intl.formatDate(date)} ${intl.formatTime(date)}`,
  };
};

// Translated name of the state of the given transaction
export const txState = (intl, tx, txRole) => {
  const isOrder = txRole === 'customer';

  if (txIsEnquired(tx)) {
    return {
      nameClassName: isOrder ? css.nameNotEmphasized : css.nameEmphasized,
      bookingClassName: css.bookingActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtEmphasized,
      stateClassName: css.stateActionNeeded,
      state: intl.formatMessage({
        id: 'InboxPage.stateEnquiry',
      }),
    };
  } else if (txIsRequested(tx)) {
    const requested = isOrder
      ? {
        nameClassName: css.nameNotEmphasized,
        bookingClassName: css.bookingNoActionNeeded,
        lastTransitionedAtClassName: css.lastTransitionedAtEmphasized,
        stateClassName: css.stateActionNeeded,
        state: intl.formatMessage({
          id: 'InboxPage.stateRequested',
        }),
      }
      : {
        nameClassName: css.nameEmphasized,
        bookingClassName: css.bookingActionNeeded,
        lastTransitionedAtClassName: css.lastTransitionedAtEmphasized,
        stateClassName: css.stateActionNeeded,
        state: intl.formatMessage({
          id: 'InboxPage.statePending',
        }),
      };

    return requested;
  } else if (txIsHireRequested(tx)) {
    return isOrder ? {
      nameClassName: css.nameNotEmphasized,
      bookingClassName: css.bookingNoActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtEmphasized,
      stateClassName: css.stateActionNeeded,
      state: intl.formatMessage({
        id: 'InboxPage.stateHireRequested',
      }),
    } : {
      nameClassName: css.nameEmphasized,
      bookingClassName: css.bookingActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtEmphasized,
      stateClassName: css.stateActionNeeded,
      state: intl.formatMessage({
        id: 'InboxPage.statePending',
      }),
    };
  } else if (txIsDeclined(tx)) {
    return {
      nameClassName: css.nameNotEmphasized,
      bookingClassName: css.bookingNoActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtNotEmphasized,
      stateClassName: css.stateNoActionNeeded,
      state: intl.formatMessage({
        id: 'InboxPage.stateDeclined',
      }),
    };
  } else if (txIsAccepted(tx)) {
    return {
      nameClassName: css.nameNotEmphasized,
      bookingClassName: css.bookingNoActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtNotEmphasized,
      stateClassName: css.stateSucces,
      state: intl.formatMessage({
        id: 'InboxPage.stateAccepted',
      }),
    };
  } else if (txIsCanceled(tx)) {
    return {
      nameClassName: css.nameNotEmphasized,
      bookingClassName: css.bookingNoActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtNotEmphasized,
      stateClassName: css.stateNoActionNeeded,
      state: intl.formatMessage({
        id: 'InboxPage.stateCanceled',
      }),
    };
  } else if (txHasBeenDelivered(tx)) {
    return {
      nameClassName: css.nameNotEmphasized,
      bookingClassName: css.bookingNoActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtNotEmphasized,
      stateClassName: css.stateNoActionNeeded,
      state: intl.formatMessage({
        id: 'InboxPage.stateDelivered',
      }),
    };
  } else if (txIsDisableCancel(tx)) {
    return {
      nameClassName: css.nameNotEmphasized,
      bookingClassName: css.bookingNoActionNeeded,
      lastTransitionedAtClassName: css.lastTransitionedAtNotEmphasized,
      stateClassName: css.stateSucces,
      state: intl.formatMessage({
        id: 'InboxPage.stateAcceptedNoCancel',
      }),
    };
  } else {
    console.warn('This transition is unknown:', tx.attributes.lastTransition);
    return null;
  }
};

// Functional component as internal helper to print BookingTimeInfo if that is needed
const BookingInfoMaybe = props => {
  const {bookingClassName, isOrder, intl, tx, unitType} = props;
  const isEnquiry = txIsEnquired(tx);

  if (isEnquiry) {
    return null;
  }
  const listingAttributes = ensureListing(tx.listing).attributes;
  const timeZone = listingAttributes.availabilityPlan
    ? listingAttributes.availabilityPlan.timezone
    : 'Etc/UTC';

  // If you want to show the booking price after the booking time on InboxPage you can
  // add the price after the BookingTimeInfo component. You can get the price by uncommenting
  // sthe following lines:

  // const bookingPrice = isOrder ? tx.attributes.payinTotal : tx.attributes.payoutTotal;
  // const price = bookingPrice ? formatMoney(intl, bookingPrice) : null;

  // Remember to also add formatMoney function from 'util/currency.js' and add this after BookingTimeInfo:
  // <div className={css.itemPrice}>{price}</div>

  return (
    <div className={classNames(css.bookingInfoWrapper, bookingClassName)}>
      <BookingTimeInfo
        bookingClassName={bookingClassName}
        isOrder={isOrder}
        intl={intl}
        tx={tx}
        unitType={unitType}
        dateType={DATE_TYPE_DATETIME}
        timeZone={timeZone}
      />
    </div>
  );
};

BookingInfoMaybe.propTypes = {
  intl: intlShape.isRequired,
  isOrder: bool.isRequired,
  tx: propTypes.transaction.isRequired,
  unitType: propTypes.bookingUnitType.isRequired,
};

const createListingLink = (listing, otherUser, searchParams = {}, className = '') => {
  const listingId = listing.id && listing.id.uuid;
  const label = listing.attributes.title;
  const listingDeleted = listing.attributes.deleted;

  if (!listingDeleted) {
    const params = {id: listingId, slug: createSlug(label)};
    const to = {search: stringify(searchParams)};
    return (
      <NamedLink className={className} name="ListingPage" params={params} to={to}>
        <Avatar user={otherUser} disableProfileLink/>
      </NamedLink>
    );
  } else {
    return <FormattedMessage id="TransactionPanel.deletedListingOrderTitle"/>;
  }
};

export const InboxItem = props => {
  const {
    unitType,
    txRole,
    tx,
    intl,
    stateData,
    booking,
    onSelectBooking,
  } = props;
  const {customer, provider, listing} = tx;
  const isCustomer = txRole === 'customer';

  const otherUser = isCustomer ? provider : customer;
  const otherUserDisplayName = <UserDisplayName user={otherUser} intl={intl}/>;
  const isOtherUserBanned = otherUser.attributes.banned;

  const isSaleNotification = !isCustomer && txIsRequested(tx);
  const rowNotificationDot = isSaleNotification ? <div className={css.notificationDot}/> : null;
  const lastTransitionedAt = formatDate(intl, tx.attributes.lastTransitionedAt);

  const linkClasses = classNames(css.itemLink, {
    [css.bannedUserLink]: isOtherUserBanned,
  });

  const listingLink = listing ? createListingLink(listing, otherUser) : null;

  return (
    <div className={css.item}>
      <div className={css.itemAvatar}>
        {isCustomer && listing ? listingLink : <Avatar user={otherUser}/>}
      </div>
      <div
        className={linkClasses}
        onClick={() => onSelectBooking(booking)}
      >
        <div className={css.rowNotificationDot}>{rowNotificationDot}</div>
        <div className={css.itemInfo}>
          <div className={classNames(css.itemUsername, stateData.nameClassName)}>
            {otherUserDisplayName}
          </div>
          <BookingInfoMaybe
            bookingClassName={stateData.bookingClassName}
            intl={intl}
            isOrder={isCustomer}
            tx={tx}
            unitType={unitType}
          />
        </div>
        <div className={css.itemState}>
          <div className={classNames(css.stateName, stateData.stateClassName)}>
            {stateData.state}
          </div>
          <div
            className={classNames(css.lastTransitionedAt, stateData.lastTransitionedAtClassName)}
            title={lastTransitionedAt.long}
          >
            {lastTransitionedAt.short}
          </div>
        </div>
      </div>
    </div>
  );
};

InboxItem.propTypes = {
  unitType: propTypes.bookingUnitType.isRequired,
  txRole: oneOf(['customer', 'provider']).isRequired,
  tx: propTypes.transaction.isRequired,
  intl: intlShape.isRequired,
  booking: arrayOf(object).isRequired,
  onSelectBooking: func.isRequired
};


export const InboxPageComponent = props => {
  const {
    unitType,
    currentUser,
    currentUserListing,
    fetchInProgress,
    fetchOrdersOrSalesError,
    intl,
    pagination,
    params,
    providerNotificationCount,
    scrollingDisabled,
    transactions,
    currentPageTransactionIds,
    onSetPage,
    numberOfPages,
    onClearBooking,
    onSelectBooking,
    selectedBooking,
    viewport,
    currentPage
  } = props;

  const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH
  const [showTxPanel, setShowTxPanel] = useState(!isMobileLayout || selectedBooking.length > 0);

  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const {profile} = ensuredCurrentUser.attributes || {};
  const {publicData} = profile || {};
  const {accountType} = publicData || {};
  const isOrders = accountType === 'parent';
  const txRole = isOrders ? 'customer' : 'provider';

  const handleBookingSelection = booking => {
    setShowTxPanel(true);

    onClearBooking().then( () => {
      onSelectBooking(booking);
    });
  }

  const handleClosePanel = () => {
    setShowTxPanel(false);
  }

  const toTxItem = (bookingList, selected) => {
    const tx = transactions.find(tx => tx.id.uuid === bookingList[0].uuid);
    const isSelected = selected && !!selected.find(id => id.uuid === tx.id.uuid);
    const stateData = txState(intl, tx, txRole);

    const classname = classNames(css.listItem, {
      [css.selectedListItem]: isSelected,
    })

    // Render InboxItem only if the latest transition of the transaction is handled in the `txState` function.
    return stateData ? (
      <li key={tx.id.uuid} className={classname}>
        <InboxItem
          unitType={unitType}
          txRole={txRole}
          tx={tx}
          intl={intl}
          stateData={stateData}
          booking={bookingList}
          onSelectBooking={handleBookingSelection}
        />
      </li>
    ) : null;
  };

  const error = fetchOrdersOrSalesError ? (
    <p className={css.error}>
      <FormattedMessage id="InboxPage.fetchFailed"/>
    </p>
  ) : null;

  const noResults =
    !fetchInProgress && transactions.length === 0 && !fetchOrdersOrSalesError ? (
      <li key="noResults" className={css.noResults}>
        <FormattedMessage id={isOrders ? 'InboxPage.noOrdersFound' : 'InboxPage.noSalesFound'}/>
      </li>
    ) : null;

  const hasOrderOrSaleTransactions = (tx, isOrdersTab, user) => {
    return isOrdersTab
      ? user.id && tx && tx.length > 0 && tx[0].customer.id.uuid === user.id.uuid
      : user.id && tx && tx.length > 0 && tx[0].provider.id.uuid === user.id.uuid;
  };
  const hasTransactions =
    !fetchInProgress && hasOrderOrSaleTransactions(transactions, isOrders, ensuredCurrentUser);

  const changePage = page => {
    onSetPage(page);
  }

  const pagingLinks =
    hasTransactions && numberOfPages > 1 ? (
      <InboxPagingLinks numberOfPages={numberOfPages} changePage={changePage} currentPage={currentPage}/>
    ) : null;

  const hideFooterClass = classNames({
    [css.hideFooter]: isMobileLayout && showTxPanel
  })

  const header = intl.formatMessage({id: 'InboxPage.header'});

  return (
    <Page title={header} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar className={css.topbar}>
          <TopbarContainer currentPage="InboxPage"/>
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <Hero url={heroUrl} rootClassName={css.heroContainer} header={header}/>

          <div className={css.content}>
            {!isMobileLayout || !showTxPanel ? (
              <div className={css.messageList}>
                {error}
                {pagingLinks}
                <ul className={css.itemList}>
                  {!fetchInProgress ? (
                    currentPageTransactionIds.map(booking => toTxItem(booking, selectedBooking))
                  ) : (
                    <li className={css.listItemsLoading}>
                      <IconSpinner/>
                    </li>
                  )}
                  {noResults}
                </ul>
                {pagingLinks}
              </div>
            ) : null}

            {!isMobileLayout || showTxPanel ?
              (<div className={css.messageArea}>
                  {selectedBooking.length > 0 ?
                    <TransactionContainer
                      handleCloseMessage={isMobileLayout ? handleClosePanel : null}
                      transactionRole={txRole}
                      booking={selectedBooking}
                    />
                    : null}
                </div>
              ) : null
            }
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter className={hideFooterClass}>
          <Footer/>
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

InboxPageComponent.defaultProps = {
  unitType: config.bookingUnitType,
  currentUser: null,
  currentUserListing: null,
  currentUserHasOrders: null,
  fetchOrdersOrSalesError: null,
  pagination: null,
  providerNotificationCount: 0,
  sendVerificationEmailError: null,
  initialBooking: null,
};

InboxPageComponent.propTypes = {
  // params: shape({
  //   tab: string.isRequired,
  // }).isRequired,

  unitType: propTypes.bookingUnitType,
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  fetchInProgress: bool.isRequired,
  fetchOrdersOrSalesError: propTypes.error,
  pagination: propTypes.pagination,
  providerNotificationCount: number,
  scrollingDisabled: bool.isRequired,
  transactions: arrayOf(propTypes.transaction).isRequired,
  rolledUpTransactionIds: arrayOf(arrayOf(object)),
  onSelectBooking: func.isRequired,
  currentPage: number.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectBooking: booking => dispatch(selectBooking(booking)),
    onClearBooking: () => dispatch(resetBooking()),
    onSetPage: page => dispatch(setPage(page)),
  }
}

const mapStateToProps = state => {
  const {
    fetchInProgress,
    fetchOrdersOrSalesError,
    pagination,
    transactionRefs,
    selectedBooking,
    currentPageTransactionIds,
    numberOfPages,
    currentPage,
  } = state.InboxPage;
  const {
    currentUser,
    currentUserListing,
    currentUserNotificationCount: providerNotificationCount,
  } = state.user;

  return {
    currentUser,
    currentUserListing,
    fetchInProgress,
    fetchOrdersOrSalesError,
    pagination,
    providerNotificationCount,
    scrollingDisabled: isScrollingDisabled(state),
    transactions: getMarketplaceEntities(state, transactionRefs),
    selectedBooking,
    currentPageTransactionIds,
    numberOfPages,
    currentPage,
  };
};

const InboxPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withViewport,
  injectIntl
)(InboxPageComponent);

InboxPage.loadData = loadData;

export default InboxPage;
