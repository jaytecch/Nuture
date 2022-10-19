import unionWith from 'lodash/unionWith';
import {storableError} from '../../util/errors';
import {addMarketplaceEntities} from '../../ducks/marketplaceData.duck';
import {convertUnitToSubUnit, unitDivisor} from '../../util/currency';
import config from '../../config';
import {denormalisedResponseEntities} from "../../util/data";
import {LISTING_TYPES} from "../../nurtureUpLists";
import {fetchCurrentUser, fetchCurrentUserHasOrdersSuccess} from "../../ducks/user.duck";
import {TRANSITION_ENQUIRE} from "../../util/transaction";
import {addApplicant} from "../../util/api";
import * as log from "../../util/log";

// ================ Action types ================ //

export const SEARCH_LISTINGS_REQUEST = 'app/SearchPage/SEARCH_LISTINGS_REQUEST';
export const SEARCH_LISTINGS_SUCCESS = 'app/SearchPage/SEARCH_LISTINGS_SUCCESS';
export const SEARCH_LISTINGS_ERROR = 'app/SearchPage/SEARCH_LISTINGS_ERROR';

export const SEARCH_MAP_LISTINGS_REQUEST = 'app/SearchPage/SEARCH_MAP_LISTINGS_REQUEST';
export const SEARCH_MAP_LISTINGS_SUCCESS = 'app/SearchPage/SEARCH_MAP_LISTINGS_SUCCESS';
export const SEARCH_MAP_LISTINGS_ERROR = 'app/SearchPage/SEARCH_MAP_LISTINGS_ERROR';

export const SEARCH_MAP_SET_ACTIVE_LISTING = 'app/SearchPage/SEARCH_MAP_SET_ACTIVE_LISTING';

export const SEND_INQUIRY_REQUEST = 'app/SearchPage/SEND_INQUIRY_REQUEST';
export const SEND_INQUIRY_SUCCESS = 'app/SearchPage/SEND_INQUIRY_SUCCESS';
export const SEND_INQUIRY_ERROR = 'app/SearchPage/SEND_INQUIRY_ERROR';

export const ADD_APPLICANT_REQUEST = 'app/SearchPage/ADD_APPLICANT_REQUEST';
export const ADD_APPLICANT_SUCCESS = 'app/SearchPage/ADD_APPLICANT_SUCCESS';
export const ADD_APPLICANT_ERROR = 'app/SearchPage/ADD_APPLICANT_ERROR'

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  searchParams: null,
  searchInProgress: false,
  searchListingsError: null,
  currentPageResultIds: [],
  searchMapListingIds: [],
  searchMapListingsError: null,
  isPro: false,
  sendInquiryError: null,
  sendInquiryInProgress: false,
  addApplicantInProgress: false,
  addApplicantError: null,
};

const resultIds = data => data.data.map(l => l.id);

const listingPageReducer = (state = initialState, action = {}) => {
  const {type, payload} = action;
  switch (type) {
    case SEARCH_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload.searchParams,
        searchInProgress: true,
        searchMapListingIds: [],
        searchListingsError: null,
      };
    case SEARCH_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
        isPro: payload.isPro,
      };
    case SEARCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return {...state, searchInProgress: false, searchListingsError: payload};

    case SEARCH_MAP_LISTINGS_REQUEST:
      return {
        ...state,
        searchMapListingsError: null,
      };
    case SEARCH_MAP_LISTINGS_SUCCESS: {
      const searchMapListingIds = unionWith(
        state.searchMapListingIds,
        resultIds(payload.data),
        (id1, id2) => id1.uuid === id2.uuid
      );
      return {
        ...state,
        searchMapListingIds,
      };
    }
    case SEARCH_MAP_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return {...state, searchMapListingsError: payload};

    case SEARCH_MAP_SET_ACTIVE_LISTING:
      return {
        ...state,
        activeListingId: payload,
      };

    case SEND_INQUIRY_REQUEST:
      return { ...state, sendInquiryInProgress: true, sendInquiryError: null };
    case SEND_INQUIRY_SUCCESS:
      return { ...state, sendInquiryInProgress: false };
    case SEND_INQUIRY_ERROR:
      return { ...state, sendInquiryInProgress: false, sendInquiryError: payload };

    case ADD_APPLICANT_REQUEST:
      return {...state, addApplicantError: null, addApplicantInProgress: true};
    case ADD_APPLICANT_SUCCESS:
      return {...state, addApplicantInProgress: false};
    case ADD_APPLICANT_ERROR:
      return {...state, addApplicantInProgress: false, addApplicantError: payload}

    default:
      return state;
  }
};

export default listingPageReducer;

// ================ Action creators ================ //

export const sendInquiryRequest = () => ({ type: SEND_INQUIRY_REQUEST });
export const sendInquirySuccess = () => ({ type: SEND_INQUIRY_SUCCESS });
export const sendInquiryError = e => ({ type: SEND_INQUIRY_ERROR, payload: e });

export const addApplicantRequest = () => ({type: ADD_APPLICANT_REQUEST});
export const addApplicantSuccess = () => ({type: ADD_APPLICANT_SUCCESS});
export const addApplicantError = e => ({type: ADD_APPLICANT_ERROR, payload: e});

export const searchListingsRequest = searchParams => ({
  type: SEARCH_LISTINGS_REQUEST,
  payload: {searchParams},
});

export const searchListingsSuccess = (response, isPro) => ({
  type: SEARCH_LISTINGS_SUCCESS,
  payload: {data: response.data, isPro: isPro},
});

export const searchListingsError = e => ({
  type: SEARCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchMapListingsRequest = () => ({type: SEARCH_MAP_LISTINGS_REQUEST});

export const searchMapListingsSuccess = response => ({
  type: SEARCH_MAP_LISTINGS_SUCCESS,
  payload: {data: response.data},
});

export const searchMapListingsError = e => ({
  type: SEARCH_MAP_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchListings = (searchFor, searchParams) => (dispatch, getState, sdk) => {
  dispatch(searchListingsRequest(searchParams));

  const user = getState().user.currentUser;
  const {attributes} = user || {};
  const {profile} = attributes || {};
  const {publicData} = profile || {};
  const {accountType} = publicData || {};
  const isPro = searchFor === "job" || accountType === "pro"
  const searchListingType = isPro ? LISTING_TYPES.job : LISTING_TYPES.service;

  const priceSearchParams = priceParam => {
    const inSubunits = value =>
      convertUnitToSubUnit(value, unitDivisor(config.currencyConfig.currency));
    const values = priceParam ? priceParam.split(',') : [];
    return priceParam && values.length === 2
      ? {
        price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
      }
      : {};
  };

  const {perPage, price, dates, ...rest} = searchParams;
  const priceMaybe = priceSearchParams(price);

  const params = {
    ...rest,
    ...priceMaybe,
    per_page: perPage,
    pub_listingType: searchListingType,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(searchListingsSuccess(response, isPro));
      return response;
    })
    .catch(e => {
      dispatch(searchListingsError(storableError(e)));
      throw e;
    });
};

export const setActiveListing = listingId => ({
  type: SEARCH_MAP_SET_ACTIVE_LISTING,
  payload: listingId,
});

export const searchMapListings = searchParams => (dispatch, getState, sdk) => {
  dispatch(searchMapListingsRequest(searchParams));

  const {perPage, ...rest} = searchParams;
  const params = {
    ...rest,
    per_page: perPage,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(searchMapListingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(searchMapListingsError(storableError(e)));
      throw e;
    });
};

export const queryUserReviews = userId => (dispatch, getState, sdk) => {
  return sdk.reviews
      .query({
        subject_id: userId,
        state: 'public',
      })
      .then(response => {
        const review = denormalisedResponseEntities(response);
        return review;
      })
      .catch(e => {
        console.log("Search Page Error: ", e);
        return [];
      });
};

export const loadData = (searchParams, searchFor) => (dispatch, getState, sdk) => {
  return dispatch(fetchCurrentUser()).then(() => {
    return dispatch(searchListings(searchFor, searchParams));
  })
}

export const sendInquiry = (listingId, message) => (dispatch, getState, sdk) => {
  dispatch(sendInquiryRequest());
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
        dispatch(sendInquirySuccess());
        dispatch(fetchCurrentUserHasOrdersSuccess(true));
        return transactionId;
      });
    })
    .catch(e => {
      dispatch(sendInquiryError(storableError(e)));
      throw e;
    });
};

export const getAssociatedProListing = (proId, serviceType) => (dispatch, getState, sdk) => {
  return sdk.listings.query({authorId: proId, pub_serviceType: serviceType})
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      return entities.length > 0 ? entities[0] : null;
    })
};

export const apply = (listingId, applicant) => (dispatch, getState, sdk) => {
  const params = {
    listingId,
    applicant
  };

  dispatch(addApplicantRequest())

  return addApplicant(params)
    .then(response => {
      const listingId = denormalisedResponseEntities(response)[0];
      console.log("listingId " + JSON.stringify(listingId));
      return dispatch(addApplicantSuccess());
    })
    .catch(e => {
      if(e.error === "exists"){
        log.error(e, 'Applicant exists', {
          listingId: listingId,
          applicant
        });
      } else {
        log.error(e, 'add-applicant-failed', {
          listingId: listingId,
          applicant
        });
      }
      dispatch(addApplicantError(storableError(e)))
      throw e;
    });
}
