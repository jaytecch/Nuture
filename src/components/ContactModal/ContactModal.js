import React from "react";
import css from "./ContactModal.css"
import {compose} from "redux";
import {bool, func} from "prop-types";
import {manageDisableScrolling} from "../../ducks/UI.duck";
import {connect} from "react-redux";
import {Modal, Form, FieldTextInput, PrimaryButton} from '../../components';
import {Form as FinalForm} from 'react-final-form';
import {propTypes} from "../../util/types";
import {ensureCurrentUser} from "../../util/data";
import * as validators from "../../util/validators";
import {FormattedMessage, injectIntl} from "../../util/reactIntl";

export const ContactModalComponent = props => {
  const {
    isOpen,
    onManageDisableScrolling,
    onClose,
    currentUser,
    intl,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const {id, attributes} = user || {};
  const {profile} = attributes || {};
  const {firstName, lastName, protectedData} = profile || {}
  const {email} = protectedData || {};
  const fullName = id ? firstName + " " + lastName : null;

  // name
  const nameLabel = intl.formatMessage({id: 'ContactModal.nameLabel'});
  const namePlaceholder = intl.formatMessage({id: 'ContactModal.namePlaceholder'});
  const nameRequiredMessage = intl.formatMessage({id: 'ContactModal.nameRequired'});
  const nameRequired = validators.required(nameRequiredMessage);

  // email
  const emailLabel = intl.formatMessage({id: 'ContactModal.emailLabel'});
  const emailPlaceholder = intl.formatMessage({id: 'ContactModal.emailPlaceholder'});
  const emailRequired = validators.required(intl.formatMessage({id: 'ContactModal.emailRequired'}));
  const emailValid = validators.emailFormatValid(intl.formatMessage({id: 'ContactModal.emailInvalid'}));

  // subject
  const subjectLabel = intl.formatMessage({id: 'ContactModal.subjectLabel'});
  const subjectPlaceholder = intl.formatMessage({id: 'ContactModal.subjectPlaceholder'});

  // message
  const messageLabel = intl.formatMessage({id: 'ContactModal.messageLabel'});
  const messagePlaceholder = intl.formatMessage({id: 'ContactModal.messagePlaceholder'});
  const messageRequired = validators.required(intl.formatMessage({id: 'ContactModal.messageRequired'}));

  const onSubmit = values => {
    const jsonMessage = {
      ...values,
      userId: id,
    }

    console.log("Sending Contact Message: " + JSON.stringify(jsonMessage));
    onClose();
    // TODO handling of sending a real email.
  }

  return (
    <Modal
      id="contactModal"
      isOpen={isOpen}
      onClose={onClose}
      onManageDisableScrolling={onManageDisableScrolling}
    >
      <h1 className={css.title}>
        <FormattedMessage id={'ContactModal.title'} />
      </h1>

      <FinalForm
        onSubmit={onSubmit}
        render={fieldRenderProps => {
          const {
            handleSubmit,
            invalid
          } = fieldRenderProps;

          return (
            <Form onSubmit={handleSubmit}>
              <FieldTextInput
                className={css.textInput}
                id="name"
                name="name"
                type="text"
                placeholder={namePlaceholder}
                validate={nameRequired}
                initialValue={fullName}
              />

              <FieldTextInput
                className={css.textInput}
                id="email"
                name="email"
                type="email"
                placeholder={emailPlaceholder}
                validate={validators.composeValidators(emailRequired, emailValid)}
                initialValue={email}
              />

              <FieldTextInput
                className={css.textInput}
                id="subject"
                name="subject"
                type="text"
                placeholder={subjectPlaceholder}
              />

              <FieldTextInput
                className={css.messageArea}
                inputRootClass={css.messageAreaRoot}
                id="message"
                name="message"
                type="textarea"
                label={messageLabel}
                placeholder={messagePlaceholder}
                validate={messageRequired}
              />

              <div className={css.buttonGroup}>
                <PrimaryButton>
                  Cancel
                </PrimaryButton>

                <PrimaryButton type="submit" disabled={invalid}>
                  Send Message
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
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
  connect(null, mapDispatchToProps),
  injectIntl
)(ContactModalComponent);

export default ContactModal;
