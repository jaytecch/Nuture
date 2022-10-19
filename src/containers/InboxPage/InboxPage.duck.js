import {storableError} from '../../util/errors';
import {rollupTransaction, sortTransactions, TRANSITIONS} from '../../util/transaction';
import {addMarketplaceEntities} from '../../ducks/marketplaceData.duck';
import {fetchCurrentUser} from "../../ducks/user.duck";
import {types as sdkTypes} from "../../util/sdkLoader";

const { UUID } = sdkTypes;

const INBOX_PAGE_SIZE = 10;

// ================ Action types ================ //
export const SET_INITIAL_STATE = 'app/InboxPage/SET_INITIAL_STATE';

export const FETCH_ORDERS_OR_SALES_REQUEST = 'app/InboxPage/FETCH_ORDERS_OR_SALES_REQUEST';
export const FETCH_ORDERS_OR_SALES_SUCCESS = 'app/InboxPage/FETCH_ORDERS_OR_SALES_SUCCESS';
export const FETCH_ORDERS_OR_SALES_ERROR = 'app/InboxPage/FETCH_ORDERS_OR_SALES_ERROR';

export const CLEAR_BOOKING = 'app/InboxPage/CLEAR_BOOKING';
export const SELECT_BOOKING = 'app/InboxPage/SELECT_BOOKING';

export const DATA_LOADED = 'app/InboxPage/DATA_LOADED';

export const SET_PAGE = 'app/InboxPage/SET_PAGE';

// ================ Reducer ================ //

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }));

const initialState = {
  fetchInProgress: false,
  fetchOrdersOrSalesError: null,
  pagination: null,
  transactionRefs: [],
  rolledUpTransactionIds: [],
  selectedBooking: [],
  dataLoaded: false,
  currentPageTransactionIds: [],
  numberOfPages: 1,
  currentPage: 1,
};

export default function checkoutPageReducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SET_INITIAL_STATE:
      return initialState;

    case FETCH_ORDERS_OR_SALES_REQUEST:
      return {...state, fetchInProgress: true, fetchOrdersOrSalesError: null};
    case FETCH_ORDERS_OR_SALES_SUCCESS: {
      const transactions = sortTransactions(payload.data.data);
      const rolledUp = rollupTransaction(transactions)
      const numberOfPages = Math.ceil(rolledUp.length / INBOX_PAGE_SIZE);

      return {
        ...state,
        fetchInProgress: false,
        transactionRefs: entityRefs(transactions),
        rolledUpTransactionIds: rolledUp,
        pagination: payload.data.meta,
        numberOfPages: numberOfPages,
      };
    }
    case FETCH_ORDERS_OR_SALES_ERROR:
      console.error(payload); // eslint-disable-line
      return {...state, fetchInProgress: false, fetchOrdersOrSalesError: payload};

    case SELECT_BOOKING:
      return {...state, selectedBooking: payload};
    case CLEAR_BOOKING:
      return {...state, selectedBooking: []};

    case DATA_LOADED:
      return {...state, dataLoaded: true};
    case SET_PAGE:
      return {...state, currentPageTransactionIds: payload.txs, currentPage: payload.page};

    default:
      return state;
  }
}

// ================ Action creators ================ //
export const setInitialState = () => ({type: SET_INITIAL_STATE});

export const dataLoaded = () => ({type: DATA_LOADED})

const fetchOrdersOrSalesRequest = () => ({type: FETCH_ORDERS_OR_SALES_REQUEST});
const fetchOrdersOrSalesSuccess = response => ({
  type: FETCH_ORDERS_OR_SALES_SUCCESS,
  payload: response,
});
const fetchOrdersOrSalesError = e => ({
  type: FETCH_ORDERS_OR_SALES_ERROR,
  error: true,
  payload: e,
});

export const clearBooking = () => ({type: CLEAR_BOOKING});
export const selectBooking = booking => ({type: SELECT_BOOKING, payload: booking});

export const setPageTxs = currentTxs => ({type: SET_PAGE, payload: currentTxs});

// ================ Thunks ================ //

const setInitialSelectedBooking = booking => (dispatch, getState, sdk) =>{
  let selectedBooking = booking;
  if(booking.length === 0) {
    const {rolledUpTransactionIds} = getState().InboxPage;
    selectedBooking = rolledUpTransactionIds.length > 0 ? rolledUpTransactionIds[0] : [];
  }

  return dispatch(selectBooking(selectedBooking))
}

const setInitialPage = () => (dispatch, getState, sdk) => {
  const state = getState().InboxPage;
  const {rolledUpTransactionIds, selectedBooking} = state;

  if(!selectedBooking || selectedBooking.length === 0) {
    return dispatch(setPage(1));
  }

  const selectedBookingId = selectedBooking[0].uuid;
  const txNumber = rolledUpTransactionIds.findIndex(tx => tx[0].uuid === selectedBookingId) + 1;

  const page =  txNumber > 0 ? (
    Math.ceil(txNumber / INBOX_PAGE_SIZE)
  ) : 1;

  return dispatch(setPage(page));
}

export const setPage = page => (dispatch, getState, sdk) => {
  const txIds = getState().InboxPage.rolledUpTransactionIds;
  const numTxs = txIds.length;
  const startIndex = (page - 1) * INBOX_PAGE_SIZE;
  const endIndex = page * INBOX_PAGE_SIZE;

  const currentTxs = txIds.slice(startIndex, endIndex > numTxs ? numTxs : endIndex);
  dispatch(setPageTxs({txs: currentTxs, page}));
}

export const resetBooking = () => (dispatch, getState, sdk) => {
  return new Promise((resolve, reject) => {
    dispatch(clearBooking());
    resolve();
  });
}

export const loadData = (params, search) => (dispatch, getState, sdk) => {
  dispatch(setInitialState());

  if (getState().InboxPage.dataLoaded) {
    return Promise.resolve();
  }

  const parsedBooking = search ?
    search.substring(1).split("+").map(id => new UUID(id))
    : [];

  return dispatch(fetchCurrentUser()).then(response => {
    const currentUser = getState().user.currentUser;
    const {profile} = currentUser.attributes || {};
    const {publicData} = profile || {};
    const {accountType} = publicData;

    let onlyFilter;
    if(accountType === "pro") {
      onlyFilter = "sale"
    } else if(accountType === "parent") {
      onlyFilter = "order"
    } else {
      return Promise.reject(new Error("Invalid tab for InboxPage: " + accountType));
    }

    dispatch(fetchOrdersOrSalesRequest());

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
        'createdAt',
      ],
      'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };

    return sdk.transactions.query(apiQueryParams)
      .then(response => {
          dispatch(addMarketplaceEntities(response));
          dispatch(fetchOrdersOrSalesSuccess(response));
          dispatch(setInitialSelectedBooking(parsedBooking));
          dispatch(setInitialPage());
          dispatch(dataLoaded());
      })
      .catch(e => {
        dispatch(fetchOrdersOrSalesError(storableError(e)));
        throw e;
      });
  });
};
