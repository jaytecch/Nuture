// ================ Action types ================ //
import pick from "lodash/pick";
import {denormalisedResponseEntities} from "../../util/data";
import {storableError} from "../../util/errors";
import {types as sdkTypes} from '../../util/sdkLoader';
import zipcodes from 'zipcodes';
import {LatLng} from "sharetribe-flex-integration-sdk/src/types";

export const SET_INITIAL_VALUES = 'app/EditServicesPage/SET_INITIAL_VALUES';
export const SET_AVAILABILITY_PLAN = 'app/EditServicesPage/SET_AVAILABILITY_PLAN';
export const FETCH_EXCEPTIONS_REQUEST = 'app/EditServicesPage/FETCH_AVAILABILITY_EXCEPTIONS_REQUEST';
export const FETCH_EXCEPTIONS_SUCCESS = 'app/EditServicesPage/FETCH_AVAILABILITY_EXCEPTIONS_SUCCESS';
export const FETCH_EXCEPTIONS_ERROR = 'app/EditServicesPage/FETCH_AVAILABILITY_EXCEPTIONS_ERROR';
export const DELETE_EXCEPTION = 'app/EditServicesPage/DELETE_AVAILABILITY_EXCEPTION';
export const ADD_EXCEPTION_ERROR = 'app/EditServicesPage/ADD_EXCEPTION_ERROR';
export const ADD_EXCEPTION = 'app/EditServicesPage/ADD_EXCEPTION';
export const CREATE_SERVICE_LISTING = 'app/EditServicesPage/CREATE_SERVICE_LISTING';
export const FETCH_SERVICES_SUCCESS = 'app/EditServicesPage/FETCH_SERVICES_SUCCESS';
export const FETCH_SERVICES_ERROR = 'app/EditServicesPage/FETCH_SERVICES_SUCCESS';

const requestAction = actionType => params => ({type: actionType, payload: {params}});
const successAction = actionType => result => ({type: actionType, payload: result.data});
const errorAction = actionType => error => ({type: actionType, payload: error, error: true});

const {Money} = sdkTypes;

// ================ Reducer ================ //
const initialState = {
  id: null,
  updatedPlan: {},
  availabilityExceptions: [],
  services: [],
  servicesError: null,
  addExceptionError: null,
  addExceptionInProgress: false,
  deleteExceptionError: null,
  deleteExceptionInProgress: false,
  fetchExceptionsError: null,
  fetchExceptionsInProgress: false,
  updateInProgress: false,
  listingId: null,
};

export default function reducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return {...initialState, ...payload};
    case SET_AVAILABILITY_PLAN:
      return {...initialState, updatedPlan: payload};
    case CREATE_SERVICE_LISTING:
      return {
        ...state,
        listingId: payload.uuid,
        listing: payload,
      }
    case ADD_EXCEPTION:
      return {
        ...state,
        availabilityExceptions: [...state.availabilityExceptions, payload],
        addExceptionInProgress: false,
      };
    case ADD_EXCEPTION_ERROR:
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
    case FETCH_SERVICES_SUCCESS:
      return {
        ...state,
        services: payload,
        servicesError: null,
      };
    case FETCH_SERVICES_ERROR:
      return {
        ...state,
        servicesError: payload.error,
      }
    default:
      return state;
  }
};

// ================ Action creators ================ //
export const setInitialValues = initialValues => ({
  type: SET_INITIAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

export const setAvailabilityPlan = plan => ({
  type: SET_AVAILABILITY_PLAN,
  payload: plan,
});

export const addAvailabilityException = e => ({
  type: ADD_EXCEPTION,
  payload: e,
});

export const deleteAvailabilityException = e => ({
  type: DELETE_EXCEPTION,
  payload: e,
});

export const fetchAvailabilityExceptionsRequest = requestAction(FETCH_EXCEPTIONS_REQUEST);
export const fetchAvailabilityExceptionsSuccess = successAction(FETCH_EXCEPTIONS_SUCCESS);
export const fetchAvailabilityExceptionsError = errorAction(FETCH_EXCEPTIONS_ERROR);

export const fetchServicesSuccess = successAction(FETCH_SERVICES_SUCCESS);
export const fetchServicesError = errorAction(FETCH_SERVICES_ERROR);

// ================ Thunks ================ //
export const createServiceListing = params => (dispatch, getState, sdk) => {
  const {
    serviceType,
    zip,
    preferences,
    experience,
    educationLevel,
    travelRadius,
    title,
    rate,
    expirationDate
  } = params;

  //save exceptions
  const exceptions = getState().EditServicesPage.availabilityExceptions;
  const availabilityPlan = getState().EditServicesPage.updatedPlan;
  const {latitude, longitude} = zipcodes.lookup(zip);

  sdk.ownListings.create({
      title: title,
      availabilityPlan: availabilityPlan,
      price: rate,
      geolocation: new LatLng(latitude, longitude),
      publicData: {
        serviceType: serviceType,
        zip: zip,
        preferences: preferences,
        experience: experience,
        educationLevel: educationLevel,
        travelRadius: travelRadius,
        listingType: "service",
        expirationDate: expirationDate.date.getTime(),
      },
    }, {expand: true}
  ).then(response => {
    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a response from the sdk');
    }

    const respId = entities[0].id;
    for (const exception of exceptions) {
      saveAvailabilityException({...exception, listingId: respId});
    }
  }).catch(e => {
    throw e;
  });
};

export const updateServiceListing = params => (dispatch, getState, sdk) => {
  const {
    serviceType,
    zip,
    preferences,
    experience,
    educationLevel,
    travelRadius,
    title,
    rate,
    expirationDate,
    listingId
  } = params;

  //save exceptions
  const exceptions = getState().EditServicesPage.availabilityExceptions;
  const availabilityPlan = getState().EditServicesPage.updatedPlan;
  const {latitude, longitude} = zipcodes.lookup(zip);

  return new Promise((resolve, reject) => {
    sdk.ownListings.update({
        id: listingId,
        title: title,
        availabilityPlan: availabilityPlan,
        price: rate,
        geolocation: new LatLng(latitude, longitude),
        publicData: {
          serviceType: serviceType,
          zip: zip,
          preferences: preferences,
          experience: experience,
          educationLevel: educationLevel,
          travelRadius: travelRadius,
          listingType: "service",
          expirationDate: expirationDate.getTime(),
        },
      }, {expand: true}
    ).then(response => {
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        reject(Error('Expected a response from the sdk'));
      }

      const respId = entities[0].id;
      for (const exception of exceptions) {
        saveAvailabilityException({...exception, listingId: respId});
      }

      resolve("Success");
    }).catch(e => {
      throw e;
    });
  })
};

export const getListings = () => (dispatch, getState, sdk) => {
  return sdk.ownListings.query({})
    .then(response => {
      console.log("listings retrieved");
      //TODO only return listing of type service
      return dispatch(fetchServicesSuccess({data: response.data.data}));
    }).catch(e => {
      dispatch(fetchServicesError({error: storableError(e)}));
      throw e;
    });
};

//TODO do we need this function?
export const removeAvailabilityException = params => (dispatch, getState, sdk) => {
  return sdk.availabilityExceptions
    .delete(params, {expand: true})
    .then(response => {
      const availabilityException = response.data.data;
      return availabilityException;
      //return dispatch(deleteAvailabilityExceptionSuccess({ data: availabilityException }));
    })
    .catch(e => {
      //dispatch(deleteAvailabilityExceptionError({ error: storableError(e) }));
      throw e;
    });
};

export const saveAvailabilityException = params => (dispatch, getState, sdk) => {
  return sdk.availabilityExceptions
    .create(params, {expand: true})
    .then(response => {
      const availabilityException = response.data.data;
      return availabilityException;
      //return dispatch(addAvailabilityExceptionSuccess({ data: availabilityException }));
    })
    .catch(e => {
      //dispatch(addAvailabilityExceptionError({ error: storableError(e) }));
      throw e;
    });
};

export const requestFetchAvailabilityExceptions = fetchParams => (dispatch, getState, sdk) => {
  dispatch(fetchAvailabilityExceptionsRequest(fetchParams));

  return sdk.availabilityExceptions
    .query(fetchParams, {expand: true})
    .then(response => {
      const availabilityExceptions = denormalisedResponseEntities(response);
      return dispatch(fetchAvailabilityExceptionsSuccess({data: availabilityExceptions}));
    })
    .catch(e => {
      return dispatch(fetchAvailabilityExceptionsError({error: storableError(e)}));
    });
};

export const clearForm = params => (dispatch, getState, sdk) => {
  dispatch(setInitialValues(initialState));
  dispatch(getListings());
}
