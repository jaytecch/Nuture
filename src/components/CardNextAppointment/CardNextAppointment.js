import React from "react";
import css from './CardNextAppointment.css';
import {FormattedMessage, injectIntl} from "react-intl";
import {arrayOf, bool, number, oneOf, string} from 'prop-types';
import classNames from 'classnames';
import {
  Map,
  Avatar,
  BookingTimeInfo,
  Card,
  IconSpinner,
  NamedLink,
  UserDisplayName
} from "../../components";
import {ensureCurrentUser, ensureListing} from "../../util/data";
import {txIsEnquired, txIsRequested} from '../../util/transaction';
import config from "../../config";
import {DATE_TYPE_DATETIME, propTypes} from "../../util/types";
import {intlShape} from "../../util/reactIntl";
import {isScrollingDisabled} from "../../ducks/UI.duck";
import {getMarketplaceEntities} from "../../ducks/marketplaceData.duck";
import {compose} from "redux";
import {connect} from "react-redux";
import {createSlug, stringify} from "../../util/urlHelpers";
import {AvatarLarge} from "..";
import {types as sdkTypes} from '../../util/sdkLoader';
import {formatMoney} from "../../util/currency";

const {LatLng} = sdkTypes;


// Functional component as internal helper to print BookingTimeInfo if that is needed
const BookingInfoMaybe = props => {
  const {isOrder, intl, tx, unitType, address} = props;
  const isEnquiry = txIsEnquired(tx);

  if (isEnquiry) {
    return null;
  }

  //console.log("full listing values = " + JSON.stringify(tx.listing));
  const listingAttributes = ensureListing(tx.listing).attributes;
  //console.log("In Next Appointment listingAttributes = " + JSON.stringify(listingAttributes));

  const service = listingAttributes.title;

  const timeZone = listingAttributes.availabilityPlan
    ? listingAttributes.availabilityPlan.timezone
    : 'Etc/UTC';

  // If you want to show the booking price after the booking time on CardInbox you can
  // add the price after the BookingTimeInfo component. You can get the price by uncommenting
  // sthe following lines:

  const bookingPrice = isOrder ? tx.attributes.payinTotal : tx.attributes.payoutTotal;
  const price = bookingPrice ? formatMoney(intl, bookingPrice) : null;

  const addrs = address ? (
    <div className={css.nextApptRow}>
      <div className={css.highlightText}>Address:</div>
      <div className={css.itemPrice}>{address}</div>
    </div>
  ) : null;

  // Remember to also add formatMoney function from 'util/currency.js' and add this after BookingTimeInfo:
  // <div className={css.itemPrice}>{price}</div>

  return (
    <div>
      <div className={css.nextApptRow}>
        <div className={css.highlightText}>Service:</div>
        <div className={css.normalText}>{service}</div>
      </div>
      <div className={css.nextApptRow}>
        <div className={css.highlightText}>Date:</div>
        <BookingTimeInfo
          bookingClassName={css.normalText}
          isOrder={isOrder}
          intl={intl}
          tx={tx}
          unitType={unitType}
          dateType={DATE_TYPE_DATETIME}
          timeZone={timeZone}
        />
      </div>
      <div className={css.nextApptRow}>
        <div className={css.highlightText}>Total Cost:</div>
        <div className={css.itemPrice}>{price}</div>
      </div>
      {addrs}
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
        <AvatarLarge user={otherUser} disableProfileLink/>
      </NamedLink>
    );
  } else {
    return <FormattedMessage id="TransactionPanel.deletedListingOrderTitle"/>;
  }
};


export const AppointmentItem = props => {
  const {unitType, type, tx, intl, stateData, bookings} = props;
  const {customer, provider, listing, attributes} = tx;
  const {protectedData} = attributes || {};
  const {location} = protectedData || {};
  const {latlong, address} = location || {};
  const isCustomer = type === 'customer';

  const otherUser = isCustomer ? provider : customer;
  const otherUserDisplayName = <UserDisplayName user={otherUser} intl={intl}/>;
  const isOtherUserBanned = otherUser.attributes.banned;

  const isSaleNotification = !isCustomer && txIsRequested(tx);
  const rowNotificationDot = isSaleNotification ? <div className={css.notificationDot}/> : null;
  //const lastTransitionedAt = formatDate(intl, tx.attributes.lastTransitionedAt);

  const linkClasses = classNames(css.itemLink, {
    [css.bannedUserLink]: isOtherUserBanned,
  });

  const listingLink = listing ? createListingLink(listing, otherUser) : null;

  const selectedBooking = bookings.find(booking => booking.find(ref => ref.uuid == tx.id.uuid));
  const bookingString = selectedBooking.reduce((str, id) => str === "?" ? id.uuid : str + "+" + id.uuid, "?");

  const mapClickHandle = e => {
    e.preventDefault();
  }

  //console.log("In appointment formatting listing " + JSON.stringify(listing));
  //console.log("In appointment formatting otheruser" + JSON.stringify(otherUser));

  return (
    <div className={css.content}>
      <div className={css.item}>
        <div className={css.info}>
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
              <BookingInfoMaybe
                address={address}
                intl={intl}
                isOrder={isCustomer}
                tx={tx}
                unitType={unitType}
              />
            </div>

            <div className={css.itemState}>
              <div className={classNames(css.stateName, stateData.stateClassName)}>
                {/*{stateData.state}*/}
              </div>
              {/*<div*/}
              {/*  className={classNames(css.lastTransitionedAt, stateData.lastTransitionedAtClassName)}*/}
              {/*  title={lastTransitionedAt.long}*/}
              {/*>*/}
              {/*  {lastTransitionedAt.short}*/}
              {/*</div>*/}
            </div>
          </NamedLink>
        </div>


        {latlong ?
          <div className={css.map}>
            <Map center={new LatLng(latlong.lat, latlong.long)} address={address}/>
          </div>
          : null}

      </div>


      <NamedLink name="InboxPage" className={css.namedLinkButton} to={{search: bookingString}}>
        SEND A MESSAGE

      </NamedLink>
      <NamedLink name="InboxPage" className={css.cancel} to={{search: bookingString}}>
        CANCEL APPOINTMENT
      </NamedLink>
    </div>

  );
};

AppointmentItem.propTypes = {
  unitType: propTypes.bookingUnitType.isRequired,
  type: oneOf(['order', 'sale']).isRequired,
  tx: propTypes.transaction.isRequired,
  intl: intlShape.isRequired,
  bookings: arrayOf(propTypes.transactionRefs).isRequired,
};
export const CardNextAppointmentComponent = props => {
  const {
    className,
    currentUser,
    fetchInProgress,
    intl,
    transactionArray,
  } = props;

  const classes = classNames(css.root, className);
  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const {profile} = ensuredCurrentUser.attributes || {};
  const {publicData} = profile || {};
  const {accountType} = publicData || {};

  const isParent = accountType === 'parent' ? true : false;


  const noResults = !transactionArray ? (
    <div className={css.noResultsDiv}>
      <p key="noResults" className={css.noResults}>
        You have no upcoming appointments
      </p>


      <NamedLink name="SearchPage" className={css.namedLinkButton}>
        {isParent ? "FIND YOUR NEXT SERVICE PRO" : "FIND YOUR NEXT CLIENT"}
      </NamedLink>
    </div>
  ) : null;

  const header = intl.formatMessage({id: "Dashboard.nextAppointment"})

  return (
    <Card className={classes} flat={true} header={header}>
      {!fetchInProgress ? (
        transactionArray
      ) : (
        <IconSpinner/>
      )}
      {noResults}
    </Card>
  );
};

CardNextAppointmentComponent.defaultProps = {
  unitType: config.bookingUnitType,
  currentUser: null,
  currentUserListing: null,
  currentUserHasOrders: null,
  fetchOrdersOrSalesError: null,
  pagination: null,
  providerNotificationCount: 0,
  sendVerificationEmailError: null,
  fetchInProgress: null,
  transactionRefs: null,

};

CardNextAppointmentComponent.propTypes = {
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
  transactionRefs: propTypes.transactionRefs,
  // from injectIntl
  intl: intlShape.isRequired,
}

const mapStateToProps = state => {
  const {transactionRefs} = state.InboxPage;
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
    transactions: getMarketplaceEntities(state, transactionRefs),
  };
};

const CardNextAppointment = compose(
  connect(mapStateToProps),
  injectIntl
)(CardNextAppointmentComponent);


export default CardNextAppointment;


