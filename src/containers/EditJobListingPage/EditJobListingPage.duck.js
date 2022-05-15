import {denormalisedResponseEntities} from '../../util/data';
import {storableError} from '../../util/errors';
import {fetchCurrentUser} from "../../ducks/user.duck";
import {addJobListingsEntities} from "../../ducks/jobListingsData.duck";
import pick from "lodash/pick";
import {types as sdkTypes} from "../../util/sdkLoader";
import * as log from '../../util/log';
import zipToTZ from "zipcode-to-timezone";
import zipcodes from 'zipcodes';
import {LatLng} from "sharetribe-flex-integration-sdk/src/types";
import {updateListingSuccess} from "../EditListingPage/EditListingPage.duck";
import moment from "moment";

const {UUID} = sdkTypes;
const requestAction = actionType => params => ({type: actionType, payload: {params}});
const successAction = actionType => result => ({type: actionType, payload: result.data});
const errorAction = actionType => error => ({type: actionType, payload: error, error: true});

// ================ Action types ================ //
export const SET_INITIAL_VALUES = 'app/EditJobListingPage/SET_INITIAL_VALUES';
export const SHOW_JOB_LISTING_ERROR = 'app/EditJobListingPage/SHOW_JOB_LISTING_ERROR';
export const SHOW_JOB_LISTING_REQUEST = 'app/EditJobListingPage/SHOW_JOB_LISTING_REQUEST';
export const CREATE_JOB_LISTING_SUCCESS = 'app/EditJobListingPage/CREATE_JOB_LISTING_SUCCESS';
export const CREATE_JOB_LISTING_ERROR = 'app/EditJobListingPage/CREATE_JOB_LISTING_ERROR';
export const CREATE_JOB_LISTING_REQUEST = 'app/EditJobListingPage/CREATE_JOB_LISTING_REQUEST';
export const UPDATE_LISTING_SUCCESS = 'app/EditJobListingPage/UPDATE_LISTING_SUCCESS';
export const UPDATE_LISTING_ERROR = 'app/EditJobListingPage/UPDATE_LISTING_ERROR';
export const UPDATE_JOB_LISTING = 'app/EditJobListingPage/UPDATE_JOB_LISTING';
export const FETCH_EXCEPTIONS_REQUEST = 'app/EditJobListingPage/FETCH_AVAILABILITY_EXCEPTIONS_REQUEST';
export const FETCH_EXCEPTIONS_SUCCESS = 'app/EditJobListingPage/FETCH_AVAILABILITY_EXCEPTIONS_SUCCESS';
export const FETCH_EXCEPTIONS_ERROR = 'app/EditJobListingPage/FETCH_AVAILABILITY_EXCEPTIONS_ERROR';
export const SET_AVAILABILITY_PLAN = 'app/EditJobListingPage/SET_AVAILABILITY_PLAN';
export const FETCH_JOB_LISTINGS_REQUEST = 'app/EditJobListingPage/FETCH_JOB_LISTINGS_REQUEST';
export const FETCH_JOB_LISTINGS_SUCCESS = 'app/EditJobListingPage/FETCH_JOB_LISTINGS_SUCCESS';
export const FETCH_JOB_LISTINGS_ERROR = 'app/EditJobListingPage/FETCH_JOB_LISTINGS_ERROR';
export const ADD_EXCEPTION = 'app/EditJobListingPage/ADD_EXCEPTION';
export const DELETE_EXCEPTION = 'app/EditJobListingPage/DELETE_EXCEPTION';
export const SET_MAYBE_DELETES = 'app/EditJobListingPage/SET_MAYBE_DELETES';

// ================ Reducer ================ //
const initialState = {
  id: null,
  showListingError: null,
  updateInProgress: false,
  listingId: null,
  listing: null,
  updateListingError: null,
  updatedPlan: {},
  availabilityExceptions: [],
  addExceptionInProgress: false,
  fetchExceptionsError: null,
  fetchExceptionsInProgress: false,
  newListingPublished: false,
  fetchJobListingsInProgress: false,
  jobListings: [],
  jobListingsError: null,
  createJobInProgress: false,
  createJobError: null,
  maybeDeletes: [],
};

export default function reducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return {...initialState, ...payload};
    case SET_AVAILABILITY_PLAN:
      return {...initialState, updatedPlan: payload};
    case CREATE_JOB_LISTING_REQUEST:
      return {...state, createJobInProgress: true, createJobError: null}
    case CREATE_JOB_LISTING_SUCCESS:
      return {
        ...state,
        createJobInProgress: false,
        listingId: payload.id,
        listing: payload
      };
    case CREATE_JOB_LISTING_ERROR:
      return {...state, createJobInProgress: false, createJobError: payload}
    case SHOW_JOB_LISTING_ERROR:
      return {...state, showListingError: payload};
    case UPDATE_JOB_LISTING:
      return {...state, updateInProgress: true, updateListingError: null}
    case UPDATE_LISTING_SUCCESS:
      return {...state, updateInProgress: false, updateListingError: null};
    case UPDATE_LISTING_ERROR:
      return {...state, updateInProgress: false, updateListingError: payload};
    case ADD_EXCEPTION:
      return {
        ...state,
        availabilityExceptions: [...state.availabilityExceptions, payload],
        addExceptionInProgress: false,
      };
    case DELETE_EXCEPTION: {
      const deletedExceptionId = payload.id;
      const availabilityExceptions = state.availabilityExceptions.filter(
        e => e.listingId.uuid !== deletedExceptionId.uuid
      );
      return {
        ...state,
        availabilityExceptions,
        deleteExceptionInProgress: false,
      };
    }
    case FETCH_EXCEPTIONS_REQUEST:
      return {
        ...state,
        availabilityExceptions: [],
        fetchExceptionsError: null,
        fetchExceptionsInProgress: true,
      };
    case FETCH_EXCEPTIONS_SUCCESS:
      return {
        ...state,
        availabilityExceptions: payload,
        fetchExceptionsError: null,
        fetchExceptionsInProgress: false,
      };
    case FETCH_EXCEPTIONS_ERROR:
      return {
        ...state,
        fetchExceptionsError: payload.error,
        fetchExceptionsInProgress: false,
      };

    case FETCH_JOB_LISTINGS_REQUEST:
      return {
        ...state,
        fetchJobListingsInProgress: true,
        jobListingsError: null,
        jobListings: [],
      };
    case FETCH_JOB_LISTINGS_SUCCESS:
      return {
        ...state,
        fetchJobListingsInProgress: false,
        jobListings: payload.params,
      };
    case FETCH_JOB_LISTINGS_ERROR:
      return {
        ...state,
        fetchJobListingsInProgress: false,
        jobListingsError: payload.error,
      };
    case SET_MAYBE_DELETES:
      return {
        ...state,
        maybeDeletes: payload
      }

    default:
      return state;
  }
};

// ================ Action creators ================ //

export const createJobListingSuccess = successAction(CREATE_JOB_LISTING_SUCCESS);
export const createJobListingRequest = requestAction(CREATE_JOB_LISTING_REQUEST);
export const createJobListingError = errorAction(CREATE_JOB_LISTING_ERROR);

export const updateListingError = errorAction(UPDATE_LISTING_ERROR);
export const updateJobListingRequest = () => ({type: UPDATE_JOB_LISTING});
export const updateJobListingSuccess = () => ({
  type: UPDATE_LISTING_SUCCESS,
});

export const setMaybeDeletes = list => ({
  type: SET_MAYBE_DELETES,
  payload: list
});

export const setInitialValues = initialValues => ({
  type: SET_INITIAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

export const setAvailabilityPlan = plan => ({
  type: SET_AVAILABILITY_PLAN,
  payload: plan,
})

export const showJobListingRequest = id => ({
  type: SHOW_JOB_LISTING_REQUEST,
  payload: {id},
});

export const showJobListingError = e => ({
  type: SHOW_JOB_LISTING_ERROR,
  error: true,
  payload: e,
});

export const addAvailabilityException = e => ({
  type: ADD_EXCEPTION,
  payload: e,
});

export const deleteAvailabilityException = e => ({
  type: DELETE_EXCEPTION,
  payload: e,
});

// SDK method: availabilityExceptions.create
// export const addAvailabilityExceptionSuccess = successAction(ADD_EXCEPTION_SUCCESS);
// export const addAvailabilityExceptionError = errorAction(ADD_EXCEPTION_ERROR);
//
// // SDK method: availabilityExceptions.delete
// export const deleteAvailabilityExceptionSuccess = successAction(DELETE_EXCEPTION_SUCCESS);
// export const deleteAvailabilityExceptionError = errorAction(DELETE_EXCEPTION_ERROR);

// SDK method: availabilityExceptions.query
export const fetchAvailabilityExceptionsRequest = requestAction(FETCH_EXCEPTIONS_REQUEST);
export const fetchAvailabilityExceptionsSuccess = successAction(FETCH_EXCEPTIONS_SUCCESS);
export const fetchAvailabilityExceptionsError = errorAction(FETCH_EXCEPTIONS_ERROR);

export const fetchJobListingsRequest = requestAction(FETCH_JOB_LISTINGS_REQUEST);
export const fetchJobListingsSuccess = requestAction(FETCH_JOB_LISTINGS_SUCCESS);
export const fetchJobListingsError = requestAction(FETCH_JOB_LISTINGS_ERROR);

// ================ Thunks ================ //

export const showJobListing = (listingId, isOwn = false) => (dispatch, getState, sdk) => {
  dispatch(showJobListingRequest(listingId));
  dispatch(fetchCurrentUser());

  const show = isOwn ? sdk.ownListings.show({id: listingId}) : sdk.listings.show({id: listingId});

  return show
    .then(data => {
      dispatch(addJobListingsEntities(data));
      return data;
    })
    .catch(e => {
      dispatch(showJobListingError(storableError(e)));
    });
};

export const saveAvailabilityException = params => (dispatch, getState, sdk) => {
  return sdk.availabilityExceptions.create(params, {expand: true})
};

export const updateJobListing = params => (dispatch, getState, sdk) => {
  dispatch(updateJobListingRequest());
  const {
    id,
    title,
    description,
    serviceType,
    zip,
    preferences,
    experience,
    educationLevel,
  } = params;
  const {latitude, longitude} = zipcodes.lookup(zip);


  return sdk.ownListings.update({
    id: id,
    title: title,
    description: description,
    geolocation: new LatLng(latitude, longitude),
    publicData: {
      serviceType: serviceType,
      zip: zip,
      preferences: preferences,
      experience: experience,
      educationLevel: educationLevel,
    }
  })
    .then(response => {
      const promises = [];
      const state = getState().EditJobListingPage;

      state.maybeDeletes.map(id => {
        promises.push(sdk.availabilityExceptions.delete({
          id: id,
        }))
      })

      //Create Schedule
      state.updatedPlan.entries.map(entry => {
        if (!entry.id) {
          const selectedDate = entry.date;
          const zeroDay = moment(selectedDate).startOf("day");

          promises.push(sdk.availabilityExceptions.create({
            listingId: id,
            seats: 1,
            start: moment(zeroDay).add(entry.start.hours(), 'h').toDate(),
            end: moment(zeroDay).add(entry.end.hours(), 'h').toDate(),
          }, {expand: true}));
        }
      });

      dispatch(updateJobListingSuccess());

      return Promise.all(promises)
        .then(response => {
          console.log("schedule response: " + JSON.stringify(response));
          return response;
        })
        .catch(e => {
          console.log("schedule error: " + JSON.stringify(e));
          dispatch(updateListingError(storableError(e)));
          throw e;
        });
    }).catch(e => {
      log.error(e, 'update-listing-failed', {listingData: params.values});
      dispatch(updateListingError(storableError(e)));
      throw e;
    });
};

export const createJobListing = params => (dispatch, getState, sdk) => {
  const {
    title,
    description,
    serviceType,
    zip,
    preferences,
    experience,
    educationLevel
  } = params;

  dispatch(createJobListingRequest({}));
  //save exceptions
  const schedule = getState().EditJobListingPage.updatedPlan;
  const timezone = zipToTZ.lookup(zip) || "America/New_York";
  const {latitude, longitude} = zipcodes.lookup(zip);
  console.log("after getting state");

  return sdk.ownListings
    .create({
      title: title,
      description: description,
      availabilityPlan: {type: "availability-plan/time", timezone: timezone, entries: []},
      geolocation: new LatLng(latitude, longitude),
      publicData: {
        serviceType: serviceType,
        zip: zip,
        preferences: preferences,
        experience: experience,
        educationLevel: educationLevel,
        listingType: "job",
        applicants: [],
      },
    }, {expand: true})
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      const respId = entities[0].id.uuid;
      if (entities.length !== 1) {
        throw new Error('Expected a response from the sdk');
      }

      //Create Schedule
      const promises = [];
      schedule.map(entry => {
        const selectedDate = entry.date;
        const zeroDay = moment(selectedDate).startOf("day");

        promises.push(sdk.availabilityExceptions.create({
          listingId: respId,
          seats: 1,
          start: moment(zeroDay).add(entry.start.hours(), 'h').toDate(),
          end: moment(zeroDay).add(entry.end.hours(), 'h').toDate(),
        }, {expand: true}));
      });

      dispatch(createJobListingSuccess(response))
      return Promise.all(promises)
        .then(response => {
          console.log("schedule response: " + JSON.stringify(response));
          const availabilityException = response.data.data;
          return availabilityException;
          //return dispatch(addAvailabilityExceptionSuccess({ data: availabilityException }));
        })
        .catch(e => {
          //dispatch(addAvailabilityExceptionError({ error: storableError(e) }));
          console.log("schedule error: " + JSON.stringify(e));
          throw e;
        });
    })
    .catch(e => {
      dispatch(createJobListingError(storableError(e)))
    });
};

//TODO do we need this function?
// export const removeAvailabilityException = params => (dispatch, getState, sdk) => {
//   return sdk.availabilityExceptions
//     .delete(params, {expand: true})
//     .then(response => {
//       const availabilityException = response.data.data;
//       return availabilityException;
//     })
//     .catch(e => {
//       throw e;
//     });
// };
//
// export const saveAvailabilityException = params => (dispatch, getState, sdk) => {
//   return sdk.availabilityExceptions
//     .create(params, {expand: true})
//     .then(response => {
//       const availabilityException = response.data.data;
//       return availabilityException;
//     })
//     .catch(e => {
//       throw e;
//     });
// };

export const requestFetchAvailabilityExceptions = fetchParams => (dispatch, getState, sdk) => {
  dispatch(fetchAvailabilityExceptionsRequest(fetchParams));

  return sdk.availabilityExceptions
    .query(fetchParams, {expand: true})
    .then(response => {
      const availabilityExceptions = denormalisedResponseEntities(response);
      dispatch(fetchAvailabilityExceptionsSuccess({data: availabilityExceptions}));
      return availabilityExceptions;
    })
    .catch(e => {
      return dispatch(fetchAvailabilityExceptionsError({error: storableError(e)}));
    });
};

export const deleteTimeslot = id => (dispatch, getState, sdk) => {
  return sdk.availabilityExceptions.delete(id)
    .then(() => {
      console.log("successful delete of exception");
    })
    .catch(e => {
      console.log("error while deleting exception: " + e);
    })
}

export const getListings = () => (dispatch, getState, sdk) => {
  dispatch(fetchJobListingsRequest({}));

  return sdk.ownListings.query({})
    .then(response => {
      console.log("listings retrieved");
      //TODO only return listing of type service
      return dispatch(fetchJobListingsSuccess(response.data.data));
    }).catch(e => {
      dispatch(fetchJobListingsError({error: storableError(e)}));
      throw e;
    });
};

