import React from 'react';
import {string, bool, arrayOf, object} from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { Form, PrimaryButton, FieldTextInput, IconEnquiry, FieldSelect } from '../../components';
import * as validators from '../../util/validators';
import { propTypes } from '../../util/types';

import css from './EnquiryForm.css';
import {getServiceType} from "../../nurtureUpLists";

const EnquiryFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        submitButtonWrapperClassName,
        formId,
        handleSubmit,
        inProgress,
        intl,
        listingTitle,
        authorDisplayName,
        sendEnquiryError,
        listings,
      } = fieldRenderProps;

      const listingLabel = intl.formatMessage({id: 'EnquiryForm.listingLabel'});
      const listingPlaceholder = intl.formatMessage({id: 'EnquiryForm.listingPlaceholder'})

      const messageLabel = intl.formatMessage(
        {
          id: 'EnquiryForm.messageLabel',
        },
        { authorDisplayName }
      );
      const messagePlaceholder = intl.formatMessage(
        {
          id: 'EnquiryForm.messagePlaceholder',
        },
        { authorDisplayName }
      );
      const messageRequiredMessage = intl.formatMessage({
        id: 'EnquiryForm.messageRequired',
      });
      const messageRequired = validators.requiredAndNonEmptyString(messageRequiredMessage);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <IconEnquiry className={css.icon} />
          <h2 className={css.heading}>
            {listingTitle != 'no title' ? <FormattedMessage id="EnquiryForm.heading" values={{ listingTitle }} /> :
              <FormattedMessage id="EnquiryForm.noListingTitleHeading" />}

          </h2>
          <FieldSelect
            id="listingId"
            name="listingId"
            label={listingLabel}
          >
            <option value="" disabled>
              {listingPlaceholder}
            </option>
            {listings.map(listing => (
              <option key={listing.id.uuid} value={listing.id.uuid}>
                {getServiceType(listing.serviceType).label}
              </option>
            ))}
          </FieldSelect>
          <FieldTextInput
            className={css.field}
            type="textarea"
            name="message"
            id={formId ? `${formId}.message` : 'message'}
            label={messageLabel}
            placeholder={messagePlaceholder}
            validate={messageRequired}
          />
          <div className={submitButtonWrapperClassName}>
            {sendEnquiryError ? (
              <p className={css.error}>
                <FormattedMessage id="EnquiryForm.sendEnquiryError" />
              </p>
            ) : null}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="EnquiryForm.submitButtonText" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

EnquiryFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  inProgress: false,
  sendEnquiryError: null,
};

EnquiryFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  inProgress: bool,

  listingTitle: string.isRequired,
  authorDisplayName: string.isRequired,
  sendEnquiryError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
  listings: arrayOf(object).isRequired,
};

const EnquiryForm = compose(injectIntl)(EnquiryFormComponent);

EnquiryForm.displayName = 'EnquiryForm';

export default EnquiryForm;
