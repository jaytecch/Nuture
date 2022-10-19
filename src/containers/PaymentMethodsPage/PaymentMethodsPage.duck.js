import {fetchCurrentUser} from '../../ducks/user.duck';
import {
  setInitialValues as setInitialValuesForPaymentMethods, stripeCustomerCreateError,
  stripeCustomerCreateSuccess
} from '../../ducks/paymentMethods.duck';
import {storableError} from '../../util/errors';
import * as log from '../../util/log';
import {chargeProSubscription} from "../../util/api";
//import config from "../../config";
//import { stripePublishableKey, stripeCountryDetails } from '../../stripe-config';
// ================ Action types ================ //

export const SETUP_INTENT_REQUEST = 'app/PaymentMethodsPage/SETUP_INTENT_REQUEST';
export const SETUP_INTENT_SUCCESS = 'app/PaymentMethodsPage/SETUP_INTENT_SUCCESS';
export const SETUP_INTENT_ERROR = 'app/PaymentMethodsPage/SETUP_INTENT_ERROR';

export const STRIPE_CUSTOMER_REQUEST = 'app/PaymentMethodsPage/STRIPE_CUSTOMER_REQUEST';
export const STRIPE_CUSTOMER_SUCCESS = 'app/PaymentMethodsPage/STRIPE_CUSTOMER_SUCCESS';
export const STRIPE_CUSTOMER_ERROR = 'app/PaymentMethodsPage/STRIPE_CUSTOMER_ERROR';

export const STRIPE_SUBSCRIPTION_SUCCESS = 'app/PaymentMethodsPage/STRIPE_SUBSCRIPTION_SUCCESS';
export const STRIPE_SUBSCRIPTION_ERROR = 'app/PaymentMethodsPage/STRIPE_SUBSCRIPTION_ERROR';


// ================ Reducer ================ //

const initialState = {
  setupIntentInProgress: false,
  setupIntentError: null,
  setupIntent: null,
  stripeCustomerFetched: false,
  stripeSubscriptionError: null,
};

export default function payoutMethodsPageReducer(state = initialState, action = {}) {
  const {type, payload} = action;
  switch (type) {
    case SETUP_INTENT_REQUEST:
      return {...state, setupIntentInProgress: true, setupIntentError: null};
    case SETUP_INTENT_SUCCESS:
      return {
        ...state,
        setupIntentInProgress: false,
        setupIntentError: null,
        setupIntent: payload,
      };
    case SETUP_INTENT_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return {...state, setupIntentInProgress: false, setupIntentError: null};
    case STRIPE_CUSTOMER_REQUEST:
      return {...state, stripeCustomerFetched: false};
    case STRIPE_CUSTOMER_SUCCESS:
      return {...state, stripeCustomerFetched: true};
    case STRIPE_CUSTOMER_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return {...state, stripeCustomerFetchError: payload};
    case STRIPE_SUBSCRIPTION_ERROR:
      return {...state, stripeSubscriptionError: payload};
    case STRIPE_SUBSCRIPTION_SUCCESS:
        return {...state, stripeSubscriptionError: null};
    default:
      return state;
  }
}

// ================ Action creators ================ //

export const setupIntentRequest = () => ({type: SETUP_INTENT_REQUEST});
export const setupIntentSuccess = () => ({type: SETUP_INTENT_SUCCESS});
export const setupIntentError = e => ({
  type: SETUP_INTENT_ERROR,
  error: true,
  payload: e,
});

export const stripeCustomerRequest = () => ({type: STRIPE_CUSTOMER_REQUEST});
export const stripeCustomerSuccess = () => ({type: STRIPE_CUSTOMER_SUCCESS});
export const stripeCustomerError = e => ({
  type: STRIPE_CUSTOMER_ERROR,
  error: true,
  payload: e,
});

export const stripeSubscriptionSuccess = () => ({type: STRIPE_SUBSCRIPTION_SUCCESS});
export const stripeSubscriptionError = e => ({
  type: STRIPE_SUBSCRIPTION_ERROR,
  payload: e,
})
// ================ Thunks ================ //

export const createStripeSetupIntent = () => (dispatch, getState, sdk) => {
  dispatch(setupIntentRequest());
  return sdk.stripeSetupIntents
    .create()
    .then(response => {
      const setupIntent = response.data.data;
      dispatch(setupIntentSuccess(setupIntent));
      return setupIntent;
    })
    .catch(e => {
      const error = storableError(e);
      log.error(error, 'create-setup-intent-failed', null);
      dispatch(setupIntentError(error));
      return {createStripeSetupIntentSuccess: false};
    });
};

export const stripeCustomer = () => (dispatch, getState, sdk) => {
  dispatch(stripeCustomerRequest());

  return dispatch(fetchCurrentUser({include: ['stripeCustomer.defaultPaymentMethod']}))
    .then(response => {
      dispatch(stripeCustomerSuccess());
    })
    .catch(e => {
      const error = storableError(e);
      log.error(error, 'fetch-stripe-customer-failed', null);
      dispatch(stripeCustomerError(error));
    });
};

export const loadData = () => (dispatch, getState, sdk) => {
  dispatch(setInitialValuesForPaymentMethods());

  return dispatch(stripeCustomer());
};

export const chargeProFee = (stripeCustomer) => (dispatch, getState, sdk) => {
  return chargeProSubscription({customer: stripeCustomer})
    .then(response => {
      console.log("Pro Subscription charged: " + JSON.stringify(response))
      dispatch(stripeSubscriptionSuccess());
    })
    .catch(e => {
      const error = storableError(e);
      log.error(error,"Charge error: ", null);
      dispatch(stripeSubscriptionError(e));
      throw(e);
    })

  // let xhr = new window.XMLHttpRequest();
  // xhr.open('POST', 'https://api.stripe.com/v1/subscriptions');
  // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  // xhr.setRequestHeader("Authorization", "Bearer " + 'sk_test_J2myicLNeifTwWiHpVkSe2lq007CMJEiYt');
  //
  // xhr.onload = function() {
  //   if ((xhr.status != 201 && xhr.status != 200)) { // analyze HTTP status of the response
  //     console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
  //     return xhr.statusText;
  //   } else { // show the result
  //     console.log(`Done, got ${xhr.response.length} bytes`); // response is the server
  //
  //     console.log(xhr.responseText);
  //
  //     let jsonResponse = JSON.parse(xhr.responseText);
  //     console.log(jsonResponse);
  //     console.log(jsonResponse.id);
  //
  //   }
  // }
  //
  // let urlString = "customer=" + stripeCustomer + "&items[0][price]=price_1HbHdZIrnAaeNNsZioZ6VUpY"
  // xhr.send(urlString);
};
