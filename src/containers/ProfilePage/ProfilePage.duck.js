import {addMarketplaceEntities, getListingsById} from '../../ducks/marketplaceData.duck';
import {fetchCurrentUser, fetchCurrentUserHasOrdersSuccess} from '../../ducks/user.duck';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import {
  TRANSITION_ENQUIRE,
  TRANSITION_NEW_BOOKING_REQUEST,
} from "../../util/transaction";
import config from "../../config";
import moment from 'moment';
import * as log from "../../util/log";
import {initiatePrivileged} from '../../util/api';

// Update calendar data of given month
// '2018-12': {
//   fetchTimeSlotsInProgress: false,
//   timeslots: payload.timeslots,
//   fetchTimeSlotsError: payload.error,
// },
const updateCalendarMonth = (state, entities) => {
  // Ensure that every month has array
  const {timeslots} = entities;
  const defaultMonthData = {timeslots: []}

  let data = {};
  timeslots.forEach(entity => {
    const monthId = moment(entity.attributes.start).format("YYYY-MM");
    const oldData = state.availabilityCalendar[monthId] || defaultMonthData;
    data[monthId] = {
      ...oldData,
      timeslots: [...oldData.timeslots, entity]
    }
  })

  return {
    ...state,
    availabilityCalendar: {
      ...state.availabilityCalendar,
      ...data,
    },
  };
};

// ================ Action types ================ //

export const SET_INITIAL_STATE = 'app/ProfilePage/SET_INITIAL_STATE';

export const SHOW_USER_REQUEST = 'app/ProfilePage/SHOW_USER_REQUEST';
export const SHOW_USER_SUCCESS = 'app/ProfilePage/SHOW_USER_SUCCESS';
export const SHOW_USER_ERROR = 'app/ProfilePage/SHOW_USER_ERROR';

export const QUERY_LISTINGS_REQUEST = 'app/ProfilePage/QUERY_LISTINGS_REQUEST';
export const QUERY_LISTINGS_SUCCESS = 'app/ProfilePage/QUERY_LISTINGS_SUCCESS';
export const QUERY_LISTINGS_ERROR = 'app/ProfilePage/QUERY_LISTINGS_ERROR';

export const QUERY_REVIEWS_REQUEST = 'app/ProfilePage/QUERY_REVIEWS_REQUEST';
export const QUERY_REVIEWS_SUCCESS = 'app/ProfilePage/QUERY_REVIEWS_SUCCESS';
export const QUERY_REVIEWS_ERROR = 'app/ProfilePage/QUERY_REVIEWS_ERROR';

export const SEND_ENQUIRY_REQUEST = 'app/ProfilePage/SEND_ENQUIRY_REQUEST';
export const SEND_ENQUIRY_SUCCESS = 'app/ProfilePage/SEND_ENQUIRY_SUCCESS';
export const SEND_ENQUIRY_ERROR = 'app/ProfilePage/SEND_ENQUIRY_ERROR';

export const FETCH_TIME_SLOTS_REQUEST = 'app/ProfilePage/FETCH_TIME_SLOTS_REQUEST';
export const FETCH_TIME_SLOTS_SUCCESS = 'app/ProfilePage/FETCH_TIME_SLOTS_SUCCESS';
export const FETCH_TIME_SLOTS_ERROR = 'app/ProfilePage/FETCH_TIME_SLOTS_ERROR';

export const SPECULATE_TRANSACTION_REQUEST = 'app/ProfilePage/SPECULATE_TRANSACTION_REQUEST';
export const SPECULATE_TRANSACTION_SUCCESS = 'app/ProfilePage/SPECULATE_TRANSACTION_SUCCESS';
export const SPECULATE_TRANSACTION_ERROR = 'app/ProfilePage/SPECULATE_TRANSACTION_ERROR';

export const SPECULATE_FREE_TRANSACTION_REQUEST = 'app/ProfilePage/SPECULATE_FREE_TRANSACTION_REQUEST';
export const SPECULATE_FREE_TRANSACTION_SUCCESS = 'app/ProfilePage/SPECULATE_FREE_TRANSACTION_SUCCESS';
export const SPECULATE_FREE_TRANSACTION_ERROR = 'app/ProfilePage/SPECULATE_FREE_TRANSACTION_ERROR';

export const INITIATE_ORDER_REQUEST = 'app/ProfilePage/INITIATE_ORDER_REQUEST';
export const INITIATE_ORDER_SUCCESS = 'app/ProfilePage/INITIATE_ORDER_SUCCESS';
export const INITIATE_ORDER_ERROR = 'app/ProfilePage/INITIATE_ORDER_ERROR';

// ================ Reducer ================ //

const initialState = {
  userId: null,
  userListingRefs: [],
  reviews: [],
  sendEnquiryInProgress: false,
  availabilityCalendar: {
    // '2018-12': {
    //   fetchTimeSlotsInProgress: false,
    //   timeslots: payload.timeslots,
    //   fetchTimeSlotsError: payload.error,
    // },
  },
  speculateTransactionInProgress: false,
  speculateFreeTransactionInProgress:false,
  userShowError: null,
  queryListingsError: null,
  queryReviewsError: null,
  sendEnquiryError: null,
  speculateTransactionError: null,
  speculateFreeTransactionError: null,
  initiateOrderError: null,
};

export default function profilePageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_INITIAL_STATE:
      return { ...initialState };
    case SHOW_USER_REQUEST:
      return { ...state, userShowError: null, userId: payload.userId };
    case SHOW_USER_SUCCESS:
      return state;
    case SHOW_USER_ERROR:
      return { ...state, userShowError: payload };

    case QUERY_LISTINGS_REQUEST:
      return {
        ...state,

        // Empty listings only when user id changes
        userListingRefs: payload.userId === state.userId ? state.userListingRefs : [],

        queryListingsError: null,
      };
    case QUERY_LISTINGS_SUCCESS:
      return { ...state, userListingRefs: payload.listingRefs };
    case QUERY_LISTINGS_ERROR:
      return { ...state, userListingRefs: [], queryListingsError: payload };
    case QUERY_REVIEWS_REQUEST:
      return { ...state, queryReviewsError: null };
    case QUERY_REVIEWS_SUCCESS:
      return { ...state, reviews: payload };
    case QUERY_REVIEWS_ERROR:
      return { ...state, reviews: [], queryReviewsError: payload };
    case SEND_ENQUIRY_REQUEST:
      return { ...state, sendEnquiryInProgress: true, sendEnquiryError: null };
    case SEND_ENQUIRY_SUCCESS:
      return { ...state, sendEnquiryInProgress: false };
    case SEND_ENQUIRY_ERROR:
      return { ...state, sendEnquiryInProgress: false, sendEnquiryError: payload };
    case FETCH_TIME_SLOTS_REQUEST: {
      const availabilityCalendar = {
        ...state.availabilityCalendar,
        [payload]: {
          ...state.availabilityCalendar[payload],
          fetchTimeSlotsError: null,
          fetchTimeSlotsInProgress: true,
        },
      };
      return { ...state, availabilityCalendar };
    }
    case FETCH_TIME_SLOTS_SUCCESS:
      return updateCalendarMonth(state, payload);
    case FETCH_TIME_SLOTS_ERROR: {
      const monthId = payload.monthId;
      const availabilityCalendar = {
        ...state.availabilityCalendar,
        [monthId]: {
          ...state.availabilityCalendar[monthId],
          fetchTimeSlotsInProgress: false,
          fetchTimeSlotsError: payload.error,
        },
      };
      return { ...state, availabilityCalendar };
    }
    case SPECULATE_TRANSACTION_REQUEST:
      return {
        ...state,
        speculateTransactionInProgress: true,
        speculateTransactionError: null,
        speculatedTransaction: null,
      };
    case SPECULATE_TRANSACTION_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return {
        ...state,
        speculateTransactionInProgress: false,
        speculateTransactionError: payload,
      };
    case SPECULATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        speculateTransactionInProgress: false,
      }
    case SPECULATE_FREE_TRANSACTION_REQUEST:
      return {
        ...state,
        speculateFreeTransactionInProgress: true,
        speculateFreeTransactionError: null,
        speculatedFreeTransaction: null,
      };
    case SPECULATE_FREE_TRANSACTION_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return {
        ...state,
        speculateFreeTransactionInProgress: false,
        speculateFreeTransactionError: payload,
      };
    case SPECULATE_FREE_TRANSACTION_SUCCESS:
      return {
        ...state,
        speculateFreeTransactionInProgress: false,
      }
    case INITIATE_ORDER_REQUEST:
      return { ...state, initiateOrderError: null };
    case INITIATE_ORDER_SUCCESS:
      return { ...state, transaction: payload };
    case INITIATE_ORDER_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, initiateOrderError: payload };

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const setInitialState = () => ({
  type: SET_INITIAL_STATE,
});

export const showUserRequest = userId => ({
  type: SHOW_USER_REQUEST,
  payload: { userId },
});

export const showUserSuccess = () => ({
  type: SHOW_USER_SUCCESS,
});

export const showUserError = e => ({
  type: SHOW_USER_ERROR,
  error: true,
  payload: e,
});

export const queryListingsRequest = userId => ({
  type: QUERY_LISTINGS_REQUEST,
  payload: { userId },
});

export const queryListingsSuccess = listingRefs => ({
  type: QUERY_LISTINGS_SUCCESS,
  payload: { listingRefs },
});

export const queryListingsError = e => ({
  type: QUERY_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const queryReviewsRequest = () => ({
  type: QUERY_REVIEWS_REQUEST,
});

export const queryReviewsSuccess = reviews => ({
  type: QUERY_REVIEWS_SUCCESS,
  payload: reviews,
});

export const queryReviewsError = e => ({
  type: QUERY_REVIEWS_ERROR,
  error: true,
  payload: e,
});

export const sendEnquiryRequest = () => ({ type: SEND_ENQUIRY_REQUEST });
export const sendEnquirySuccess = () => ({ type: SEND_ENQUIRY_SUCCESS });
export const sendEnquiryError = e => ({ type: SEND_ENQUIRY_ERROR, error: true, payload: e });

export const fetchTimeSlotsRequest = monthId => ({
  type: FETCH_TIME_SLOTS_REQUEST,
  payload: monthId,
});
export const fetchTimeSlotsSuccess = (timeslots) => ({
  type: FETCH_TIME_SLOTS_SUCCESS,
  payload: { timeslots},
});
export const fetchTimeSlotsError = (error) => ({
  type: FETCH_TIME_SLOTS_ERROR,
  error: true,
  payload: { error },
});

export const speculateTransactionRequest = () => ({ type: SPECULATE_TRANSACTION_REQUEST });

export const speculateTransactionSuccess = transaction => ({
  type: SPECULATE_TRANSACTION_SUCCESS,
  payload: { transaction },
});

export const speculateFreeTransactionError = e => ({
  type: SPECULATE_FREE_TRANSACTION_ERROR,
  error: true,
  payload: e,
});

export const speculateFreeTransactionRequest = () => ({ type: SPECULATE_FREE_TRANSACTION_REQUEST });

export const speculateFreeTransactionSuccess = transaction => ({
  type: SPECULATE_FREE_TRANSACTION_SUCCESS,
  payload: { transaction },
});

export const speculateTransactionError = e => ({
  type: SPECULATE_TRANSACTION_ERROR,
  error: true,
  payload: e,
});

const initiateOrderRequest = () => ({ type: INITIATE_ORDER_REQUEST });

const initiateOrderSuccess = order => ({
  type: INITIATE_ORDER_SUCCESS,
  payload: order,
});

const initiateOrderError = e => ({
  type: INITIATE_ORDER_ERROR,
  error: true,
  payload: e,
});

// ================ Thunks ================ //

export const queryUserListings = userId => (dispatch, getState, sdk) => {
  dispatch(queryListingsRequest(userId));
  return sdk.listings
    .query({
      author_id: userId,
      include: ['author', 'images'],
      'fields.image': ['variants.landscape-crop', 'variants.landscape-crop2x'],
    })
    .then(response => {
      // Pick only the id and type properties from the response listings
      const listingRefs = response.data.data.map(listing => {
        const {id, type, attributes} = listing;
        const {publicData} = attributes;
        const {serviceType, listingType} = publicData;

        return {id, type, serviceType, listingType};
      });
      dispatch(addMarketplaceEntities(response));
      dispatch(queryListingsSuccess(listingRefs));
      return response;
    })
    .catch(e => dispatch(queryListingsError(storableError(e))));
};

export const queryUserReviews = userId => (dispatch, getState, sdk) => {
  sdk.reviews
    .query({
      subject_id: userId,
      state: 'public',
      include: ['author', 'author.profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    })
    .then(response => {
      const reviews = denormalisedResponseEntities(response);
      dispatch(queryReviewsSuccess(reviews));
    })
    .catch(e => dispatch(queryReviewsError(e)));
};

export const showUser = userId => (dispatch, getState, sdk) => {
  dispatch(showUserRequest(userId));
  return sdk.users
    .show({
      id: userId,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    })
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(showUserSuccess());
      return response;
    })
    .catch(e => dispatch(showUserError(storableError(e))));
};

export const reloadUser = userId => (dispatch, getState, sdk) =>{
  return  dispatch(fetchCurrentUser({include: ['stripeCustomer.defaultPaymentMethod']}));
}

export const loadData = userId => (dispatch, getState, sdk) => {
  // Clear state so that previously loaded data is not visible
  // in case this page load fails.
  dispatch(setInitialState());

  return Promise.all([
    dispatch(fetchCurrentUser({include: ['stripeCustomer.defaultPaymentMethod']})),
    dispatch(showUser(userId)),
    dispatch(queryUserListings(userId)),
    dispatch(queryUserReviews(userId)),
  ]);
};

export const sendEnquiry = (listingId, message) => (dispatch, getState, sdk) => {
  dispatch(sendEnquiryRequest());
  const bodyParams = {
    transition: TRANSITION_ENQUIRE,
    processAlias: config.bookingProcessAlias,
    params: { listingId },
  };
  return sdk.transactions
    .initiate(bodyParams)
    .then(response => {
      const transactionId = response.data.data.id;

      // Send the message to the created transaction
      return sdk.messages.send({ transactionId, content: message }).then(() => {
        dispatch(sendEnquirySuccess());
        dispatch(fetchCurrentUserHasOrdersSuccess(true));
        return transactionId;
      });
    })
    .catch(e => {
      dispatch(sendEnquiryError(storableError(e)));
      throw e;
    });
};

export const getTimeSlots = (listingId, start, end, timeZone) => (dispatch, getState, sdk) => {
  const params = {
    per_page: 500,
    page: 1,
    listingId,
    start,
    end,
    timeZone,
  };

  return sdk.timeslots.query(params).then(response => {
    const entities =  denormalisedResponseEntities(response);
    dispatch(fetchTimeSlotsSuccess(entities));
    return entities;
  }).catch(e => {
    return dispatch(fetchTimeSlotsError(e));
  });
};

export const getListing = (listingId) => (dispatch, getState, sdk) => {
  return getListingsById(getState(), [listingId])[0];
}

/**
 * Initiate the speculative transaction with the given booking details
 *
 * The API allows us to do speculative transaction initiation and
 * transitions. This way we can create a test transaction and get the
 * actual pricing information as if the transaction had been started,
 * without affecting the actual data.
 *
 * We store this speculative transaction in the page store and use the
 * pricing info for the booking breakdown to get a proper estimate for
 * the price with the chosen information.
 */
export const speculateFreeTransaction = params => (dispatch, getState, sdk) => {
  dispatch(speculateFreeTransactionRequest());

  const bookingData = {
    startDate: params.bookingStart,
    endDate: params.bookingEnd,
  }
  const bodyParams = {
    transition: TRANSITION_NEW_BOOKING_REQUEST,
    processAlias: config.freeBookingProcessAlias,
    params: params,
  }

  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  }

  return dispatch(speculate(bookingData, bodyParams, queryParams));
}

export const speculateTransaction = params => (dispatch, getState, sdk) => {
  dispatch(speculateTransactionRequest());
  const bookingData = {
    startDate: params.bookingStart,
    endDate: params.bookingEnd,
  }

  const bodyParams = {
    transition: TRANSITION_NEW_BOOKING_REQUEST,
    processAlias: config.bookingProcessAlias,
    params: params
  };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  return dispatch(speculate(bookingData, bodyParams, queryParams));
};

const speculate = (bookingData, bodyParams, queryParams) => (dispatch, getState, sdk) =>  {
  return initiatePrivileged({isSpeculative: true, bookingData, bodyParams, queryParams})
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        throw new Error('Expected a resource in the sdk.transactions.initiateSpeculative response');
      }
      return entities[0];
    })
    .catch(e => {
      const { listingId, bookingStart, bookingEnd } = bodyParams.params;
      log.error(e, 'speculate-transaction-failed', {
        listingId: listingId.uuid,
        bookingStart,
        bookingEnd,
      });
      return dispatch(speculateTransactionError(storableError(e)));
    });
}

export const initiateOrder = orderParams => (dispatch, getState, sdk) => {
  dispatch(initiateOrderRequest());

  const alias = !orderParams.paymentMethod ? config.freeBookingProcessAlias : config.bookingProcessAlias;

  const bookingData = {
    startDate: orderParams.bookingStart,
    endDate: orderParams.bookingEnd
  }

  const bodyParams = {
      processAlias: alias,
      transition: TRANSITION_NEW_BOOKING_REQUEST,
      params: orderParams
    };

  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  return initiatePrivileged({isSpeculative: false, bookingData, bodyParams, queryParams})
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      const order = entities[0];
      dispatch(initiateOrderSuccess(order));
      dispatch(fetchCurrentUserHasOrdersSuccess(true));
      console.log("order: " + order);
      return order;
    })
    .catch(e => {
      dispatch(initiateOrderError(storableError(e)));
      log.error(e, 'initiate-order-failed', {
        listingId: orderParams.listingId.uuid,
        bookingStart: orderParams.bookingStart,
        bookingEnd: orderParams.bookingEnd,
      });
      throw e;
    });
};
