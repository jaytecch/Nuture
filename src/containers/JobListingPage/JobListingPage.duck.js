// ================ Action types ================ //
import {storableError} from "../../util/errors";
import {addApplicant, initiatePrivileged} from "../../util/api";
import {denormalisedResponseEntities} from "../../util/data";
import * as log from "../../util/log";
import {fetchCurrentUser, fetchCurrentUserHasOrdersSuccess} from "../../ducks/user.duck";
import * as moment from "moment";
import {addMarketplaceEntities, getListingsById} from "../../ducks/marketplaceData.duck";
import config from "../../config";
import {TRANSITION_HIRE_FOR_JOB,} from "../../util/transaction";
import {types as sdkTypes} from "../../util/sdkLoader";

const { UUID } = sdkTypes;

export const SET_INITIAL_STATE = 'app/JobListingPage/SET_INITIAL_STATE';

export const FETCH_JOB_LISTING_REQUEST = 'app/JobListingPage/FETCH_JOB_LISTING_REQUEST';
export const FETCH_JOB_LISTING_SUCCESS = 'app/JobListingPage/FETCH_JOB_LISTING_SUCCESS';
export const FETCH_JOB_LISTING_ERROR = 'app/JobListingPage/FETCH_JOB_LISTING_ERROR';

export const ADD_APPLICANT_REQUEST = 'app/JobListingPage/ADD_APPLICANT_REQUEST';
export const ADD_APPLICANT_SUCCESS = 'app/JobListingPage/ADD_APPLICANT_SUCCESS';
export const ADD_APPLICANT_ERROR = 'app/JobListingPage/ADD_APPLICANT_ERROR'

export const GET_SCHEDULE_SUCCESS = 'app/JobListingPage/GET_SCHEDULE_SUCCESS';
export const GET_SCHEDULE_ERROR = 'app/JobListingPage/GET_SCHEDULE_ERROR';

export const HIRE_APPLICANT_REQUEST = 'app/JobListingPage/HIRE_APPLICANT_REQUEST';
export const HIRE_APPLICANT_SUCCESS = 'app/JobListingPage/HIRE_APPLICANT_SUCCESS';
export const HIRE_APPLICANT_ERROR = 'app/JobListingPage/HIRE_APPLICANT_ERROR';

export const FETCH_APPLICANT_SUCCESS = 'app/JobListingPage/FETCH_APPLICANT_SUCCESS';
export const FETCH_APPLICANTS_ERROR = 'app/JobListingPage/FETCH_APPLICANTS_ERROR';

// ================ Reducer ================ //
const initialState = {
  listing: null,
  schedule: [],
  getScheduleError: null,
  fetchJobListingsInProgress: false,
  fetchJobListingError: null,
  addApplicantInProgress: false,
  addApplicantError: null,
  isOwner: false,
  hireInProgress: false,
  hireError: null,
  applicantListings: [],
  fetchApplicantsError: null,
}

export default function profilePageReducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SET_INITIAL_STATE:
      return {...initialState, isOwner: payload};

    case FETCH_JOB_LISTING_REQUEST:
      return {...state, fetchJobListingsInProgress: true, fetchJobListingError: null,};
    case FETCH_JOB_LISTING_SUCCESS:
      return {
        ...state,
        fetchListingError: null,
        fetchJobListingsInProgress: false,
        listing: payload
      };
    case FETCH_JOB_LISTING_ERROR:
      return {...state, fetchJobListingsInProgress: false, fetchListingError: payload};

    case ADD_APPLICANT_REQUEST:
      return {...state, addApplicantError: null, addApplicantInProgress: true};
    case ADD_APPLICANT_SUCCESS:
      return {...state, addApplicantInProgress: false};
    case ADD_APPLICANT_ERROR:
      return {...state, addApplicantInProgress: false, addApplicantError: payload}

    case GET_SCHEDULE_SUCCESS:
      return {...state, schedule: payload, getScheduleError: null};
    case GET_SCHEDULE_ERROR:
      return {...state, getScheduleError: payload}

    case HIRE_APPLICANT_REQUEST:
      return {...state, hireInProgress: true, hireError: null};
    case HIRE_APPLICANT_SUCCESS:
      return {...state, hireInProgress: false}
    case HIRE_APPLICANT_ERROR:
      return {...state, hireInProgress: false, hireError: payload};

    case FETCH_APPLICANT_SUCCESS:
      return {...state, fetchApplicantsError: null, applicantListings: payload};
    case FETCH_APPLICANTS_ERROR:
      return {...state, fetchApplicantsError: payload};

    default:
      return state;
  }
}

// ================ Action creators ================ //
export const setInitialState = (isOwner) => ({type: SET_INITIAL_STATE, payload: isOwner});

export const fetchJobListingRequest = () => ({type: FETCH_JOB_LISTING_REQUEST});
export const fetchJobListingSuccess = listing => ({
  type: FETCH_JOB_LISTING_SUCCESS,
  payload: listing
});
export const fetchJobListingError = e => ({type: FETCH_JOB_LISTING_ERROR, payload: e});

export const addApplicantRequest = () => ({type: ADD_APPLICANT_REQUEST});
export const addApplicantSuccess = () => ({type: ADD_APPLICANT_SUCCESS});
export const addApplicantError = e => ({type: ADD_APPLICANT_ERROR, payload: e});

export const getScheduleSuccess = schedule => ({type: GET_SCHEDULE_SUCCESS, payload: schedule});
export const getScheduleError = e => ({type: GET_SCHEDULE_ERROR, payload: e})

export const hireApplicantRequest = () => ({type: HIRE_APPLICANT_REQUEST});
export const hireApplicantSuccess = () => ({type: HIRE_APPLICANT_SUCCESS});
export const hireApplicantError = e => ({type: HIRE_APPLICANT_ERROR, payload: e});

export const fetchApplicantsSuccess = applicantListings => ({type: FETCH_APPLICANT_SUCCESS, payload: applicantListings});

// ================ Thunks ================ //
export const getApplicantListings = applicants => (dispatch, getState, sdk) => {
  const arr = applicants.map(applicant => applicant.id);
  const listings =  getListingsById(getState(), applicants.map(applicant => new UUID(applicant.listingId)));

  return listings;
}

export const showListing = (listingId) => (dispatch, getState, sdk) => {
  dispatch(fetchJobListingRequest())

  const params = {
    id: listingId,
    include: ['author', 'author.profileImage', 'images'],
  };

  const ownListing = getListingsById(getState(), [listingId], 'ownListing');
  const show = ownListing && ownListing.length > 0 ?
    sdk.ownListings.show(params) :
    sdk.listings.show(params);

  return show
    .then(response => {
      // dispatch(addMarketplaceEntities(data));
      const listing = response.data.data;
      dispatch(fetchJobListingSuccess(listing))
      return listing;
    })
    .catch(e => {
      dispatch(fetchJobListingError(storableError(e)));
    });
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
      log.error(e, 'add-applicant-failed', {
        listingId: listingId,
        applicant
      });
      return dispatch(addApplicantError(storableError(e)));
    });
}

export const getSchedule = listingId => (dispatch, getState, sdk) => {
  return sdk.timeslots.query({
    listingId: listingId.uuid,
    start: moment().toDate(),
    end: moment().add(90, 'days').toDate(),
  })
    .then(response => {
      const entities = denormalisedResponseEntities(response)
      console.log("entities: " + JSON.stringify(entities))
      dispatch(getScheduleSuccess(entities))
    })
    .catch(e => {
      console.log("Error: " + JSON.stringify(e));
      dispatch(getScheduleError(storableError(e)));
    })
}

export const hireApplicant = (applicantId, serviceType, stripePayment) => (dispatch, getState, sdk) => {
  sdk.listings.query({
    authorId: applicantId,
    pub_serviceType: serviceType,
  })
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      console.log("hire: " + JSON.stringify(response));

      if (entities.length > 0) {
        const proListing = entities[0];
        const state = getState().JobListingPage;

        const promises = [];
        state.schedule.map(timeslot => {
          const {attributes} = timeslot;
          const {start, end} = attributes;
          const params = {
            listingId: proListing.id,
            bookingStart: start,
            bookingEnd: end,
            paymentMethod: stripePayment,
          };
          promises.push(dispatch(initiateTx(params)));
        })

        return Promise.all(promises).then(response =>{
          console.log("success hire: " + JSON.stringify(response))
          dispatch(hireApplicantSuccess());
        });
      }
    })
    .catch(e => {
      console.log("hire error: " + JSON.stringify(storableError(e)));
      dispatch(hireApplicantError(storableError(e)));
    })
}

export const initiateTx = orderParams => (dispatch, getState, sdk) => {
  dispatch(hireApplicantRequest());

  const bookingData = {
    startDate: orderParams.bookingStart,
    endDate: orderParams.bookingEnd
  }

  const bodyParams = {
    processAlias: config.bookingProcessAlias,
    transition: TRANSITION_HIRE_FOR_JOB,
    params: orderParams
  };

  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  return initiatePrivileged({isSpeculative: false, bookingData, bodyParams, queryParams})
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      const booking = entities[0];
      dispatch(fetchCurrentUserHasOrdersSuccess(true));
      return booking;
    })
    .catch(e => {
      dispatch(hireApplicantError(storableError(e)));
      console.log("priv failed: " + JSON.stringify(e));
      log.error(e, 'hire-failed', {
        listingId: orderParams.listingId.uuid,
        bookingStart: orderParams.bookingStart,
        bookingEnd: orderParams.bookingEnd,
      });
      throw e;
    });
}

export const fetchListings = () => (dispatch, getState, sdk) => {
  dispatch(fetchJobListingRequest());
  return Promise.all([sdk.ownListings.query({}), sdk.listings.query({include:['author']})])
    .then(response => {
      console.log("listings retrieved");
      response.forEach(resp => dispatch(addMarketplaceEntities(resp)));
      return dispatch(fetchJobListingSuccess(response[0].data.data));
    }).catch(e => {
      dispatch(fetchJobListingError({error: storableError(e)}));
      throw e;
    });
};

export const getAssociatedProListing = (proId, serviceType) => (dispatch, getState, sdk) => {
  return sdk.listings.query({authorId: proId, pub_serviceType: serviceType})
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      return entities[0];
    })
}

export const loadData = (listingId, isOwner = false) => (dispatch, getState, sdk) => {
  dispatch(setInitialState(isOwner));

  return Promise.all([
    dispatch(fetchCurrentUser({include: ['stripeCustomer.defaultPaymentMethod']})),
    dispatch(fetchListings())
      .then(() => {
        return dispatch(showListing(listingId, isOwner))
      }),

    dispatch(getSchedule(listingId)),
  ]);
};
