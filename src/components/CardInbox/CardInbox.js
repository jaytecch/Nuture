import React, {useEffect, useState} from 'react';
import {arrayOf, bool, number, oneOf, shape, string} from 'prop-types';
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
import {isScrollingDisabled} from '../../ducks/UI.duck';
import {
  Avatar,
  BookingTimeInfo,
  NamedLink,
  IconSpinner,
  UserDisplayName, Card,
} from '../../components';
import config from '../../config';

import css from './CardInbox.css';
import moment from "moment";

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
      stateClassName: css.stateSuccess,
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
      stateClassName: css.stateSuccess,
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

  // If you want to show the booking price after the booking time on CardInbox you can
  // add the price after the BookingTimeInfo component. You can get the price by uncommenting
  // the following lines:

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
  const {unitType, txRole, booking, tx, intl, stateData, lastMessage} = props;
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
  const bookingString = booking.reduce((str, id) => str === "?" ? id.uuid : str + "+" + id.uuid, "?");

  return (
    <div className={css.item}>
      <div className={css.itemAvatar}>
        {isCustomer && listing ? listingLink : <Avatar user={otherUser}/>}
      </div>
      <NamedLink
        className={linkClasses}
        name="InboxPage"
        to={{search: bookingString}}
      >
        <div className={css.rowNotificationDot}>{rowNotificationDot}</div>
        <div className={css.itemInfo}>
          <div className={classNames(css.itemUsername, stateData.nameClassName)}>
            {otherUserDisplayName}
          </div>

          <div className={css.lastMessage}>
            {lastMessage ?
              <p className={css.lastMessageText}>
                {lastMessage.attributes.content}
              </p>
              :
              <div className={classNames(css.stateName, stateData.stateClassName)}>
                {stateData.state}
              </div>
            }
          </div>

        </div>
        <div className={css.itemState}>
          {lastMessage ? (
            <div className={css.lastTransitionedAt}>
              <span>{moment(lastMessage.attributes.createdAt).format("MMM D")}</span>
              <span>{moment(lastMessage.attributes.createdAt).format("h:mm A")}</span>
            </div>
          ) : (
            <div className={classNames(css.lastTransitionedAt, stateData.lastTransitionedAtClassName)}>
              <span>{lastTransitionedAt.short}</span>
              <span>{moment(lastTransitionedAt.long).format('h:mm A')}</span>
            </div>
          )}

        </div>
      </NamedLink>
    </div>
  );
};

InboxItem.propTypes = {
  unitType: propTypes.bookingUnitType.isRequired,
  txRole: oneOf(['customer', 'provider']).isRequired,
  tx: propTypes.transaction.isRequired,
  intl: intlShape.isRequired,
};

const createViewableItems = async (bookings, transactions, onFetchMessage) => {
  const booking = bookings.slice(0, 3);

  let promises = [];
  booking.forEach(booking => {
    const tx = transactions.find(tx => tx.id.uuid === booking[0].uuid);
    promises.push(
      onFetchMessage(tx.id)
        .then(message => {
          return {
            transaction: tx,
            booking: booking,
            message: message,
          }
        })
    );
  });

  return await Promise.all(promises).then(values => {
    return values;
  });
}

const CardInboxComponent = props => {
  const {
    unitType,
    currentUser,
    fetchInProgress,
    fetchOrdersOrSalesError,
    intl,
    className,
    bookings,
    transactions,
    header,
    noResultsMessage,
    onFetchMessage,
  } = props;

  const [viewableItems, setViewableItems] = useState([]);

  useEffect(() => {
    createViewableItems(bookings, transactions, onFetchMessage)
      .then(values => setViewableItems(values));
  }, [bookings])

  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const {profile} = ensuredCurrentUser.attributes || {};
  const {publicData} = profile || {};
  const {accountType} = publicData || {};
  const isOrders = accountType === 'parent';
  const txRole = isOrders ? 'customer' : 'provider';

  const toTxItem = viewableItem => {
    const {booking, transaction, message} = viewableItem;
    const stateData = txState(intl, transaction, txRole);

    // Render InboxItem only if the latest transition of the transaction is handled in the `txState` function.
    return stateData ? (
      <li key={transaction.id.uuid} className={css.listItem}>
        <InboxItem
          unitType={unitType}
          txRole={txRole}
          tx={transaction}
          intl={intl}
          stateData={stateData}
          booking={booking}
          lastMessage={message}
        />
      </li>
    ) : null;
  };

  const noResults =
    !fetchInProgress && bookings.length === 0 && !fetchOrdersOrSalesError ? (
      <li key="noResults" className={css.noResults}>
        {noResultsMessage ?
          noResultsMessage :
          <FormattedMessage id={isOrders ? 'InboxPage.noOrdersFound' : 'InboxPage.noSalesFound'}/>
        }
      </li>
    ) : null;

  const classes = classNames(css.root, className);

  return (
    <Card className={classes} flat={true} header={header}>
      <div className={css.content}>
        <ul className={css.itemList}>
          {!fetchInProgress ? (
            viewableItems.map(toTxItem)
          ) : (
            <li className={css.listItemsLoading}>
              <IconSpinner/>
            </li>
          )}
          {noResults}
        </ul>
        <NamedLink name="InboxPage" className={css.namedLinkButton}>
          SEE MORE
        </NamedLink>
      </div>

    </Card>
  );
};

CardInboxComponent.defaultProps = {
  unitType: config.bookingUnitType,
  currentUser: null,
  currentUserListing: null,
  currentUserHasOrders: null,
  fetchOrdersOrSalesError: null,
  pagination: null,
  providerNotificationCount: 0,
  sendVerificationEmailError: null,
  fetchInProgress: null,
  className: null,
  noResultsMessage: null
};

CardInboxComponent.propTypes = {
  className: string,
  unitType: propTypes.bookingUnitType,
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  fetchInProgress: bool.isRequired,
  fetchOrdersOrSalesError: propTypes.error,
  pagination: propTypes.pagination,
  providerNotificationCount: number,
  scrollingDisabled: bool.isRequired,
  transactions: arrayOf(propTypes.transaction).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
  header: string.isRequired,
  noResultsMessage: string,
};


const mapStateToProps = state => {
  const {
    currentUser,
    currentUserListing,
    currentUserNotificationCount: providerNotificationCount,
  } = state.user;
  return {
    currentUser,
    currentUserListing,
    providerNotificationCount,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const CardInbox = compose(
  connect(mapStateToProps),
  injectIntl
)(CardInboxComponent);


export default CardInbox;
