import React, {Component, useState} from "react";
import {bool, string, func, arrayOf, shape, object} from 'prop-types';
import {compose} from 'redux';
import {propTypes} from "../../util/types";
import {Form as FinalForm} from 'react-final-form';
import {ensureCurrentUser, ensureListing} from '../../util/data';
import arrayMutators from 'final-form-arrays';
import css from './ServiceForm.css';
import {FormattedMessage, injectIntl} from "../../util/reactIntl";

import {
  EditListingAvailabilityPanel,
  FieldCurrencyInput,
  FieldDateInput,
  FieldSelect,
  Form,
  PrimaryButton
} from '../../components';
import {SERVICE_TYPES} from "../../nurtureUpLists";
import {bookingDateRequired, expirationDateRequired} from "../../util/validators";
import config from "../../config";
import {types as sdkTypes} from "../../util/sdkLoader";
import uuid from "react-uuid";
import {
  dateIsAfter, findNextBoundary, isDayMomentInsideRange,
  isSameDate, resetToStartOfDay,
  timeOfDayFromLocalToTimeZone,
  timeOfDayFromTimeZoneToLocal
} from "../../util/dates";

const {UUID} = sdkTypes;

const TODAY = new Date();
const MAX_AVAILABILITY_EXCEPTIONS_RANGE = 365;

// Format form's value for the react-dates input: convert timeOfDay to the local time
const formatFieldDateInput = timezone => v =>
  v && v.date ? { date: timeOfDayFromTimeZoneToLocal(v.date, timezone) } : { date: v };

// Parse react-dates input's value: convert timeOfDay to the given time zone
const parseFieldDateInput = timezone => v =>
  v && v.date ? { date: timeOfDayFromLocalToTimeZone(v.date, timezone) } : v;

const onServiceTypeChange = (value, props) => {
  const {form} = props;
  form.change('serviceType', value);
}

// Ensure that AvailabilityExceptions are in sensible order.
// NOTE: this sorting can only be used for non-paginated list of exceptions (page size is max 100)
const sortExceptionsByStartTime = (a, b) => {
  return a.attributes.start.getTime() - b.attributes.start.getTime();
};

const onExpirationDateChange = (value, props) => {
  const {timezone, form} = props;

  console.log("date change value " + JSON.stringify(value));

  // if(!value || !value.date) {
  //   form.change('expirationDate', {date: null});
  // }

  //const dt = timeOfDayFromLocalToTimeZone(value.date, timezone);

  //form.change('expirationDate', {date: dt});
};

const endOfAvailabilityExceptionRange = (timeZone, date) => {
  return resetToStartOfDay(date, timeZone, MAX_AVAILABILITY_EXCEPTIONS_RANGE - 1);
};

// Convert exceptions list to inverted array of time-ranges that are available for new exceptions.
const getAvailableTimeRangesForExceptions = (exceptions, timeZone) => {
  const nextBoundary = findNextBoundary(timeZone, TODAY);
  const lastBoundary = endOfAvailabilityExceptionRange(timeZone, TODAY);

  // If no exceptions, return full time range as free of exceptions.
  if (!exceptions || exceptions.length < 1) {
    return [{ start: nextBoundary, end: lastBoundary }];
  }

  const sortedExceptions = exceptions.sort(sortExceptionsByStartTime);
  const endOfLastException = sortedExceptions[sortedExceptions.length - 1].attributes.end;

  const initialRangeCollection = dateIsAfter(nextBoundary, sortedExceptions[0].attributes.start)
    ? { prevEnd: null, ranges: [] }
    : { prevEnd: nextBoundary, ranges: [] };

  const invertedExceptionList = sortedExceptions.reduce((collection, ex) => {
    if (collection.prevEnd) {
      // If previous exception end was the same moment as the current exceptions' start,
      // there's no time-range available.
      if (isSameDate(collection.prevEnd, ex.attributes.start)) {
        // Update prevEnd
        return { prevEnd: ex.attributes.end, ranges: collection.ranges };
      }

      const nextRange = { start: collection.prevEnd, end: ex.attributes.start };
      return { prevEnd: ex.attributes.end, ranges: [...collection.ranges, nextRange] };
    } else {
      return { prevEnd: ex.attributes.end, ranges: [] };
    }
  }, initialRangeCollection).ranges;

  // Return inverted exceptions list as available times for new exception.
  // In addition, if there is time between last exception's end time and last boundary,
  // add that as a available time range
  return dateIsAfter(endOfLastException, lastBoundary)
    ? invertedExceptionList
    : [...invertedExceptionList, { start: endOfLastException, end: lastBoundary }];
};

// React Dates calendar needs isDayBlocked function as props
// We check if the day belongs to one of the available time ranges
const isDayBlocked = (availableTimeRanges, timeZone) =>
  availableTimeRanges
    ? day =>
      !availableTimeRanges.find(timeRange =>
        isDayMomentInsideRange(day, timeRange.start, timeRange.end, timeZone)
      )
    : () => false;

const ServiceFormComponent = props => {
    return (
      <FinalForm
        {...props}
        render={fieldRenderProps => {
          const {
            onCancel,
            values,
            initialValues,
            handleSubmit,
            formId,
            intl,
            errors,
            updateInProgress,
            onManageDisableScrolling,
            fetchExceptionsInProgress,
            availabilityExceptions,
            onAddAvailabilityException,
            onDeleteAvailabilityException,
            onUpdateAvailabilityPlan,
            updatedPlan,
            currentListing,
            listingId,
            timezone,
          } = fieldRenderProps;

          // const listing = ensureListing(currentListing);

          const {
            expirationDate = initialValues.expirationDate,
            serviceType = initialValues.serviceType,
            rate = initialValues.rate,
          } = values;

          const submitDisabled =
            !expirationDate ||
            !serviceType ||
            !rate ||
            Object.entries(updatedPlan).length === 0;

          // const attributes = listing.attributes || {}
          // const {price, publicData, availabilityPlan} = attributes
          // const {expirationDate, serviceType:servType} = publicData || {};

          // const [serviceType, setServiceType] = useState(servType);
          // const [validDate, setValidDate] = useState(expirationDate ? new Date(expirationDate) : null)

          //Service Type
          //const serviceTypeChanged = currentServiceType !== serviceType;
          const serviceTypeLabel = intl.formatMessage({id: 'JobListingForm.serviceTypeLabel'});
          const serviceTypePlaceholder = intl.formatMessage({id: 'JobListingForm.serviceTypePlaceholder'});

          // Availability
          //const availabilityChanged = JSON.stringify(currentAvailabilityPlan) !== JSON.stringify(updatedPlan);

          // Expiration Date
          const expirationDateLabel = intl.formatMessage({id: 'ServiceForm.expirationDateLabel'});

          // Get all the available time-ranges for creating new AvailabilityExceptions
          const availableTimeRanges = getAvailableTimeRangesForExceptions(
            availabilityExceptions,
            timezone
          );

          const handleAvailabilitySubmit = values => {
            onUpdateAvailabilityPlan(values.availabilityPlan);
          }

          const availability = (
            <EditListingAvailabilityPanel
              listing={currentListing}
              availPlan={updatedPlan}
              errors={errors}
              updateInProgress={updateInProgress}
              onManageDisableScrolling={onManageDisableScrolling}
              fetchExceptionsInProgress={fetchExceptionsInProgress}
              availabilityExceptions={availabilityExceptions}
              onAddAvailabilityException={onAddAvailabilityException}
              onDeleteAvailabilityException={onDeleteAvailabilityException}
              submitButtonText="Save Availability"
              onSubmit={handleAvailabilitySubmit}
              listingId={listingId}
            />
          );

          const TODAY = new Date();
          // Date formatting used for placeholder texts:
          const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };
          return (
            <Form
              className={css.root}
              onSubmit={handleSubmit}
            >
              <FieldSelect
                id="serviceType"
                name={formId ? `${formId}.serviceType` : "serviceType"}
                label={serviceTypeLabel}
                onChange={value => onServiceTypeChange(value, fieldRenderProps)}
              >
                <option disabled value="">
                  {serviceTypePlaceholder}
                </option>
                {SERVICE_TYPES.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </FieldSelect>

              <FieldDateInput
                className={css.fieldDateInput}
                name="expirationDate"
                id={formId ? `${formId}.expirationDate` : "expirationDate"}
                label={expirationDateLabel}
                placeholderText={intl.formatDate(TODAY, dateFormattingOptions)}
                format={formatFieldDateInput(timezone)}
                parse={parseFieldDateInput(timezone)}
                useMobileMargins
                showErrorMessage={true}
                validate={expirationDateRequired('Required', initialValues.expirationDate)}
                onChange={value => onExpirationDateChange(value, fieldRenderProps)}
                isDayBlocked={isDayBlocked(availableTimeRanges, timezone)}
                initialDate={expirationDate}
              />

              <FieldCurrencyInput
                id={formId ? `${formId}.rate` : "rate"}
                name="rate"
                className={css.rate}
                label={intl.formatMessage({id: 'ServiceForm.rateLabel'})}
                currencyConfig={config.currencyConfig}
              />

              {availability}

              <div className={css.buttonGroup}>
                <PrimaryButton type="submit" disabled={submitDisabled}>
                  <FormattedMessage id="ServiceForm.save"/>
                </PrimaryButton>
                <PrimaryButton type="button" onClick={onCancel}>
                  <FormattedMessage id="ServiceForm.cancel"/>
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
}

ServiceFormComponent.defaultProps = {
  formId: "",
  inProgress: false,
  availabilityExceptions: [],
  updatedPlan: {},
}

ServiceFormComponent.propTypes = {
  formId: string,
  onCancel: func.isRequired,
  onSubmit: func.isRequired,

  availabilityExceptions: arrayOf(propTypes.availabilityException),
  fetchExceptionsInProgress: bool.isRequired,
  onAddAvailabilityException: func.isRequired,
  onDeleteAvailabilityException: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onUpdateAvailabilityPlan: func.isRequired,
  updatedPlan: object,

  errors: shape({
    addExceptionError: object,
    deleteExceptionError: object,
    showListingError: object,
    fetchExceptionsError: object,
    updateListingError: object,
  }).isRequired,
  updateInProgress: bool.isRequired,
  listingId:object.isRequired,
  timezone: string.isRequired,
};

const ServiceForm = compose(injectIntl)(ServiceFormComponent);

ServiceForm.displayName = 'ServiceForm';

export default ServiceForm;
