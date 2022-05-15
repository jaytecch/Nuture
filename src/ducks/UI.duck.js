// ================ Action types ================ //

export const DISABLE_SCROLLING = 'app/UI/DISABLE_SCROLLING';

export const SET_LOGIN_MODAL = 'app/UI/SET_LOGIN_MODAL';

// ================ Reducer ================ //

const initialState = {
  disableScrollRequests: [],
  loginModalOpen: false
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case DISABLE_SCROLLING: {
      const { componentId, disableScrolling } = payload;
      const disableScrollRequests = state.disableScrollRequests;
      const componentIdExists = disableScrollRequests.find(c => c.componentId === componentId);

      if (componentIdExists) {
        const disableScrollRequestArray = disableScrollRequests.map(c => {
          return c.componentId === componentId ? { ...c, disableScrolling } : c;
        });
        return { ...state, disableScrollRequests: [...disableScrollRequestArray] };
      }

      const disableScrollRequestArray = [
        ...disableScrollRequests,
        { componentId, disableScrolling },
      ];
      return {
        ...state,
        disableScrollRequests: disableScrollRequestArray,
      };
    }
    case SET_LOGIN_MODAL:
      return {...state, loginModalOpen: payload};

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const manageDisableScrolling = (componentId, disableScrolling) => ({
  type: DISABLE_SCROLLING,
  payload: { componentId, disableScrolling },
});

export const setIsLoginModalOpen = (value) => ({
  type: SET_LOGIN_MODAL,
  payload: {value}
})

// ================ Selectors ================ //

export const isScrollingDisabled = state => {
  const { disableScrollRequests } = state.UI;
  return disableScrollRequests.some(r => r.disableScrolling);
};

export const isLoginModalOpen = state => {
  const {loginModalOpen} = state.UI;
  return loginModalOpen;
};
