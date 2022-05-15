import merge from 'lodash/merge';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import { currentUserShowSuccess } from '../../ducks/user.duck';

// ================ Action types ================ //

export const SAVE_CONTACT_DETAILS_REQUEST = 'app/ContactDetailsPage/SAVE_CONTACT_DETAILS_REQUEST';
export const SAVE_CONTACT_DETAILS_SUCCESS = 'app/ContactDetailsPage/SAVE_CONTACT_DETAILS_SUCCESS';
export const SAVE_USER_ERROR = 'app/ContactDetailsPage/SAVE_USER_ERROR';
export const SAVE_EMAIL_ERROR = 'app/ContactDetailsPage/SAVE_EMAIL_ERROR';

export const SAVE_CONTACT_DETAILS_CLEAR = 'app/ContactDetailsPage/SAVE_CONTACT_DETAILS_CLEAR';

// ================ Reducer ================ //

const initialState = {
  saveEmailError: null,
  saveUserError: null,
  saveContactDetailsInProgress: false,
  contactDetailsChanged: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SAVE_CONTACT_DETAILS_REQUEST:
      return {
        ...state,
        saveContactDetailsInProgress: true,
        saveUserError: null,
        saveEmailError: null,
        contactDetailsChanged: false,
      };
    case SAVE_CONTACT_DETAILS_SUCCESS:
      return { ...state, saveContactDetailsInProgress: false, contactDetailsChanged: true };
    case SAVE_EMAIL_ERROR:
      return { ...state, saveContactDetailsInProgress: false, saveEmailError: payload}
    case SAVE_USER_ERROR:
      return { ...state, saveContactDetailsInProgress: false, saveUserError: payload };

    case SAVE_CONTACT_DETAILS_CLEAR:
      return {
        ...state,
        saveContactDetailsInProgress: false,
        saveUserError: null,
        saveEmailError: null,
        contactDetailsChanged: false,
      };

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const saveContactDetailsRequest = () => ({ type: SAVE_CONTACT_DETAILS_REQUEST });
export const saveContactDetailsSuccess = () => ({ type: SAVE_CONTACT_DETAILS_SUCCESS });
export const saveEmailError = error => ({
  type: SAVE_EMAIL_ERROR,
  payload: error,
  error: true,
});
export const saveUserError = error => ({
  type: SAVE_USER_ERROR,
  payload: error,
  error: true,
});

export const saveContactDetailsClear = () => ({ type: SAVE_CONTACT_DETAILS_CLEAR });

// ================ Thunks ================ //
const requestSaveUser = params => (dispatch, getState, sdk) => {
  const {
    firstName,
    lastName,
    phone,
    birthday,
    address1,
    address2,
    city,
    state,
    zip,
    preferences,
  } = params;

  return sdk.currentUser.updateProfile({
      firstName: firstName,
      lastName: lastName,
      protectedData: {
        birthday: birthday,
        phoneNumber: phone,
        streetAddress1: address1,
        streetAddress2: address2,
        city: city,
        state: state,
        zip: zip,
      },
      publicData: {
        preferences: preferences,
      }
    },
    {expand: true}
  ).then(response => {
    const entities = denormalisedResponseEntities(response);
    if(entities.length !== 1) {
      throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
    }

    // Return currentUser
    return entities[0];
  }).catch(e => {
    dispatch(saveUserError(storableError(e)));
    throw e;
  });
};

const saveUser = params => (dispatch, getState, sdk) => {
  return (
    dispatch(requestSaveUser(params))
      .then(user => {
        dispatch(currentUserShowSuccess(user));
        dispatch(saveContactDetailsSuccess());
      })
      // error action dispatched in requestSaveEmail
      .catch(e => null)
  );
};

/**
 * Make a email update request to the API and return the current user.
 */
const requestSaveEmail = params => (dispatch, getState, sdk) => {
  const { email, currentPassword } = params;

  return sdk.currentUser
    .changeEmail(
      { email, currentPassword },
      {
        expand: true,
        include: ['profileImage'],
        'fields.image': ['variants.square-small', 'variants.square-small2x'],
      }
    )
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        throw new Error('Expected a resource in the sdk.currentUser.changeEmail response');
      }

      const currentUser = entities[0];
      return currentUser;
    })
    .catch(e => {
      dispatch(saveEmailError(storableError(e)));
      // pass the same error so that the SAVE_CONTACT_DETAILS_SUCCESS
      // action will not be fired
      throw e;
    });
};

export const saveInfo = params => (dispatch, getState, sdk) => {
  dispatch(saveContactDetailsRequest());
  const {email, currentEmail, currentPassword} = params;

  if(email !== currentEmail) {
    const promises = [
      dispatch(requestSaveEmail({email, currentPassword})),
      dispatch(requestSaveUser(params)),
    ]

    return Promise.all(promises)
      .then(values => {
        const saveEmailUser = values[0];
        const saveInfoUser= values[1];

        const protectedData = saveInfoUser.attributes.profile.protectedData;
        const mergeSource = {attributes: {profile: { protectedData}}};

        const currentUser = merge(saveEmailUser, mergeSource);
        dispatch(currentUserShowSuccess(currentUser));
        dispatch(saveContactDetailsSuccess());
      }).catch(e => null);
  } else {
    return dispatch(saveUser(params));
  }
}



