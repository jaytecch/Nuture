
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import config from '../../config';


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
  const { type, payload } = action;
  switch (type) {
    case SAVE_BACKGROUND_INFO_REQUEST:
      return {
        ...state,
        saveBackgroundInfoInProgress: true,
        saveBackgroundInfoError: null,
        contactDetailsChanged: false,
      };
    case SAVE_BACKGROUND_INFO_SUCCESS:
      return { ...state, saveBackgroundInfoInProgress: false, contactDetailsChanged: true };
    case SAVE_BACKGROUND_INFO_ERROR:
      return { ...state, saveBackgroundInfoInProgress: false, saveBackgroundInfoError: payload };

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
export const saveContactDetailsRequest = () => ({ type: SAVE_BACKGROUND_INFO_REQUEST });
export const saveContactDetailsSuccess = () => ({ type: SAVE_BACKGROUND_INFO_SUCCESS });
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

  return dispatch(runBackgroundCheck(params))
    .then(response => {
      //console.log('BEFORE SAVE, response = ' + JSON.stringify(response));
      if(response.status == 201 || response.status == 200) {
        return sdk.currentUser
          .updateProfile(
            //{ privateData: { firstName, lastName, middleName, noMiddleName, dateOfBirth, ssn, zip, licenseNumber, licenseState, background_timestamp, typedSignature } },
            {privateData: {background_timestamp, typedSignature, backgroundInvestigationSubmitted}},
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
      }
      return response;
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
  const { email, currentEmail, phoneNumber, currentPhoneNumber, currentPassword } = params;
};

/**
 *
 * Function to create a report in Checkr
 */
function createReport(id) {
return new Promise((resolve, reject) => {
  let candidateData = {
    candidate_id: id,
    package: 'driver_pro'
  };

  let xhr = new window.XMLHttpRequest();
  xhr.open('POST', 'https://cors-anywhere.herokuapp.com/https://api.checkr.com/v1/reports');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader("X-User-Agent", "Checkr.2.0.0.js");
  xhr.setRequestHeader("Authorization", "Basic " + btoa(config.checkr.secretKey));

  let response = '';
  xhr.onload = function () {


    if ((xhr.status != 201 && xhr.status != 200)) { // analyze HTTP status of the response
      console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found


      let jsonResponse = JSON.parse(xhr.responseText);
      let errorText = jsonResponse.error;

      response = {status: xhr.status, text: xhr.statusText, error: errorText};

      reject(response);


    } else { // show the result
      console.log(`Done, got ${xhr.response.length} bytes`); // response is the server

      let jsonResponse = JSON.parse(xhr.responseText);

      response= {status: xhr.status, text: xhr.statusText};
      resolve(response);
    }

  };
  xhr.send(JSON.stringify(candidateData));
})
  }

/**
 * Function to start background investigation process.
 * @param params
 * @returns {function(*, *, *): Promise<string>}
 */
export const runBackgroundCheck = params => (dispatch, getState, sdk) => {
  return new Promise((resolve, reject) => {

    let xhr = new window.XMLHttpRequest();
    let candidateData = {
      first_name: params.firstName,
      middle_name: params.middleName ? params.middleName : null,
      no_middle_name: params.middleName ? false : true,
      last_name: params.lastName,
      ssn: params.ssn,
      zipcode: params.zip,
      email: params.email,
      phone: params.phoneNumber,
      dob: params.dateOfBirth,
      driver_license_number: params.licenseNumber,
      driver_license_state: params.licenseState
    };

    xhr.open('POST', 'https://cors-anywhere.herokuapp.com/https://api.checkr.com/v1/candidates');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("X-User-Agent", "Checkr.2.0.0.js");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(config.checkr.secretKey));

    let response = {};
    xhr.onload = function () {


      if ((xhr.status != 201 && xhr.status != 200)) { // analyze HTTP status of the response
        console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found


        let jsonResponse = JSON.parse(xhr.responseText);
        let errorText = jsonResponse.error;

        response = {status: xhr.status, text: xhr.statusText, error: errorText};
        reject(response);
      } else { // show the result
        console.log(`Done, got ${xhr.response.length} bytes`); // response is the server


        let jsonResponse = JSON.parse(xhr.responseText);

        createReport(jsonResponse.id)
          .then(candidateResponse => {
            response = candidateResponse;

            resolve(candidateResponse);
          })
          .catch(e => {
            console.log("Error, submit again");
          });
      }

    };

    xhr.send(JSON.stringify(candidateData));

  })

}
