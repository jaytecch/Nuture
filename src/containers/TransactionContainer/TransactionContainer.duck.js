import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import config from '../../config';
import { types as sdkTypes } from '../../util/sdkLoader';
import { isTransactionsTransitionInvalidTransition, storableError } from '../../util/errors';
import {
  txIsEnquired,
  TRANSITION_ACCEPT,
  TRANSITION_DECLINE,
  TRANSITION_REVIEW,
  TRANSITION_COMPLETE,
  TRANSITION_ACCEPT_HIRE_CONFIRM,
  TRANSITION_DECLINE_HIRE_CONFIRM,
} from '../../util/transaction';
import * as log from '../../util/log';
import {
  updatedEntities,
  denormalisedEntities,
  denormalisedResponseEntities,
} from '../../util/data';
import { findNextBoundary, nextMonthFn, monthIdStringInTimeZone } from '../../util/dates';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUserNotifications } from '../../ducks/user.duck';

const { UUID } = sdkTypes;

const MESSAGES_PAGE_SIZE = 100;
const CUSTOMER = 'customer';

// ================ Action types ================ //

export const SET_INITAL_VALUES = 'app/TransactionContainer/SET_INITIAL_VALUES';

export const FETCH_TRANSACTION_REQUEST = 'app/TransactionContainer/FETCH_TRANSACTION_REQUEST';
export const FETCH_TRANSACTION_SUCCESS = 'app/TransactionContainer/FETCH_TRANSACTION_SUCCESS';
export const FETCH_TRANSACTION_ERROR = 'app/TransactionContainer/FETCH_TRANSACTION_ERROR';

export const FETCH_TRANSITIONS_REQUEST = 'app/TransactionContainer/FETCH_TRANSITIONS_REQUEST';
export const FETCH_TRANSITIONS_SUCCESS = 'app/TransactionContainer/FETCH_TRANSITIONS_SUCCESS';
export const FETCH_TRANSITIONS_ERROR = 'app/TransactionContainer/FETCH_TRANSITIONS_ERROR';

export const ACCEPT_SALE_REQUEST = 'app/TransactionContainer/ACCEPT_SALE_REQUEST';
export const ACCEPT_SALE_SUCCESS = 'app/TransactionContainer/ACCEPT_SALE_SUCCESS';
export const ACCEPT_SALE_ERROR = 'app/TransactionContainer/ACCEPT_SALE_ERROR';

export const DECLINE_SALE_REQUEST = 'app/TransactionContainer/DECLINE_SALE_REQUEST';
export const DECLINE_SALE_SUCCESS = 'app/TransactionContainer/DECLINE_SALE_SUCCESS';
export const DECLINE_SALE_ERROR = 'app/TransactionContainer/DECLINE_SALE_ERROR';

export const PAYOUT_REQUEST = 'app/TransactionContainer/PAYOUT_REQUEST';
export const PAYOUT_SUCCESS = 'app/TransactionContainer/PAYOUT_SUCCESS';
export const PAYOUT_ERROR = 'app/TransactionContainer/PAYOUT_ERROR';

export const DISPUTE_REQUEST = 'app/TransactionContainer/DISPUTE_REQUEST';
export const DISPUTE_SUCCESS = 'app/TransactionContainer/DISPUTE_SUCCESS';
export const DISPUTE_ERROR = 'app/TransactionContainer/DISPUTE_ERROR';

export const FETCH_MESSAGES_REQUEST = 'app/TransactionContainer/FETCH_MESSAGES_REQUEST';
export const FETCH_MESSAGES_SUCCESS = 'app/TransactionContainer/FETCH_MESSAGES_SUCCESS';
export const FETCH_MESSAGES_ERROR = 'app/TransactionContainer/FETCH_MESSAGES_ERROR';

export const SEND_MESSAGE_REQUEST = 'app/TransactionContainer/SEND_MESSAGE_REQUEST';
export const SEND_MESSAGE_SUCCESS = 'app/TransactionContainer/SEND_MESSAGE_SUCCESS';
export const SEND_MESSAGE_ERROR = 'app/TransactionContainer/SEND_MESSAGE_ERROR';

export const SEND_REVIEW_REQUEST = 'app/TransactionContainer/SEND_REVIEW_REQUEST';
export const SEND_REVIEW_SUCCESS = 'app/TransactionContainer/SEND_REVIEW_SUCCESS';
export const SEND_REVIEW_ERROR = 'app/TransactionContainer/SEND_REVIEW_ERROR';

export const FETCH_TIME_SLOTS_REQUEST = 'app/TransactionContainer/FETCH_TIME_SLOTS_REQUEST';
export const FETCH_TIME_SLOTS_SUCCESS = 'app/TransactionContainer/FETCH_TIME_SLOTS_SUCCESS';
export const FETCH_TIME_SLOTS_ERROR = 'app/TransactionContainer/FETCH_TIME_SLOTS_ERROR';

// ================ Reducer ================ //

const initialState = {
  fetchTransactionInProgress: false,
  fetchTransactionError: null,
  transactionRef: null,
  acceptInProgress: false,
  acceptSaleError: null,
  declineInProgress: false,
  declineSaleError: null,
  payoutInProgress: false,
  payoutError: null,
  disputeInProgress: false,
  disputeError: null,
  fetchMessagesInProgress: false,
  fetchMessagesError: null,
  totalMessages: 0,
  totalMessagePages: 0,
  oldestMessagePageFetched: 0,
  messages: [],
  initialMessageFailedToTransaction: null,
  savePaymentMethodFailed: false,
  sendMessageInProgress: false,
  sendMessageError: null,
  sendReviewInProgress: false,
  sendReviewError: null,
  monthlyTimeSlots: {
    // '2019-12': {
    //   timeSlots: [],
    //   fetchTimeSlotsError: null,
    //   fetchTimeSlotsInProgress: null,
    // },
  },
  fetchTransitionsInProgress: false,
  fetchTransitionsError: null,
  processTransitions: null,
  bookingRefs: [],
};

// Merge entity arrays using ids, so that conflicting items in newer array (b) overwrite old values (a).
// const a = [{ id: { uuid: 1 } }, { id: { uuid: 3 } }];
// const b = [{ id: : { uuid: 2 } }, { id: : { uuid: 1 } }];
// mergeEntityArrays(a, b)
// => [{ id: { uuid: 3 } }, { id: : { uuid: 2 } }, { id: : { uuid: 1 } }]
const mergeEntityArrays = (a, b) => {
  return a.filter(aEntity => !b.find(bEntity => aEntity.id.uuid === bEntity.id.uuid)).concat(b);
};

export default function checkoutPageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_INITAL_VALUES:
      return { ...initialState, ...payload };

    case FETCH_TRANSACTION_REQUEST:
      return { ...state, fetchTransactionInProgress: true, fetchTransactionError: null };
    case FETCH_TRANSACTION_SUCCESS: {
      const transactionRef = { id: payload.data.data.id, type: 'transaction' };
      const refs = [...state.bookingRefs, transactionRef].sort();
      return state.transactionRef === null ?
        { ...state, fetchTransactionInProgress: false, transactionRef, bookingRefs: refs }
        :  { ...state, fetchTransactionInProgress: false, bookingRefs: refs };
    }
    case FETCH_TRANSACTION_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, fetchTransactionInProgress: false, fetchTransactionError: payload };

    case FETCH_TRANSITIONS_REQUEST:
      return { ...state, fetchTransitionsInProgress: true, fetchTransitionsError: null };
    case FETCH_TRANSITIONS_SUCCESS:
      return { ...state, fetchTransitionsInProgress: false, processTransitions: payload };
    case FETCH_TRANSITIONS_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, fetchTransitionsInProgress: false, fetchTransitionsError: payload };

    case ACCEPT_SALE_REQUEST:
      return { ...state, acceptInProgress: true, acceptSaleError: null, declineSaleError: null };
    case ACCEPT_SALE_SUCCESS:
      return { ...state, acceptInProgress: false };
    case ACCEPT_SALE_ERROR:
      return { ...state, acceptInProgress: false, acceptSaleError: payload };

    case DECLINE_SALE_REQUEST:
      return { ...state, declineInProgress: true, declineSaleError: null, acceptSaleError: null };
    case DECLINE_SALE_SUCCESS:
      return { ...state, declineInProgress: false };
    case DECLINE_SALE_ERROR:
      return { ...state, declineInProgress: false, declineSaleError: payload };

    case PAYOUT_REQUEST:
      return { ...state, payoutInProgress: true, payoutError: null, disputeError: null};
    case PAYOUT_SUCCESS:
      return { ...state, payoutInProgress: false};
    case PAYOUT_ERROR:
      return { ...state, payoutInProgress: false, payoutError: payload};

    case DISPUTE_REQUEST:
      return { ...state, disputeInProgress: true, disputeError: null, payoutError: null};
    case DISPUTE_SUCCESS:
      return { ...state, disputeInProgress: false};
    case DISPUTE_ERROR:
      return { ...state, disputeInProgress: false, disputeError: payload};

    case FETCH_MESSAGES_REQUEST:
      return { ...state, fetchMessagesInProgress: true, fetchMessagesError: null };
    case FETCH_MESSAGES_SUCCESS: {
      const oldestMessagePageFetched =
        state.oldestMessagePageFetched > payload.page
          ? state.oldestMessagePageFetched
          : payload.page;
      return {
        ...state,
        fetchMessagesInProgress: false,
        messages: mergeEntityArrays(state.messages, payload.messages),
        totalMessages: payload.totalItems,
        totalMessagePages: payload.totalPages,
        oldestMessagePageFetched,
      };
    }
    case FETCH_MESSAGES_ERROR:
      return { ...state, fetchMessagesInProgress: false, fetchMessagesError: payload };

    case SEND_MESSAGE_REQUEST:
      return {
        ...state,
        sendMessageInProgress: true,
        sendMessageError: null,
        initialMessageFailedToTransaction: null,
      };
    case SEND_MESSAGE_SUCCESS:
      return { ...state, sendMessageInProgress: false };
    case SEND_MESSAGE_ERROR:
      return { ...state, sendMessageInProgress: false, sendMessageError: payload };

    case SEND_REVIEW_REQUEST:
      return { ...state, sendReviewInProgress: true, sendReviewError: null };
    case SEND_REVIEW_SUCCESS:
      return { ...state, sendReviewInProgress: false };
    case SEND_REVIEW_ERROR:
      return { ...state, sendReviewInProgress: false, sendReviewError: payload };

    case FETCH_TIME_SLOTS_REQUEST: {
      const monthlyTimeSlots = {
        ...state.monthlyTimeSlots,
        [payload]: {
          ...state.monthlyTimeSlots[payload],
          fetchTimeSlotsError: null,
          fetchTimeSlotsInProgress: true,
        },
      };
      return { ...state, monthlyTimeSlots };
    }
    case FETCH_TIME_SLOTS_SUCCESS: {
      const monthId = payload.monthId;
      const monthlyTimeSlots = {
        ...state.monthlyTimeSlots,
        [monthId]: {
          ...state.monthlyTimeSlots[monthId],
          fetchTimeSlotsInProgress: false,
          timeSlots: payload.timeSlots,
        },
      };
      return { ...state, monthlyTimeSlots };
    }
    case FETCH_TIME_SLOTS_ERROR: {
      const monthId = payload.monthId;
      const monthlyTimeSlots = {
        ...state.monthlyTimeSlots,
        [monthId]: {
          ...state.monthlyTimeSlots[monthId],
          fetchTimeSlotsInProgress: false,
          fetchTimeSlotsError: payload.error,
        },
      };
      return { ...state, monthlyTimeSlots };
    }

    default:
      return state;
  }
}

// ================ Selectors ================ //

export const acceptOrDeclineInProgress = state => {
  return state.TransactionContainer.acceptInProgress || state.TransactionContainer.declineInProgress;
};

export const payoutOrDisputeInProgress = state => {
  return state.TransactionContainer.payoutInProgress || state.TransactionContainer.disputeInProgress;
};

// ================ Action creators ================ //
export const setInitialValues = initialValues => ({
  type: SET_INITAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

const fetchTransactionRequest = () => ({ type: FETCH_TRANSACTION_REQUEST });
const fetchTransactionSuccess = response => ({
  type: FETCH_TRANSACTION_SUCCESS,
  payload: response,
});
const fetchTransactionError = e => ({ type: FETCH_TRANSACTION_ERROR, error: true, payload: e });

const fetchTransitionsRequest = () => ({ type: FETCH_TRANSITIONS_REQUEST });
const fetchTransitionsSuccess = response => ({
  type: FETCH_TRANSITIONS_SUCCESS,
  payload: response,
});
const fetchTransitionsError = e => ({ type: FETCH_TRANSITIONS_ERROR, error: true, payload: e });

const acceptSaleRequest = () => ({ type: ACCEPT_SALE_REQUEST });
const acceptSaleSuccess = () => ({ type: ACCEPT_SALE_SUCCESS });
const acceptSaleError = e => ({ type: ACCEPT_SALE_ERROR, error: true, payload: e });

const declineSaleRequest = () => ({ type: DECLINE_SALE_REQUEST });
const declineSaleSuccess = () => ({ type: DECLINE_SALE_SUCCESS });
const declineSaleError = e => ({ type: DECLINE_SALE_ERROR, error: true, payload: e });

const payoutRequest = () => ({type: PAYOUT_REQUEST});
const payoutSuccess = () => ({type: PAYOUT_SUCCESS});
const payoutError = e => ({type: PAYOUT_ERROR, error: true, payload: e});

const disputeRequest = () => ({type: DISPUTE_REQUEST});
const disputeSuccess = () => ({type: DISPUTE_SUCCESS});
const disputeError = e => ({type: DISPUTE_ERROR, error: true, payload: e});

const fetchMessagesRequest = () => ({ type: FETCH_MESSAGES_REQUEST });
const fetchMessagesSuccess = (messages, pagination) => ({
  type: FETCH_MESSAGES_SUCCESS,
  payload: { messages, ...pagination },
});
const fetchMessagesError = e => ({ type: FETCH_MESSAGES_ERROR, error: true, payload: e });

const sendMessageRequest = () => ({ type: SEND_MESSAGE_REQUEST });
const sendMessageSuccess = () => ({ type: SEND_MESSAGE_SUCCESS });
const sendMessageError = e => ({ type: SEND_MESSAGE_ERROR, error: true, payload: e });

const sendReviewRequest = () => ({ type: SEND_REVIEW_REQUEST });
const sendReviewSuccess = () => ({ type: SEND_REVIEW_SUCCESS });
const sendReviewError = e => ({ type: SEND_REVIEW_ERROR, error: true, payload: e });

export const fetchTimeSlotsRequest = monthId => ({
  type: FETCH_TIME_SLOTS_REQUEST,
  payload: monthId,
});
export const fetchTimeSlotsSuccess = (monthId, timeSlots) => ({
  type: FETCH_TIME_SLOTS_SUCCESS,
  payload: { timeSlots, monthId },
});
export const fetchTimeSlotsError = (monthId, error) => ({
  type: FETCH_TIME_SLOTS_ERROR,
  error: true,
  payload: { monthId, error },
});

// ================ Thunks ================ //

const timeSlotsRequest = params => (dispatch, getState, sdk) => {
  return sdk.timeslots.query(params).then(response => {
    return denormalisedResponseEntities(response);
  });
};

export const fetchTimeSlots = (listingId, start, end, timeZone) => (dispatch, getState, sdk) => {
  const monthId = monthIdStringInTimeZone(start, timeZone);

  dispatch(fetchTimeSlotsRequest(monthId));

  // The maximum pagination page size for timeSlots is 500
  const extraParams = {
    per_page: 500,
    page: 1,
  };

  return dispatch(timeSlotsRequest({ listingId, start, end, ...extraParams }))
    .then(timeSlots => {
      dispatch(fetchTimeSlotsSuccess(monthId, timeSlots));
    })
    .catch(e => {
      dispatch(fetchTimeSlotsError(monthId, storableError(e)));
    });
};

// Helper function for fetchTransaction call.
const fetchMonthlyTimeSlots = (dispatch, listing) => {
  const hasWindow = typeof window !== 'undefined';
  const attributes = listing.attributes;
  // Listing could be ownListing entity too, so we just check if attributes key exists
  const hasTimeZone =
    attributes && attributes.availabilityPlan && attributes.availabilityPlan.timezone;

  // Fetch time-zones on client side only.
  if (hasWindow && listing.id && hasTimeZone) {
    const tz = listing.attributes.availabilityPlan.timezone;
    const nextBoundary = findNextBoundary(tz, new Date());

    const nextMonth = nextMonthFn(nextBoundary, tz);
    const nextAfterNextMonth = nextMonthFn(nextMonth, tz);

    return Promise.all([
      dispatch(fetchTimeSlots(listing.id, nextBoundary, nextMonth, tz)),
      dispatch(fetchTimeSlots(listing.id, nextMonth, nextAfterNextMonth, tz)),
    ]);
  }

  // By default return an empty array
  return Promise.all([]);
};

const listingRelationship = txResponse => {
  return txResponse.data.data.relationships.listing.data;
};

const fetchBooking = (booking, txRole) => (dispatch, state, sdk) => {
  const promises = [];
  booking.forEach(txId => {
    promises.push(dispatch(fetchTransaction(txId, txRole)));
  })

  return promises;
}

export const fetchTransaction = (id, txRole) => (dispatch, getState, sdk) => {
  dispatch(fetchTransactionRequest());
  let txResponse = null;

  return sdk.transactions
    .show(
      {
        id,
        include: [
          'customer',
          'customer.profileImage',
          'provider',
          'provider.profileImage',
          'listing',
          'booking',
          'reviews',
          'reviews.author',
          'reviews.subject',
        ],
        ...IMAGE_VARIANTS,
      },
      { expand: true }
    )
    .then(response => {
      txResponse = response;
      const listingId = listingRelationship(response).id;
      const entities = updatedEntities({}, response.data);
      const listingRef = { id: listingId, type: 'listing' };
      const transactionRef = { id, type: 'transaction' };
      const denormalised = denormalisedEntities(entities, [listingRef, transactionRef]);
      const listing = denormalised[0];
      const transaction = denormalised[1];

      // Fetch time slots for transactions that are in enquired state
      const canFetchTimeslots =
        txRole === 'customer' &&
        config.enableAvailability &&
        transaction &&
        txIsEnquired(transaction);

      if (canFetchTimeslots) {
        fetchMonthlyTimeSlots(dispatch, listing);
      }

      const canFetchListing = listing && listing.attributes && !listing.attributes.deleted;
      if (canFetchListing) {
        return sdk.listings.show({
          id: listingId,
          include: ['author', 'author.profileImage', 'images'],
          ...IMAGE_VARIANTS,
        });
      } else {
        return response;
      }
    })
    .then(response => {
      dispatch(addMarketplaceEntities(txResponse));
      dispatch(addMarketplaceEntities(response));
      dispatch(fetchTransactionSuccess(txResponse));
      return response;
    })
    .catch(e => {
      dispatch(fetchTransactionError(storableError(e)));
      throw e;
    });
};

export const acceptSale = (params, bookingTransactions, isHire = false) => (dispatch, getState, sdk) => {
  if (acceptOrDeclineInProgress(getState())) {
    return Promise.reject(new Error('Accept or decline already in progress'));
  }
  dispatch(acceptSaleRequest());

  const transition = isHire ? TRANSITION_ACCEPT_HIRE_CONFIRM : TRANSITION_ACCEPT;

  const promises = [];
  bookingTransactions.forEach(tx => {
    promises.push(
      sdk.transactions.transition({ id: tx.id, transition: transition, params: {} }, { expand: true })
    );
  })

  return Promise.all(promises)
    .then(response => {
      response.forEach(resp => dispatch(addMarketplaceEntities(resp)))
      dispatch(acceptSaleSuccess());
      dispatch(fetchCurrentUserNotifications());
      dispatch(updateMetadata(params));
      return response;
    })
    .catch(e => {
      dispatch(acceptSaleError(storableError(e)));
      log.error(e, 'accept-sale-failed', {
        transition: transition,
      });
      throw e;
    });


};

export const declineSale = (bookingTransactions, isHire=false) => (dispatch, getState, sdk) => {
  if (acceptOrDeclineInProgress(getState())) {
    return Promise.reject(new Error('Accept or decline already in progress'));
  }
  dispatch(declineSaleRequest());

  const transition = isHire ? TRANSITION_DECLINE_HIRE_CONFIRM : TRANSITION_DECLINE;

  const promises = [];
  bookingTransactions.forEach(tx => {
    promises.push(sdk.transactions.transition({ id: tx.id, transition: transition, params: {} }, { expand: true }))
  })

  return Promise.all(promises)
    .then(response => {
      response.forEach(resp => dispatch(addMarketplaceEntities(resp)));
      dispatch(declineSaleSuccess());
      dispatch(fetchCurrentUserNotifications());
      return response;
    })
    .catch(e => {
      dispatch(declineSaleError(storableError(e)));
      log.error(e, 'reject-sale-failed', {
        transition: transition,
      });
      throw e;
    });
};

export const payout = bookingTransactions => (dispatch, getState, sdk) => {
  if(payoutOrDisputeInProgress(getState())) {
    return Promise.reject(new Error("Payout or dispute is already in progress"))
  }
  dispatch(payoutRequest());

  const promises = []
  bookingTransactions.forEach(tx => {
    promises.push(sdk.transactions
      .transition({id: tx.id, transition: TRANSITION_COMPLETE, params: {}}, {expand: true}))
  })

  return Promise.all(promises)
    .then(response => {
      dispatch(payoutSuccess())
      dispatch(fetchCurrentUserNotifications())
      return response;
    })
    .catch(e => {
      dispatch(payoutError(storableError(e)));
      log.error(e, "payout-failed", {
        transition: TRANSITION_COMPLETE,
      });
      throw e;
    });
}

export const dispute = id => (dispatch, getState, sdk) => {
  if(payoutOrDisputeInProgress(getState())) {
    return Promise.reject(new Error("Payout or dispute is already in progress"))
  }
  dispatch(disputeRequest());
  console.log("User clicked dispute");
  dispatch(disputeSuccess());

}

const fetchMessages = (txId, page) => (dispatch, getState, sdk) => {
  const paging = { page, per_page: MESSAGES_PAGE_SIZE };
  dispatch(fetchMessagesRequest());

  return sdk.messages
    .query({
      transaction_id: txId,
      include: ['sender', 'sender.profileImage'],
      ...IMAGE_VARIANTS,
      ...paging,
    })
    .then(response => {
      const messages = denormalisedResponseEntities(response);
      const { totalItems, totalPages, page: fetchedPage } = response.data.meta;
      const pagination = { totalItems, totalPages, page: fetchedPage };
      const totalMessages = getState().TransactionContainer.totalMessages;

      // Original fetchMessages call succeeded
      dispatch(fetchMessagesSuccess(messages, pagination));

      // Check if totalItems has changed between fetched pagination pages
      // if totalItems has changed, fetch first page again to include new incoming messages.
      // TODO if there're more than 100 incoming messages,
      // this should loop through most recent pages instead of fetching just the first one.
      if (totalItems > totalMessages && page > 1) {
        dispatch(fetchMessages(txId, 1))
          .then(() => {
            // Original fetch was enough as a response for user action,
            // this just includes new incoming messages
          })
          .catch(() => {
            // Background update, no need to to do anything atm.
          });
      }
    })
    .catch(e => {
      dispatch(fetchMessagesError(storableError(e)));
      throw e;
    });
};

export const fetchMoreMessages = txId => (dispatch, getState, sdk) => {
  const state = getState();
  const { oldestMessagePageFetched, totalMessagePages } = state.TransactionContainer;
  const hasMoreOldMessages = totalMessagePages > oldestMessagePageFetched;

  // In case there're no more old pages left we default to fetching the current cursor position
  const nextPage = hasMoreOldMessages ? oldestMessagePageFetched + 1 : oldestMessagePageFetched;

  return dispatch(fetchMessages(txId, nextPage));
};

export const sendMessage = (txId, message) => (dispatch, getState, sdk) => {
  dispatch(sendMessageRequest());

  return sdk.messages
    .send({ transactionId: txId, content: message })
    .then(response => {
      const messageId = response.data.data.id;

      // We fetch the first page again to add sent message to the page data
      // and update possible incoming messages too.
      // TODO if there're more than 100 incoming messages,
      // this should loop through most recent pages instead of fetching just the first one.
      return dispatch(fetchMessages(txId, 1))
        .then(() => {
          dispatch(sendMessageSuccess());
          return messageId;
        })
        .catch(() => dispatch(sendMessageSuccess()));
    })
    .catch(e => {
      dispatch(sendMessageError(storableError(e)));
      // Rethrow so the page can track whether the sending failed, and
      // keep the message in the form for a retry.
      throw e;
    });
};

const REVIEW_TX_INCLUDES = ['reviews', 'reviews.author', 'reviews.subject'];
const IMAGE_VARIANTS = {
  'fields.image': [
    // Profile images
    'variants.square-small',
    'variants.square-small2x',

    // Listing images:
    'variants.landscape-crop',
    'variants.landscape-crop2x',
  ],
};

export const sendReview = (role, tx, reviewRating, reviewContent) => (dispatch, getState, sdk) => {
  const params = { reviewRating, reviewContent };
  const {id} = tx;
  const include = REVIEW_TX_INCLUDES;

  dispatch(sendReviewRequest());

  return sdk.transactions
    .transition({ id, transition: TRANSITION_REVIEW, params }, { expand: true, include, ...IMAGE_VARIANTS })
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(sendReviewSuccess());
      return response;
    })
    .catch(e => {
      dispatch(sendReviewError(storableError(e)));
      throw e;
    });
};

const isNonEmpty = value => {
  return typeof value === 'object' || Array.isArray(value) ? !isEmpty(value) : !!value;
};

export const fetchNextTransitions = id => (dispatch, getState, sdk) => {
  dispatch(fetchTransitionsRequest());

  return sdk.processTransitions
    .query({ transactionId: id })
    .then(res => {
      dispatch(fetchTransitionsSuccess(res.data.data));
    })
    .catch(e => {
      dispatch(fetchTransitionsError(storableError(e)));
    });
};

// loadData is a collection of async calls that need to be made
// before page has all the info it needs to render itself
export const loadData = params => (dispatch, getState) => {
  const booking = params.booking;
  const txId = booking[0];
  const state = getState().TransactionContainer;
  const txRef = state.transactionRef;
  const txRole = params.transactionRole;

  // In case a transaction reference is found from a previous
  // data load -> clear the state. Otherwise keep the non-null
  // and non-empty values which may have been set from a previous page.
  const initialValues = txRef ? {} : pickBy(state, isNonEmpty);
  dispatch(setInitialValues(initialValues));

  // Sale / order (i.e. transaction entity in API)
  return Promise.all([
    dispatch(fetchBooking(booking, txRole)),
    dispatch(fetchMessages(txId, 1)),
    dispatch(fetchNextTransitions(txId)),
  ]);
};

export const updateMetadata = params => (dispatch, getState, sdk) => {

  console.log('in update ' + params);
  return sdk.currentUser
    .updateProfile({privateData: params})
    .then(response => {console.log('Response :' + response)});

};
