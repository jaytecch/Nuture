import {createBackgroundCandidate, createBackgroundReport} from "../../util/api";
import {denormalisedResponseEntities} from '../../util/data';
import {storableError} from '../../util/errors';
import config from '../../config';
const publicIp = require('public-ip');


// ================ Action types ================ //
export const SAVE_BACKGROUND_INFO_REQUEST = 'app/ContactDetailsPage/SAVE_BACKGROUND_INFO_REQUEST';
export const SAVE_BACKGROUND_INFO_SUCCESS = 'app/ContactDetailsPage/SAVE_BACKGROUND_INFO_SUCCESS';
export const SAVE_BACKGROUND_INFO_ERROR = 'app/ContactDetailsPage/SAVE_BACKGROUND_INFO_ERROR';
export const SAVE_BACKGROUND_INFO_CLEAR = 'app/ContactDetailsPage/SAVE_BACKGROUND_INFO_CLEAR';
export const CREATE_CANDIDATE_REQUEST = 'app/ContactDetailsPage/CREATE_CANDIDATE';

// ================ Reducer ================ //

const initialState = {
  saveBackgroundInfoError: null,
  saveBackgroundInfoInProgress: false,
  contactDetailsChanged: false,
  reportResponse: null,
  candidateResponse: null,
};

export default function reducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SAVE_BACKGROUND_INFO_REQUEST:
      return {
        ...state,
        saveBackgroundInfoInProgress: true,
        saveBackgroundInfoError: null,
        contactDetailsChanged: false,
      };
    case SAVE_BACKGROUND_INFO_SUCCESS:
      return {...state, saveBackgroundInfoInProgress: false, contactDetailsChanged: true};
    case SAVE_BACKGROUND_INFO_ERROR:
      return {...state, saveBackgroundInfoInProgress: false, saveBackgroundInfoError: payload};

    case SAVE_BACKGROUND_INFO_CLEAR:
      return {
        ...state,
        saveBackgroundInfoInProgress: false,
        saveBackgroundInfoError: null,
        contactDetailsChanged: false,
      };

    default:
      return state;
  }
}

// ================ Action creators ================ //
export const saveContactDetailsRequest = () => ({type: SAVE_BACKGROUND_INFO_REQUEST});
export const saveContactDetailsSuccess = () => ({type: SAVE_BACKGROUND_INFO_SUCCESS});
export const saveBackgroundInfoError = error => ({
  type: SAVE_BACKGROUND_INFO_ERROR,
  payload: error,
  error: true,
});

// ================ Thunks ================ //

/**
 * Save background timestamp and status
 */
export const requestSaveBackgroundInfo = params => (dispatch, getState, sdk) => {
  //console.log('PARAMS = ' + JSON.stringify(params));
  const background_timestamp = params.timestamp;
  const backgroundInvestigationSubmitted = 'true';
  const typedSignature = params.typedSignature;
  const copy_requested = params.copyChecked;

  let client_signature_ip = 'unknown';

  publicIp.v4() .then(response => {
    //console.log('*********** response for IP = ' + response);
    client_signature_ip = response;
  })

  return dispatch(runBackgroundCheck(params))
    .then(response => {
      return sdk.currentUser
        .updateProfile(
          //{ privateData: { firstName, lastName, middleName, noMiddleName, dateOfBirth, ssn, zip, licenseNumber, licenseState, background_timestamp, typedSignature } },
          {privateData: {background_timestamp, typedSignature, backgroundInvestigationSubmitted, client_signature_ip, copy_requested }},
          {
            expand: true,
            include: ['profileImage'],
            'fields.image': ['variants.square-small', 'variants.square-small2x'],
          }
        )
        .then(response => {
          const entities = denormalisedResponseEntities(response);
          if (entities.length !== 1) {
            throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
          }

          const currentUser = entities[0];
          return currentUser;
        })
        .catch(e => {
          console.log("Error, submit again");
        })
    })
    .catch(e => {
      console.log("Error, submit again");
      dispatch(saveBackgroundInfoError(storableError(e)));
      // pass the same error so that the SAVE_CONTACT_DETAILS_SUCCESS
      // action will not be fired
      throw e;
    });
};


/**
 * Update contact details, actions depend on which data has changed
 */
export const saveContactDetails = params => (dispatch, getState, sdk) => {
  dispatch(saveContactDetailsRequest());
  const {email, currentEmail, phoneNumber, currentPhoneNumber, currentPassword} = params;
};

/**
 * Function to start background investigation process.
 * @param params
 * @returns {function(*, *, *): Promise<string>}
 */
export const runBackgroundCheck = params => (dispatch, getState, sdk) => {
  return createBackgroundCandidate(params)
    .then(response => {
      return createBackgroundReport(response.data.id)
        .then(response => {
          return response.data;
        })
        .catch(e => {
          console.log("ERROR creating report");
          throw e;
        })
    })
    .catch(e => {
      console.log("ERROR creating candidate");
      throw e;
    })
}
