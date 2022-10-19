import React from "react";
import css from './ContactForm.css';
import {compose} from "redux";
import {Form as FinalForm} from 'react-final-form';
import {FieldTextInput, Form, Modal, PrimaryButton} from '../../components';
import {injectIntl} from "react-intl";
import * as validators from "../../util/validators";
import {ensureCurrentUser} from "../../util/data";
import {bool, func} from "prop-types";
import {propTypes} from "../../util/types";

const ContactFormComponent = props => {
  const {
    intl,
    currentUser,
    handleSubmit,
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
    handleSubmit(values);
  }

  return (
    <FinalForm
      onSubmit={onSubmit}
      render={fieldRenderProps => {
        const {
          handleSubmit,
          invalid
        } = fieldRenderProps;

        return (
          <Form
            className={css.form}
            onSubmit={handleSubmit}
          >
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

              <div className={css.buttonSpacing}/>

              <PrimaryButton type="submit" disabled={invalid}>
                Send Message
              </PrimaryButton>
            </div>
          </Form>
        );
      }}
    />
  )
};

ContactFormComponent.defaultProps = {
  currentUser: null,
  handleSubmit: null,
}

ContactFormComponent.propTypes = {
  currentUser: propTypes.currentUser,
  handleSubmit: func,
}

const ContactForm = compose(
  injectIntl
)(ContactFormComponent);

export default ContactForm
