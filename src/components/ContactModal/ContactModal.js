import React, {useState} from "react";
import css from "./ContactModal.css"
import {compose} from "redux";
import {bool, func} from "prop-types";
import {manageDisableScrolling} from "../../ducks/UI.duck";
import {connect} from "react-redux";
import {Modal} from '../../components';
import {propTypes} from "../../util/types";
import {FormattedMessage, injectIntl} from "../../util/reactIntl";
import {ContactForm} from "../../forms";
import {contactNU} from "../../util/api";

export const ContactModalComponent = props => {
  const {
    isOpen,
    onManageDisableScrolling,
    onClose,
    currentUser,
  } = props;

  const [error, setError] = useState(null);

  const handleSubmit = values => {
    setError(null);

    contactNU({...values, emailType: 'CONTACT-US'})
      .then(response => {
        console.log("Email response: " + JSON.stringify(response))
        onClose();
      })
      .catch(e => {
        console.log("Contact us error: ", e);
        setError("There was an error sending your message. Please try again");
      })
  }

  const handleClose = () => {
    setError(null);
    onClose();
  }

  return (
    <Modal
      id="contactModal"
      isOpen={isOpen}
      onClose={handleClose}
      onManageDisableScrolling={onManageDisableScrolling}
    >
      <h1 className={css.title}>
        <FormattedMessage id={'ContactModal.title'} />
      </h1>

      {error ? <p className={css.error}>{error}</p> : null}

      <ContactForm
        currentUser={currentUser}
        handleSubmit={handleSubmit}
      />
    </Modal>
  )
};

ContactModalComponent.defaultProps = {
  isOpen: false,
  currentUser: null,
}

ContactModalComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  onClose: func.isRequired,
  isOpen: bool,
  currentUser: propTypes.currentUser,
}

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
})

const ContactModal = compose(
  connect(null, mapDispatchToProps)
)(ContactModalComponent);

export default ContactModal;
