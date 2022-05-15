import {fetchCurrentUser} from '../../ducks/user.duck';
import {addMarketplaceEntities} from "../../ducks/marketplaceData.duck";
import {storableError} from "../../util/errors";
import {denormalisedResponseEntities} from "../../util/data";
import {rollupTransaction, sortTransactions, TRANSITIONS} from "../../util/transaction";
import {get} from "enzyme/src/configuration";

// ================ Action types ================ //

export const SET_INITIAL_STATE = 'app/DashboardPage/SET_INITIAL_STATE';

export const FETCH_LISTINGS_REQUEST = 'app/DashboardPage/FETCH_LISTINGS_REQUEST';
export const FETCH_LISTINGS_SUCCESS = 'app/DashboardPage/FETCH_LISTINGS_SUCCESS';
export const FETCH_LISTINGS_ERROR = 'app/DashboardPage/FETCH_LISTINGS_ERROR';

export const FETCH_REVIEWS_REQUEST = 'app/DashboardPage/FETCH_REVIEWS_REQUEST';
export const FETCH_REVIEWS_SUCCESS = 'app/DashboardPage/FETCH_REVIEWS_SUCCESS';
export const FETCH_REVIEWS_ERROR = 'app/DashboardPage/FETCH_REVIEWS_ERROR';

export const FETCH_BOOKINGS_REQUEST = 'app/DashboardPage/FETCH_BOOKINGS_REQUEST';
export const FETCH_BOOKINGS_SUCCESS = 'app/DashboardPage/FETCH_BOOKINGS_SUCCESS';
export const FETCH_BOOKINGS_ERROR = 'app/DashboardPage/FETCH_BOOKINGS_ERROR';


// ================ Reducer ================ //

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }));

const initialState = {
  fetchListingsInProgress: false,
  fetchListingsError: null,
  listings: [],
  reviews: [],
  fetchReviewsError: null,
  transactionRefs: [],
  bookings: [],
  fetchBookingsError: null,
  fetchBookingsInProgress: null,
};

export default function dashboardPageReducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SET_INITIAL_STATE:
      return {...initialState};

    case FETCH_LISTINGS_REQUEST:
      return {...state, fetchListingsInProgress: true, fetchListingsError: null};
    case FETCH_LISTINGS_SUCCESS:
      return {...state, fetchListingsInProgress: false, listings: payload};
    case FETCH_LISTINGS_ERROR:
      return {...state, fetchListingsInProgress: false, fetchListingsError: payload};

    case FETCH_REVIEWS_REQUEST:
      return {...state, fetchReviewsError: null};
    case FETCH_REVIEWS_SUCCESS:
      return {...state, reviews: payload};
    case FETCH_REVIEWS_ERROR:
      return {...state, fetchReviewsError: payload};

    case FETCH_BOOKINGS_REQUEST:
      return {...state, fetchBookingsError: false, fetchBookingsInProgress: true};
    case FETCH_BOOKINGS_SUCCESS:
      const transactions = sortTransactions(payload.data.data);
      const bookings = rollupTransaction(transactions);
      return {
        ...state,
        fetchBookingsInProgress: false,
        bookings: bookings,
        transactionRefs: entityRefs(transactions)
      };
    case FETCH_BOOKINGS_ERROR:
      return {...state, fetchBookingsError: payload, fetchBookingsInProgress: false};

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const setInitialState = () => ({
  type: SET_INITIAL_STATE,
});

export const fetchListingsRequest = () => ({type: FETCH_LISTINGS_REQUEST});
export const fetchListingsSuccess = listings => ({type: FETCH_LISTINGS_SUCCESS, payload: listings})
export const fetchListingsError = e => ({type: FETCH_LISTINGS_ERROR, payload: e});

export const fetchReviewsRequest = () => ({type: FETCH_REVIEWS_REQUEST});
export const fetchReviewsSuccess = reviews => ({type: FETCH_REVIEWS_SUCCESS, payload: reviews});
export const fetchReviewsError = e => ({type: FETCH_REVIEWS_ERROR, payload: e})

export const fetchBookingsRequest = () => ({type: FETCH_BOOKINGS_REQUEST});
export const fetchBookingsSuccess = txs => ({type: FETCH_BOOKINGS_SUCCESS, payload: txs});
export const fetchBookingsError = e => ({type: FETCH_BOOKINGS_ERROR, payload: e});

// ================ Thunks ================ //

export const fetchListings = () => (dispatch, getState, sdk) => {
  dispatch(fetchListingsRequest());
  return sdk.ownListings.query({})
    .then(response => {
      console.log("listings retrieved");
      //TODO only return listing of type service
      dispatch(addMarketplaceEntities(response));
      return dispatch(fetchListingsSuccess(response.data.data));
    }).catch(e => {
      dispatch(fetchListingsError({error: storableError(e)}));
      throw e;
    });
};

export const queryUserReviews = userId => (dispatch, getState, sdk) => {
  dispatch(fetchReviewsRequest());
  sdk.reviews
    .query({
      subject_id: userId,
      state: 'public',
    })
    .then(response => {
      const reviews = denormalisedResponseEntities(response);
      dispatch(fetchReviewsSuccess(reviews));
    })
    .catch(e => dispatch(fetchReviewsError(storableError(e))));
};

export const fetchMessage = txId => (dispatch, getState, sdk) => {
  return sdk.messages.query({
    transaction_id: txId
  }).then(response => {
    const messages = denormalisedResponseEntities(response);
    return messages[0];
  })
}

export const fetchBookings = (accountType) => (dispatch, getState, sdk) => {
  dispatch(fetchBookingsRequest());

  let onlyFilter;
  if (accountType === "pro") {
    onlyFilter = "sale"
  } else if (accountType === "parent") {
    onlyFilter = "order"
  } else {
    return Promise.reject(new Error("Invalid tab for CardInbox: " + accountType));
  }

  const apiQueryParams = {
    only: onlyFilter,
    lastTransitions: TRANSITIONS,
    include: [
      'provider',
      'provider.profileImage',
      'customer',
      'customer.profileImage',
      'booking',
      'listing',
    ],
    'fields.transaction': [
      'lastTransition',
      'lastTransitionedAt',
      'transitions',
      'payinTotal',
      'payoutTotal',
      'createdAt'
    ],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': ['variants.square-small', 'variants.square-small2x'],
  };

  return sdk.transactions.query(apiQueryParams)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(fetchBookingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(fetchBookingsError(storableError(e)));
      throw e;
    });
}

export const loadData = () => (dispatch, getState, sdk) => {
  return dispatch(fetchCurrentUser({
    include: ['stripeCustomer.defaultPaymentMethod', 'profileImage', 'stripeAccount'],
    'fields.image': ['variants.square-small', 'variants.square-small2x']
  })).then(response => {
    const currentUser = getState().user.currentUser;
    const {profile} = currentUser.attributes || {};
    const {publicData} = profile || {};
    const {accountType} = publicData || {};

    dispatch(queryUserReviews(currentUser.id));
    dispatch(fetchBookings(accountType));
    dispatch(fetchListings());
  });

}
