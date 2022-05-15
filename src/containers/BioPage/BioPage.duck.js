import {denormalisedResponseEntities} from '../../util/data';
import {storableError} from '../../util/errors';
import {currentUserShowSuccess} from '../../ducks/user.duck';

// ================ Action types ================ //
export const SAVE_BIO_REQUEST = 'app/BioPage/SAVE_BIO_REQUEST';
export const SAVE_BIO_SUCCESS = 'app/BioPage/SAVE_BIO_SUCCESS';
export const SAVE_BIO_ERROR = 'app/BioPage/SAVE_USER_ERROR';
export const SAVE_BIO_CLEAR = 'app/BioPage/SAVE_BIO_CLEAR';

// ================ Reducer ================ //

const initialState = {
  saveBioError: null,
  saveBioInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SAVE_BIO_REQUEST:
      return {...state, saveBioError: null, saveBioInProgress: true};
    case SAVE_BIO_SUCCESS:
      return {...state, saveBioInProgress: false,};
    case SAVE_BIO_ERROR:
      return {...state, saveBioInProgress: false, saveBioError: payload};
    case SAVE_BIO_CLEAR:
      return {...state, saveBioError: null, saveBioInProgress: false};

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const saveBioRequest = () => ({type: SAVE_BIO_REQUEST});
export const saveBioSuccess = () => ({type: SAVE_BIO_SUCCESS});
export const saveBioClear = () => ({type: SAVE_BIO_CLEAR});
export const saveBioError = error => ({
  type: SAVE_BIO_ERROR,
  payload: error,
  error: true,
});

// ================ Thunks ================ //

export const saveBio = params => (dispatch, getState, sdk) => {
    const {
      bio,
      experience,
      travelRadius,
      educationLevel,
      preferences,
    } = params;

    return sdk.currentUser.updateProfile(
      {
        bio: bio,
        publicData: {
          experience: experience,
          travelRadius: travelRadius,
          educationLevel: educationLevel,
          preferences: preferences,
        },
      }, {expand: true}
    ).then(response => {
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        throw new Error('Expected a response from the sdk');
      }
      const user = entities[0];

      dispatch(currentUserShowSuccess(user));
      dispatch(saveBioSuccess());
    }).catch(e => {
      dispatch(saveBioError(storableError(e)));
      throw e;
    });
  }
;

