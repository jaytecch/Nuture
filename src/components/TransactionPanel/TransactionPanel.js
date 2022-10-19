import React, { Component } from 'react';
import { array, arrayOf, bool, func, number, object, string } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  TRANSITION_NEW_BOOKING_REQUEST_AFTER_ENQUIRY,
  txIsAccepted,
  txIsCanceled,
  txIsDeclined,
  txIsEnquired,
  txIsRequested,
  txHasBeenDelivered, txIsDisableCancel, txIsHireRequested,
} from '../../util/transaction';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes } from '../../util/types';
import {
  ensureCurrentUser,
  ensureListing, ensurePaymentMethodCard, ensureStripeCustomer,
  ensureTransaction,
  ensureUser,
  userDisplayNameAsString,
} from '../../util/data';
import { isMobileSafari } from '../../util/userAgent';
import { formatMoney } from '../../util/currency';
import {
  AvatarLarge,
  BookingPanel, ModalInMobile,
  NamedLink,
  ReviewModal,
  UserDisplayName,
} from '../../components';
import { SendMessageForm } from '../../forms';
import config from '../../config';


// These are internal components that make this file more readable.
import AddressLinkMaybe from './AddressLinkMaybe';
import BreakdownMaybe from './BreakdownMaybe';
import DetailCardHeadingsMaybe from './DetailCardHeadingsMaybe';
import DetailCardImage from './DetailCardImage';
import FeedSection from './FeedSection';
import SaleActionButtonsMaybe from './SaleActionButtonsMaybe';
import PanelHeading, {
  HEADING_ENQUIRED,
  HEADING_PAYMENT_PENDING,
  HEADING_PAYMENT_EXPIRED,
  HEADING_REQUESTED,
  HEADING_ACCEPTED,
  HEADING_DECLINED,
  HEADING_CANCELED,
  HEADING_DELIVERED, HEADING_ACCEPTED_NO_CANCEL, HEADING_HIRED,
} from './PanelHeading';

import css from './TransactionPanel.css';
import PayoutActionButtons from "./PayoutActionButtons";
import {updateMetadata} from "../../ducks/Auth.duck";
import {getServiceType} from "../../nurtureUpLists";
const publicIp = require('public-ip');

// Helper function to get display names for different roles
const displayNames = (currentUser, currentProvider, currentCustomer, intl) => {
  const authorDisplayName = <UserDisplayName user={currentProvider} intl={intl} />;
  const customerDisplayName = <UserDisplayName user={currentCustomer} intl={intl} />;

  let otherUserDisplayName = '';
  let otherUserDisplayNameString = '';
  const currentUserIsCustomer =
    currentUser.id && currentCustomer.id && currentUser.id.uuid === currentCustomer.id.uuid;
  const currentUserIsProvider =
    currentUser.id && currentProvider.id && currentUser.id.uuid === currentProvider.id.uuid;

  if (currentUserIsCustomer) {
    otherUserDisplayName = authorDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(currentProvider, '');
  } else if (currentUserIsProvider) {
    otherUserDisplayName = customerDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(currentCustomer, '');
  }

  return {
    authorDisplayName,
    customerDisplayName,
    otherUserDisplayName,
    otherUserDisplayNameString,
  };
};

export class TransactionPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendMessageFormFocused: false,
      isReviewModalOpen: false,
      isBreakdownModalOpen: false,
      reviewSubmitted: false,
      typedContractSignature: null,
      // contractSignedForServiceType: false,
    };
    this.isMobSaf = false;
    this.sendMessageFormName = 'TransactionPanel.SendMessageForm';

    this.onOpenReviewModal = this.onOpenReviewModal.bind(this);
    this.onOpenBreakdownModal = this.onOpenBreakdownModal.bind(this);
    this.onCloseBreakdownModal = this.onCloseBreakdownModal.bind(this);
    this.onSubmitReview = this.onSubmitReview.bind(this);
    this.onSendMessageFormFocus = this.onSendMessageFormFocus.bind(this);
    this.onSendMessageFormBlur = this.onSendMessageFormBlur.bind(this);
    this.onMessageSubmit = this.onMessageSubmit.bind(this);
    this.scrollToMessage = this.scrollToMessage.bind(this);
  }

  componentDidMount() {
    this.isMobSaf = isMobileSafari();
  }

  onOpenReviewModal() {
    this.setState({ isReviewModalOpen: true });
  }

  onOpenBreakdownModal() {
    this.setState({isBreakdownModalOpen: true});
  }

  onCloseBreakdownModal() {
    this.setState({isBreakdownModalOpen: false});
  }

  onSubmitReview(values) {
    const { onSendReview, transaction, transactionRole } = this.props;
    const currentTransaction = ensureTransaction(transaction);
    const { reviewRating, reviewContent } = values;
    const rating = Number.parseInt(reviewRating, 10);
    onSendReview(transactionRole, currentTransaction, rating, reviewContent)
      .then(r => this.setState({ isReviewModalOpen: false, reviewSubmitted: true }))
      .catch(e => {
        // Do nothing.
      });
  }

  onSendMessageFormFocus() {
    this.setState({ sendMessageFormFocused: true });
    if (this.isMobSaf) {
      // Scroll to bottom
      window.scroll({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
    }
  }

  onSendMessageFormBlur() {
    this.setState({ sendMessageFormFocused: false });
  }

  onMessageSubmit(values, form) {
    const message = values.message ? values.message.trim() : null;
    const { transaction, onSendMessage } = this.props;
    const ensuredTransaction = ensureTransaction(transaction);

    if (!message) {
      return;
    }
    onSendMessage(ensuredTransaction.id, message)
      .then(messageId => {
        form.reset();
        this.scrollToMessage(messageId);
      })
      .catch(e => {
        // Ignore, Redux handles the error
      });
  }

  scrollToMessage(messageId) {
    const selector = `#msg-${messageId.uuid}`;
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }
  }

  render() {
    const {
      rootClassName,
      className,
      currentUser,
      transaction,
      bookingTransactions,
      totalMessagePages,
      oldestMessagePageFetched,
      messages,
      initialMessageFailed,
      savePaymentMethodFailed,
      fetchMessagesInProgress,
      fetchMessagesError,
      sendMessageInProgress,
      sendMessageError,
      sendReviewInProgress,
      sendReviewError,
      onFetchTimeSlots,
      onManageDisableScrolling,
      onShowMoreMessages,
      transactionRole,
      intl,
      onAcceptSale,
      onDeclineSale,
      acceptInProgress,
      declineInProgress,
      acceptSaleError,
      declineSaleError,
      onPayout,
      onDispute,
      payoutInProgress,
      disputeInProgress,
      payoutError,
      disputeError,
      onSubmitBookingRequest,
      monthlyTimeSlots,
      nextTransitions,
      handleCloseMessage,
      onUpdateUserProfile,
    } = this.props;

    const currentTransaction = ensureTransaction(transaction);
    const currentListing = ensureListing(currentTransaction.listing);
    const currentProvider = ensureUser(currentTransaction.provider);
    const currentCustomer = ensureUser(currentTransaction.customer);
    const isCustomer = transactionRole === 'customer';
    const isProvider = transactionRole === 'provider';
    const isFlatRate = currentListing.attributes.publicData.serviceType === 'postpartumDoula';

    const listingLoaded = !!currentListing.id;
    const listingDeleted = listingLoaded && currentListing.attributes.deleted;
    const isCustomerLoaded = !!currentCustomer.id;
    const isCustomerBanned = isCustomerLoaded && currentCustomer.attributes.banned;
    const isCustomerDeleted = isCustomerLoaded && currentCustomer.attributes.deleted;
    const isProviderLoaded = !!currentProvider.id;
    const isProviderBanned = isProviderLoaded && currentProvider.attributes.banned;
    const isProviderDeleted = isProviderLoaded && currentProvider.attributes.deleted;

    const hasDefaultPaymentMethod =
      currentUser &&
      ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
      ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id;

    //console.log('in transactionpanel, default paymentmehtod = ' + hasDefaultPaymentMethod);
    //showBookingPanel: isCustomer && !isProviderBanned && hasCorrectNextTransition,
    const stateDataFn = tx => {
      if (txIsEnquired(tx)  && hasDefaultPaymentMethod ) {
        const transitions = Array.isArray(nextTransitions)
          ? nextTransitions.map(transition => {
            return transition.attributes.name;
          })
          : [];
        const hasCorrectNextTransition =
          transitions.length > 0 && transitions.includes(TRANSITION_NEW_BOOKING_REQUEST_AFTER_ENQUIRY);
        return {
          headingState: HEADING_ENQUIRED,
          showBookingPanel: false,
          checkForDefaultPayment: true,
          hideBreakdown: true,
        };
      } else if (txIsHireRequested(tx)) {
        return {
          headingState: HEADING_HIRED,
          //showDetailCardHeadings: isCustomer,
          isHireRequest: true,
          showSaleButtons: isProvider && !isCustomerBanned,
          checkForDefaultPayment: true,
        }
      } else if (txIsRequested(tx)) {
        return {
          headingState: HEADING_REQUESTED,
          //showDetailCardHeadings: isCustomer,
          isHireRequest: false,
          showSaleButtons: isProvider && !isCustomerBanned,
          checkForDefaultPayment: true,
        };
      } else if (txIsAccepted(tx)) {
        return {
          headingState: HEADING_ACCEPTED,
          //showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          checkForDefaultPayment: true,
        };
      } else if (txIsDisableCancel(tx)) {
        return {
          headingState: HEADING_ACCEPTED_NO_CANCEL,
          //showDetailCardHeadings: isCustomer,
          showPayoutButtons: isCustomer,
          checkForDefaultPayment: true,
        };
      } else if (txIsDeclined(tx)) {
        return {
          headingState: HEADING_DECLINED,
          //showDetailCardHeadings: isCustomer,
        };
      } else if (txIsCanceled(tx)) {
        return {
          headingState: HEADING_CANCELED,
          //showDetailCardHeadings: isCustomer,
        };
      } else if (txHasBeenDelivered(tx)) {
        return {
          headingState: HEADING_DELIVERED,
          //showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          showPayoutButtons: false
        };
      } else {
        return { headingState: 'unknown' };
      }
    };
    const stateData = stateDataFn(currentTransaction);
    //console.log('STATE DATA = ' + JSON.stringify(stateData));

    const deletedListingTitle = intl.formatMessage({
      id: 'TransactionPanel.deletedListingTitle',
    });

    const {
      authorDisplayName,
      customerDisplayName,
      otherUserDisplayName,
      otherUserDisplayNameString,
    } = displayNames(currentUser, currentProvider, currentCustomer, intl);

    //console.log('Current listing attributes = ' + JSON.stringify(currentListing.attributes));

    const { publicData, geolocation } = currentListing.attributes;
    const location = publicData && publicData.location ? publicData.location : {};
    const listingTitle = currentListing.attributes.deleted
      ? deletedListingTitle
      : currentListing.attributes.title;

    // const {serviceType} = publicData || {};
    // const {contract} = getServiceType(serviceType) || {};

    // const {profile} = currentUser.attributes || {};
    // const {privateData} = profile || {};

    // console.log('privateData = ' + JSON.stringify(privateData));
    // const contractData = privateData[listingTitle];
    // const {contractName} = contractData || {};

    // const tempName = contractName ? contractName.toString().trim().toLowerCase(): '';
    // const normalizedContractName = listingTitle.toString().trim().toLowerCase();

    // const signed = tempName === normalizedContractName;
    // this.setState({contractSignedForServiceType: signed});
    // console.log('contractName =  ' + tempName);
    // console.log('selected service label = ' + normalizedContractName);
    // console.log('signed = ' + signed);
    // console.log('bookingstate.contractSignedForServiceType = ' + this.state.contractSignedForServiceType);
    // console.log('bookingstate.typedContractSignature = ' + this.state.typedContractSignature);

    let pubIp = '';
    publicIp.v4() .then(response => {
      //console.log('*********** response for IP = ' + response);
      pubIp = response;
    })
      .catch(e => {
        console.log('*********** error for IP = ' + e);
      });
    const params = {
      [ listingTitle] : {
        typedContractSignature: this.state.typedContractSignature,
        contractName: listingTitle,
        signatureDate: new Date().getTime(),
        clientIp: pubIp,
      }
    }

    const unitType = config.bookingUnitType;
    const isNightly = unitType === LINE_ITEM_NIGHT;
    const isDaily = unitType === LINE_ITEM_DAY;

    const unitTranslationKey = isNightly
      ? 'TransactionPanel.perNight'
      : isDaily
      ? 'TransactionPanel.perDay'
      : 'TransactionPanel.perUnit';

    const price = currentListing.attributes.price;
    const bookingSubTitle = price
      ? `${formatMoney(intl, price)} ${intl.formatMessage({ id: unitTranslationKey })}`
      : '';

    const firstImage =
      currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

    const saleButtons = (
      <SaleActionButtonsMaybe
        showButtons={stateData.showSaleButtons}
        isHireRequest={stateData.isHireRequest}
        acceptInProgress={acceptInProgress}
        declineInProgress={declineInProgress}
        acceptSaleError={acceptSaleError}
        declineSaleError={declineSaleError}
        onAcceptSale={() => onAcceptSale(params, bookingTransactions, stateData.isHireRequest)}
        onDeclineSale={() => onDeclineSale(bookingTransactions, stateData.isHireRequest)}
      />
    );

    const payoutButtons = (

      <PayoutActionButtons
        showButtons={stateData.showPayoutButtons}
        disablePayout={isCustomer && !hasDefaultPaymentMethod}
        onPayout={() => onPayout(bookingTransactions)}
        onDispute={() => onDispute(bookingTransactions)}
        payoutInProgress={payoutInProgress}
        disputeInProgress={disputeInProgress}
        payoutError={payoutError}
        disputeError={disputeError}
      />
    );

    const showSendMessageForm =
      !isCustomerBanned && !isCustomerDeleted && !isProviderBanned && !isProviderDeleted;

    const sendMessagePlaceholder = intl.formatMessage(
      { id: 'TransactionPanel.sendMessagePlaceholder' },
      { name: otherUserDisplayNameString }
    );

    const sendingMessageNotAllowed = intl.formatMessage({
      id: 'TransactionPanel.sendingMessageNotAllowed',
    });

    const paymentMethodsPageLink = (
      <NamedLink name="PaymentMethodsPage">
        <FormattedMessage id="TransactionPanel.paymentMethodsPageLink" />
      </NamedLink>
    );

    const handleTypedSignature = (event) => {
      console.log('Do I get here???? ' + event.target.value);
      console.log('event ' + event);
      console.log('event.target ' + event.target.value);

      this.setState({typedContractSignature: event.target.value})


    };

    const classes = classNames(rootClassName || css.root, className);

    return (
      <div className={classes}>
        <div className={css.container}>
          <div className={css.txInfo}>
            {/*<DetailCardImage*/}
            {/*  rootClassName={css.imageWrapperMobile}*/}
            {/*  avatarWrapperClassName={css.avatarWrapperMobile}*/}
            {/*  listingTitle={listingTitle}*/}
            {/*  image={firstImage}*/}
            {/*  provider={currentProvider}*/}
            {/*  isCustomer={isCustomer}*/}
            {/*  listingId={currentListing.id && currentListing.id.uuid}*/}
            {/*  listingDeleted={listingDeleted}*/}
            {/*/>*/}
            {/*{isProvider ? (*/}
            {/*  <div className={css.avatarWrapperProviderDesktop}>*/}
            {/*    <AvatarLarge user={currentCustomer} className={css.avatarDesktop} />*/}
            {/*  </div>*/}
            {/*) : null}*/}

            <PanelHeading
              panelHeadingState={stateData.headingState}
              transactionRole={transactionRole}
              providerName={authorDisplayName}
              customerName={customerDisplayName}
              isCustomerBanned={isCustomerBanned}
              listingId={currentListing.id && currentListing.id.uuid}
              listingTitle={listingTitle}
              listingDeleted={listingDeleted}
            />

            <div className={css.bookingDetailsMobile}>
              <AddressLinkMaybe
                rootClassName={css.addressMobile}
                location={location}
                geolocation={geolocation}
                showAddress={stateData.showAddress}
              />
              <BreakdownMaybe transaction={currentTransaction} transactionRole={transactionRole} />
            </div>

            {savePaymentMethodFailed ? (
              <p className={css.genericError}>
                <FormattedMessage
                  id="TransactionPanel.savePaymentMethodFailed"
                  values={{ paymentMethodsPageLink }}
                />
              </p>
            ) : null}
            <FeedSection
              rootClassName={css.feedContainer}
              currentTransaction={currentTransaction}
              currentUser={currentUser}
              fetchMessagesError={fetchMessagesError}
              fetchMessagesInProgress={fetchMessagesInProgress}
              initialMessageFailed={initialMessageFailed}
              messages={messages}
              oldestMessagePageFetched={oldestMessagePageFetched}
              onOpenReviewModal={this.onOpenReviewModal}
              onShowMoreMessages={() => onShowMoreMessages(currentTransaction.id)}
              totalMessagePages={totalMessagePages}
            />

            <div className={css.sendForm}>
            {showSendMessageForm ? (
              <SendMessageForm
                formId={this.sendMessageFormName}
                rootClassName={css.sendMessageForm}
                messagePlaceholder={sendMessagePlaceholder}
                inProgress={sendMessageInProgress}
                sendMessageError={sendMessageError}
                onFocus={this.onSendMessageFormFocus}
                onBlur={this.onSendMessageFormBlur}
                onSubmit={this.onMessageSubmit}
                handleClose={handleCloseMessage}
              />
            ) : (
              <div className={css.sendingMessageNotAllowed}>{sendingMessageNotAllowed}</div>
            )}
            </div>

            {stateData.showSaleButtons ? (
              <div className={css.mobileActionButtons}>{saleButtons}</div>
            ) : null}

            {stateData.showPayoutButtons ? (
              <div className={css.mobileActionButtons}>{payoutButtons}</div>
            ) : null}
          </div>

          {stateData.hideBreakdown ? null : <div className={css.asideDesktop}>
            <div className={css.detailCard}>
              {/*<DetailCardImage*/}
              {/*  avatarWrapperClassName={css.avatarWrapperDesktop}*/}
              {/*  listingTitle={listingTitle}*/}
              {/*  image={firstImage}*/}
              {/*  provider={currentProvider}*/}
              {/*  isCustomer={isCustomer}*/}
              {/*  listingId={currentListing.id && currentListing.id.uuid}*/}
              {/*  listingDeleted={listingDeleted}*/}
              {/*/>*/}

              <DetailCardHeadingsMaybe
                showDetailCardHeadings={stateData.showDetailCardHeadings}
                listingTitle={listingTitle}
                subTitle={bookingSubTitle}
                location={location}
                geolocation={geolocation}
                showAddress={stateData.showAddress}
              />
              {stateData.showBookingPanel ? (

                <BookingPanel
                  className={css.bookingPanel}
                  titleClassName={css.bookingTitle}
                  isOwnListing={false}
                  listing={currentListing}
                  title={listingTitle}
                  subTitle={bookingSubTitle}
                  authorDisplayName={authorDisplayName}
                  onSubmit={onSubmitBookingRequest}
                  onManageDisableScrolling={onManageDisableScrolling}
                  monthlyTimeSlots={monthlyTimeSlots}
                  onFetchTimeSlots={onFetchTimeSlots}
                />
              ) : null }

              {!listingTitle.includes('Deleted') ?
              <div className={css.breakdownTitle}>{listingTitle} Booking Breakdown</div>
                : null}

              <BreakdownMaybe
                className={css.breakdownContainer}
                transaction={currentTransaction}
                bookingTransactions={bookingTransactions}
                transactionRole={transactionRole}
                isFlatRate={isFlatRate}
              />

              {/*{tempName === normalizedContractName ? (*/}
              {/*  <div className={css.alreadySignedDisclaimer}>**You have previously signed that you*/}
              {/*    have read, understood, and agree to the*/}
              {/*    <a*/}
              {/*      href={contract ? contract() : null}*/}
              {/*      download={"NU_" + contractName + "_Contract"}> {contractName} Contract.</a>*/}
              {/*  </div>*/}
              {/*) : (*/}

              {/*  stateData.headingState === "requested" ? (*/}
              {/*  <div className={css.contractDiv}>*/}
              {/*    <div>*/}
              {/*      <input className={css.signatureTextBox} type="text" id="contractSignature"*/}
              {/*             name="contractSignature" label="Typed Signature" placeholder="Typed Signature" onBlur={handleTypedSignature}*/}
              {/*      />*/}
              {/*    </div>*/}
              {/*    <div className={css.signatureDisclaimer}>By typing your name in the above text field, you*/}
              {/*      are electronically signing that you*/}
              {/*      have read, understood, and agree to the*/}
              {/*      <a*/}
              {/*        href={contract ? contract() : null}*/}
              {/*        download={"NU_" + contractName + "_Contract"}> {contractName} Contract.</a>*/}
              {/*    </div>*/}
              {/*  </div> ) : null*/}
              {/*)*/}
              {/*}*/}

              {isCustomer && stateData.checkForDefaultPayment && !hasDefaultPaymentMethod ? (
                <div className={css.defaultPaymentErrorDiv}>
                <span className={css.defaultPaymentErrorText}>You must add a default payment method in order to request this booking.
                  <NamedLink name="PaymentMethodsPage" className={css.paymentLink}>Add a Payment Method </NamedLink>
                </span>
                </div>) : null
              }


              {stateData.showSaleButtons ? (
                <div className={css.desktopActionButtons}>{saleButtons}</div>
              ) : null}

              {stateData.showPayoutButtons ? (
                <div className={css.desktopActionButtons}>{payoutButtons}</div>
              ) : null}


            </div>
          </div>}
        </div>

        <ModalInMobile
          id="breakdownModal"
          isModalOpenOnMobile={this.state.isBreakdownModalOpen}
          onClose={this.onOpenBreakdownModal}
          showAsModalMaxWidth={true}
          onManageDisableScrolling={onManageDisableScrolling}
        >
          <BreakdownMaybe
            className={css.breakdownContainer}
            transaction={currentTransaction}
            bookingTransactions={bookingTransactions}
            transactionRole={transactionRole}
          />
        </ModalInMobile>

        <ReviewModal
          id="ReviewOrderModal"
          isOpen={this.state.isReviewModalOpen}
          onCloseModal={() => this.setState({ isReviewModalOpen: false })}
          onManageDisableScrolling={onManageDisableScrolling}
          onSubmitReview={this.onSubmitReview}
          revieweeName={otherUserDisplayName}
          reviewSent={this.state.reviewSubmitted}
          sendReviewInProgress={sendReviewInProgress}
          sendReviewError={sendReviewError}
        />
      </div>
    );
  }
}

TransactionPanelComponent.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  acceptSaleError: null,
  declineSaleError: null,
  payoutError: null,
  disputeError: null,
  fetchMessagesError: null,
  initialMessageFailed: false,
  savePaymentMethodFailed: false,
  sendMessageError: null,
  sendReviewError: null,
  monthlyTimeSlots: null,
  nextTransitions: null,
  handleCloseMessage: null,
};
const mapDispatchToProps = dispatch => ({
  onUpdateUserProfile: params => dispatch(updateMetadata(params)),
})

TransactionPanelComponent.propTypes = {
  rootClassName: string,
  className: string,

  currentUser: propTypes.currentUser,
  transaction: propTypes.transaction.isRequired,
  bookingTransactions: arrayOf(object).isRequired,
  totalMessagePages: number.isRequired,
  oldestMessagePageFetched: number.isRequired,
  messages: arrayOf(propTypes.message).isRequired,
  initialMessageFailed: bool,
  savePaymentMethodFailed: bool,
  fetchMessagesInProgress: bool.isRequired,
  fetchMessagesError: propTypes.error,
  sendMessageInProgress: bool.isRequired,
  sendMessageError: propTypes.error,
  sendReviewInProgress: bool.isRequired,
  sendReviewError: propTypes.error,
  onFetchTimeSlots: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onShowMoreMessages: func.isRequired,
  onSendMessage: func.isRequired,
  onSendReview: func.isRequired,
  onSubmitBookingRequest: func.isRequired,
  monthlyTimeSlots: object,
  nextTransitions: array,

  // Sale related props
  onAcceptSale: func.isRequired,
  onDeclineSale: func.isRequired,
  acceptInProgress: bool.isRequired,
  declineInProgress: bool.isRequired,
  acceptSaleError: propTypes.error,
  declineSaleError: propTypes.error,

  // Payout and Dispute props
  payoutError: propTypes.error,
  disputeError: propTypes.error,
  payoutInProgress: bool.isRequired,
  disputeInProgress: bool.isRequired,
  onPayout: func.isRequired,
  onDispute: func.isRequired,

  // from injectIntl
  intl: intlShape,

  handleCloseMessage: func,
};

const TransactionPanel = injectIntl(TransactionPanelComponent);

export default TransactionPanel;
