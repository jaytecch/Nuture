import React, {useState} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {propTypes} from '../../util/types';
import {LoginForm} from '../../forms';
import {
  isLoginModalOpen,
  isScrollingDisabled,
  setIsLoginModalOpen,
  manageDisableScrolling
} from "../../ducks/UI.duck";
import {login, authenticationInProgress} from "../../ducks/Auth.duck";
import {FormattedMessage} from "react-intl";
import {bool, func} from "prop-types";
import {
  Modal,
} from '../../components'
import css from './LoginModal.css';
import {withRouter} from "react-router-dom";

export const LoginModalComponent = props => {
  const {
    authInProgress,
    loginError,
    submitLogin,
    onManageDisableScrolling,
    handleLoginModalClose,
    isOpen,
    history,
  } = props;

  const onSubmit = creds => {
    submitLogin(creds, history)
  }

  const loginErrorMessage = (
    <div className={css.error}>
      <FormattedMessage id="AuthenticationPage.loginFailed"/>
    </div>
  );

  const errorMessage = loginError ? loginErrorMessage : null;

  return (
    <Modal
      id="loginModal"
      isOpen={isOpen}
      onClose={handleLoginModalClose}
      onManageDisableScrolling={onManageDisableScrolling}
    >
      <div className={css.root}>
        {errorMessage}
        <LoginForm className={css.form} onSubmit={onSubmit} inProgress={authInProgress}/>
      </div>
    </Modal>
  );
}

LoginModalComponent.defaultProps = {
  currentUser: null,
  loginError: null,
  sendVerificationEmailError: null,
  isOpen: false,
};

LoginModalComponent.propTypes = {
  authInProgress: bool.isRequired,
  loginError: propTypes.error,
  scrollingDisabled: bool.isRequired,
  submitLogin: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  handleLoginModalClose: func.isRequired,
  isOpen: bool,
};

const mapStateToProps = state => {
  const {loginError} = state.Auth;
  return {
    authInProgress: authenticationInProgress(state),
    loginError,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const mapDispatchToProps = dispatch => ({
  submitLogin: ({email, password}, history) => dispatch(login(email, password, history)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const LoginModal = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter,
)(LoginModalComponent);

export default LoginModal;
