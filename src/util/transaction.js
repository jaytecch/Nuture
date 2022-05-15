import {ensureTransaction} from './data';
import reverse from "lodash/reverse";
import sortBy from "lodash/sortBy";
import * as moment from "moment";

/**
 * Transitions
 *
 * These strings must sync with values defined in Flex API,
 * since transaction objects given by API contain info about last transitions.
 * All the actions in API side happen in transitions,
 * so we need to understand what those strings mean.
 */

// Transitions Specific to Job Listing Path
export const TRANSITION_HIRE_FOR_JOB = 'transition/hire-for-job';
export const TRANSITION_DECLINE_HIRE_CONFIRM = 'transition/decline-hire-confirm';
export const TRANSITION_ACCEPT_HIRE_CONFIRM = 'transition/accept-hire-confirm';
export const TRANSITION_EXPIRE_HIRE_CONFIRM = 'transition/expire-hire-confirm';

// Transitions Specific to Booking request path
export const TRANSITION_ENQUIRE = 'transition/enquire';
export const TRANSITION_NEW_BOOKING_REQUEST = 'transition/new-booking-request';
export const TRANSITION_NEW_BOOKING_REQUEST_AFTER_ENQUIRY = 'transition/new-booking-request-after-enquiry';
export const TRANSITION_ACCEPT = 'transition/accept';
export const TRANSITION_DECLINE = 'transition/decline';
export const TRANSITION_EXPIRE = 'transition/expire';

// Common Transitions
export const TRANSITION_CANCEL = 'transition/cancel';
export const TRANSITION_COMPLETE = 'transition/complete';
export const TRANSITION_REVIEW = 'transition/review';
export const TRANSITION_EXPIRE_REVIEW_PERIOD = 'transition/expire-review-period';
export const TRANSITION_REFUND_FROM_COMPLETED_SERVICE = 'transition/refund-from-completed-service';
export const TRANSITION_REFUND_FROM_REVIEWED = 'transition/refund-from-reviewed';
export const TRANSITION_REFUND_FROM_NOT_REVIEWED = 'transition/refund-from-not_reviewed';
export const TRANSITION_DISABLE_CANCEL = 'transition/disable-cancel';

/**
 * Actors
 *
 * There are 4 different actors that might initiate transitions:
 */

// Roles of actors that perform transaction transitions
export const TX_TRANSITION_ACTOR_CUSTOMER = 'customer';
export const TX_TRANSITION_ACTOR_PROVIDER = 'provider';
export const TX_TRANSITION_ACTOR_OPERATOR = 'operator';
export const TX_TRANSITION_ACTOR_SYSTEM = 'system';

export const TX_TRANSITION_ACTORS = [
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  TX_TRANSITION_ACTOR_OPERATOR,
  TX_TRANSITION_ACTOR_SYSTEM,
];

/**
 * States
 *
 * These constants are only for making it clear how transitions work together.
 * You should not use these constants outside of this file.
 *
 * Note: these states are not in sync with states used transaction process definitions
 *       in Marketplace API. Only last transitions are passed along transaction object.
 */
const STATE_INITIAL = 'initial';
const STATE_ENQUIRY = 'enquiry';
const STATE_PREAUTHORIZED_HIRED_JOB_REQUEST = 'preauthorized-hired-job-request';
const STATE_REFUNDED = 'refunded';
const STATE_DECLINED = 'declined';
const STATE_ACCEPTED = 'accepted';
const STATE_CANCELED = 'canceled';
const STATE_COMPLETED_SERVICE = 'completed-service';
const STATE_REVIEWED = 'reviewed';
const STATE_ACCEPTED_NO_CANCEL = 'accepted-no-cancel';
const STATE_PREAUTHORIZED_BOOKING_REQUEST = 'preauthorized-booking-request';
const STATE_NOT_REVIEWED = 'not-reviewed';

/**
 * Description of transaction process
 *
 * You should keep this in sync with transaction process defined in Marketplace API
 *
 * Note: we don't use yet any state machine library,
 *       but this description format is following Xstate (FSM library)
 *       https://xstate.js.org/docs/
 */
const stateDescription = {
  // id is defined only to support Xstate format.
  // However if you have multiple transaction processes defined,
  // it is best to keep them in sync with transaction process aliases.
  id: 'nurtureup/release-1',

  // This 'initial' state is a starting point for new transaction
  initial: STATE_INITIAL,

  // States
  states: {
    [STATE_INITIAL]: {
      on: {
        [TRANSITION_ENQUIRE]: STATE_ENQUIRY,
        [TRANSITION_NEW_BOOKING_REQUEST]: STATE_PREAUTHORIZED_BOOKING_REQUEST,
        [TRANSITION_HIRE_FOR_JOB]: STATE_PREAUTHORIZED_HIRED_JOB_REQUEST,
      },
    },
    [STATE_ENQUIRY]: {
      on: {
        [TRANSITION_NEW_BOOKING_REQUEST_AFTER_ENQUIRY]: STATE_PREAUTHORIZED_BOOKING_REQUEST,
      },
    },

    [STATE_PREAUTHORIZED_BOOKING_REQUEST]: {
      on: {
        [TRANSITION_DECLINE]: STATE_DECLINED,
        [TRANSITION_EXPIRE]: STATE_DECLINED,
        [TRANSITION_ACCEPT]: STATE_ACCEPTED,
      },
    },

    [STATE_PREAUTHORIZED_HIRED_JOB_REQUEST]: {
      on: {
        [TRANSITION_ACCEPT_HIRE_CONFIRM]: STATE_ACCEPTED,
        [TRANSITION_DECLINE_HIRE_CONFIRM]: STATE_DECLINED,
        [TRANSITION_EXPIRE_HIRE_CONFIRM]: STATE_DECLINED,
      },
    },

    [STATE_DECLINED]: {},
    [STATE_ACCEPTED]: {
      on: {
        [TRANSITION_CANCEL]: STATE_CANCELED,
        [TRANSITION_DISABLE_CANCEL]: STATE_ACCEPTED_NO_CANCEL,
      },
    },

    [STATE_CANCELED]: {},
    [STATE_ACCEPTED_NO_CANCEL]: {
      on: {
        [TRANSITION_COMPLETE]: STATE_COMPLETED_SERVICE,
      },
    },

    [STATE_COMPLETED_SERVICE]: {
      on: {
        [TRANSITION_EXPIRE_REVIEW_PERIOD]: STATE_NOT_REVIEWED,
        [TRANSITION_REFUND_FROM_COMPLETED_SERVICE]: STATE_REFUNDED,
        [TRANSITION_REVIEW]: STATE_REVIEWED,
      },
    },

    [STATE_REVIEWED]: {
      type: 'final',
      on: {
        [TRANSITION_REFUND_FROM_REVIEWED]: STATE_REFUNDED,
      },
    },
    [STATE_NOT_REVIEWED]: {
      type: 'final',
      on: {
        [TRANSITION_REFUND_FROM_NOT_REVIEWED]: STATE_REFUNDED,
      },
    },
    [STATE_REFUNDED]: { type: 'final' },
  },
};

// Note: currently we assume that state description doesn't contain nested states.
const statesFromStateDescription = description => description.states || {};

// Get all the transitions from states object in an array
const getTransitions = states => {
  const stateNames = Object.keys(states);

  const transitionsReducer = (transitionArray, name) => {
    const stateTransitions = states[name] && states[name].on;
    const transitionKeys = stateTransitions ? Object.keys(stateTransitions) : [];
    return [
      ...transitionArray,
      ...transitionKeys.map(key => ({ key, value: stateTransitions[key] })),
    ];
  };

  return stateNames.reduce(transitionsReducer, []);
};

// This is a list of all the transitions that this app should be able to handle.
export const TRANSITIONS = getTransitions(statesFromStateDescription(stateDescription)).map(
  t => t.key
);

// This function returns a function that has given stateDesc in scope chain.
const getTransitionsToStateFn = stateDesc => state =>
  getTransitions(statesFromStateDescription(stateDesc))
    .filter(t => t.value === state)
    .map(t => t.key);

// Get all the transitions that lead to specified state.
const getTransitionsToState = getTransitionsToStateFn(stateDescription);

// This is needed to fetch transactions that need response from provider.
// I.e. transactions which provider needs to accept or decline
export const transitionsToRequested = getTransitionsToState(STATE_PREAUTHORIZED_BOOKING_REQUEST);

/**
 * Helper functions to figure out if transaction is in a specific state.
 * State is based on lastTransition given by transaction object and state description.
 */

const txLastTransition = tx => ensureTransaction(tx).attributes.lastTransition;

export const txIsEnquired = tx =>
  getTransitionsToState(STATE_ENQUIRY).includes(txLastTransition(tx));

// Note: state name used in Marketplace API docs (and here) is actually preauthorized
// However, word "requested" is used in many places so that we decided to keep it.
export const txIsRequested = tx =>
  getTransitionsToState(STATE_PREAUTHORIZED_BOOKING_REQUEST).includes(txLastTransition(tx));

export const txIsHireRequested = tx =>
  getTransitionsToState(STATE_PREAUTHORIZED_HIRED_JOB_REQUEST).includes(txLastTransition(tx));

export const txIsAccepted = tx =>
  getTransitionsToState(STATE_ACCEPTED).includes(txLastTransition(tx));

export const txIsDeclined = tx =>
  getTransitionsToState(STATE_DECLINED).includes(txLastTransition(tx));

export const txIsCanceled = tx =>
  getTransitionsToState(STATE_CANCELED).includes(txLastTransition(tx));

export const txIsDelivered = tx =>
  getTransitionsToState(STATE_COMPLETED_SERVICE).includes(txLastTransition(tx));

export const txIsReviewed = tx =>
  getTransitionsToState(STATE_REVIEWED).includes(txLastTransition(tx));

export const txIsDisableCancel = tx =>
  getTransitionsToState(STATE_ACCEPTED_NO_CANCEL).includes(txLastTransition(tx));

/**
 * Helper functions to figure out if transaction has passed a given state.
 * This is based on transitions history given by transaction object.
 */

const txTransitions = tx => ensureTransaction(tx).attributes.transitions || [];
const hasPassedTransition = (transitionName, tx) =>
  !!txTransitions(tx).find(t => t.transition === transitionName);

const hasPassedStateFn = state => tx =>
  getTransitionsToState(state).filter(t => hasPassedTransition(t, tx)).length > 0;

export const txHasBeenAccepted = hasPassedStateFn(STATE_ACCEPTED);
export const txHasBeenDelivered = hasPassedStateFn(STATE_COMPLETED_SERVICE);

/**
 * Other transaction related utility functions
 */

export const transitionIsReviewed = transition =>
  getTransitionsToState(STATE_REVIEWED).includes(transition);

// Check if a transition is the kind that should be rendered
// when showing transition history (e.g. ActivityFeed)
// The first transition and most of the expiration transitions made by system are not relevant
export const isRelevantPastTransition = transition => {
  return [
    TRANSITION_ACCEPT,
    TRANSITION_ACCEPT_HIRE_CONFIRM,
    TRANSITION_DISABLE_CANCEL,
    TRANSITION_CANCEL,
    TRANSITION_COMPLETE,
    TRANSITION_DECLINE_HIRE_CONFIRM,
    TRANSITION_DECLINE,
    TRANSITION_EXPIRE,
    TRANSITION_REVIEW,
  ].includes(transition);
};

export const isCustomerReview = transition => {
  return [TRANSITION_REVIEW,].includes(transition);
};

export const getUserTxRole = (currentUserId, transaction) => {
  const tx = ensureTransaction(transaction);
  const customer = tx.customer;
  if (currentUserId && currentUserId.uuid && tx.id && customer.id) {
    // user can be either customer or provider
    return currentUserId.uuid === customer.id.uuid
      ? TX_TRANSITION_ACTOR_CUSTOMER
      : TX_TRANSITION_ACTOR_PROVIDER;
  } else {
    throw new Error(`Parameters for "userIsCustomer" function were wrong.
      currentUserId: ${currentUserId}, transaction: ${transaction}`);
  }
};

export const txRoleIsProvider = userRole => userRole === TX_TRANSITION_ACTOR_PROVIDER;
export const txRoleIsCustomer = userRole => userRole === TX_TRANSITION_ACTOR_CUSTOMER;

export const rollupTransaction = txs => {
  const uniqKeys = [...new Set(txs.map( tx => {
    const {attributes, relationships} = tx;
    const {provider, customer, listing} = relationships;
    const createdAt = moment(attributes.createdAt).format('llll');
    return JSON.stringify([createdAt,  provider.data.id, customer.data.id, listing.data.id]);
  }))];

  return uniqKeys.reduce((finalArr, key) => {
    const filtered = txs.filter(entry => {
      const {attributes, relationships} = entry;
      const {provider, customer, listing} = relationships;
      const createdAt = moment(attributes.createdAt).format('llll');
      const entryKey = JSON.stringify([createdAt, provider.data.id, customer.data.id, listing.data.id]);

      return entryKey === key;
    })

    return [...finalArr, filtered.map(tx => tx.id)];
  }, []);
}

export const sortTransactions = txs =>
  reverse(
    sortBy(txs, tx => {
      return tx.attributes ? tx.attributes.lastTransitionedAt : null;
    })
  );
