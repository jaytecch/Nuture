import React, {Component, useState} from "react";
import {compose} from 'redux';
import {propTypes} from "../../util/types";
import {bool, func, string, arrayOf, shape, object} from 'prop-types';
import {Form as FinalForm} from 'react-final-form';
import css from './JobListingForm.css';
import {FormattedMessage, injectIntl} from "react-intl";
import {intlShape} from "../../util/reactIntl";
import {EDUCATION_LEVELS, PREFERENCES, SERVICE_TYPES} from '../../nurtureUpLists';
import {
  FieldCheckboxGroup,
  FieldRangeSlider, FieldSelect,
  FieldTextInput,
  Form,
  PrimaryButton
} from "../../components";
import classNames from "classnames";
import * as validators from "../../util/validators";
import arrayMutators, {update} from 'final-form-arrays';
import SetScheduleSection from "./SetScheduleSection";


class JobListingFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduledIsEdited: false
    }
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        mutators={{...arrayMutators}}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            intl,
            handleSubmit,
            formId,
            values,
            initialValues,
            inProgress,
            errors,
            updateInProgress,
            onManageDisableScrolling,
            onUpdateAvailabilityPlan,
            updatedPlan,
            maybeDeletes,
            onSetMaybeDeletes,
            onCancel,
            hasErrors,
            isNewListing,
          } = fieldRenderProps;

          const classes = classNames(rootClassName || css.root, className);
          const [initialPlanEntries, setInitialPlanEntries] = useState(updatedPlan.entries);


          const {
            title = initialValues.title,
            description = initialValues.description,
            serviceType = initialValues.serviceType,
            zip = initialValues.zip,
            preferences = initialValues.preferences,
            experience = initialValues.experience || [0],
            educationLevel = initialValues.educationLevel,
          } = values;

          const {
            title: currentTitle,
            description: currentDescription,
            serviceType: currentServiceType,
            zip: currentZip,
            preferences: currentPreferences,
            experience: currentExperience,
            educationLevel: currentEducationLevel,
          } = initialValues || {};

          const isPristine =
            title === currentTitle &&
            description === currentDescription &&
            serviceType === currentServiceType &&
            zip === currentZip &&
            (currentExperience && (experience[0] === currentExperience[0])) &&
            educationLevel === currentEducationLevel &&
            JSON.stringify(preferences) === JSON.stringify(currentPreferences) &&
            JSON.stringify(updatedPlan.entries) === JSON.stringify(initialPlanEntries) &&
            !this.state.scheduledIsEdited;

          const submitDisabled =
            isPristine ||
            inProgress ||
            !(title && description && zip && preferences && experience && educationLevel && serviceType) ||
            (updatedPlan.entries && updatedPlan.entries.length === 0);

          //Title
          const titleLabel = intl.formatMessage({id: 'JobListingForm.titleLabel'});
          const titlePlaceholder = intl.formatMessage({id: 'JobListingForm.titlePlaceholder'});

          //Job Description
          const jobDescriptionLabel = intl.formatMessage({id: 'JobListingForm.jobDescriptionLabel'});
          const jobDescriptionPlaceholder = intl.formatMessage({id: 'JobListingForm.jobDescriptionPlaceholder'});

          //Zip
          const zipLabel = intl.formatMessage({id: 'JobListingForm.zipLabel'});
          const zipPlaceholder = intl.formatMessage({id: 'JobListingForm.zipPlaceholder'});
          const zipInvalidMessage = intl.formatMessage({id: 'SignupForm.addressZipInvalid'});
          const zipValid = validators.addressZipFormatValid(zipInvalidMessage);
          const zipReal = validators.realZip(zipInvalidMessage);

          //Preferences
          const preferencesLabel = intl.formatMessage({id: 'JobListingForm.preferencesLabel'});

          //Experience
          const experienceLabel = intl.formatMessage({id: 'JobListingForm.experienceLabel'}, {years: experience});

          //Education Level
          const educationLevelLabel = intl.formatMessage({id: 'JobListingForm.educationLabel'});
          const educationLevelPlaceholder = intl.formatMessage({id: 'JobListingForm.educationPlaceholder'});

          //Service Type
          const serviceTypeLabel = intl.formatMessage({id: 'JobListingForm.serviceTypeLabel'});
          const serviceTypePlaceholder = intl.formatMessage({id: 'JobListingForm.serviceTypePlaceholder'});

          const handleScheduleSubmit = (values, toDelete=[]) => {
            const newPlan = {...updatedPlan, entries: values};
            onUpdateAvailabilityPlan(newPlan);
            onSetMaybeDeletes(toDelete);
            this.setState({scheduleIsEdited: true});
          };


          const onSelectFieldChange = (value, fieldName, props) => {
            const {form} = props;
            form.change(fieldName, value);
          }

          return (
            <Form
              className={classes}
              onSubmit={e => {
                handleSubmit(e);
              }}
            >
              <FieldTextInput
                className={css.title}
                id={formId ? `${formId}.title` : "title"}
                type="text"
                name="title"
                label={titleLabel}
                placeholder={titlePlaceholder}
              />

              <FieldTextInput
                className={css.descriptionInput}
                type="textarea"
                rows='5'
                id={formId ? `${formId}.description` : 'description'}
                name="description"
                label={jobDescriptionLabel}
                placeholder={jobDescriptionPlaceholder}
              />

              <div className={css.belowDescrSection}>
                <FieldSelect
                  className={css.visualSpace}
                  name="serviceType"
                  id={formId ? `${formId}.serviceType`: "serviceType"}
                  label={serviceTypeLabel}
                  onChange={value => onSelectFieldChange(value, 'serviceType', fieldRenderProps)}
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

                <FieldTextInput
                  className={css.zip}
                  type="text"
                  id={formId ? `${formId}.zip` : 'zip'}
                  name="zip"
                  autoComplete="postal-code"
                  label={zipLabel}
                  placeholder={zipPlaceholder}
                  validate={validators.composeValidators(zipValid, zipReal)}
                />
              </div>

              <FieldCheckboxGroup
                className={css.preferences}
                name="preferences"
                id={formId ? `${formId}.preferences` : "preferences"}
                label={preferencesLabel}
                twoColumns={true}
                options={PREFERENCES}
              />

              <div className={css.belowPrefsSection}>
                <FieldRangeSlider
                  className={css.visualSpace}
                  id={formId ? `${formId}.experience` : "experience"}
                  name="experience"
                  label={experienceLabel}
                  min={0}
                  max={100}
                  step={1}
                  handles={[experience]}
                />

                <FieldSelect
                  className={css.visualSpace}
                  id="educationLevel"
                  name={formId ? `${formId}.educationLevel` : "educationLevel"}
                  label={educationLevelLabel}
                  onChange={value => onSelectFieldChange(value, 'educationLevel', fieldRenderProps)}
                >
                  <option disabled value="">
                    {educationLevelPlaceholder}
                  </option>
                  {EDUCATION_LEVELS.map(p => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </FieldSelect>
              </div>

              <SetScheduleSection
                className={css.setSchedule}
                onSubmit={handleScheduleSubmit}
                onManageDisableScrolling={onManageDisableScrolling}
                initialPlan={updatedPlan}
                maybeDeletes={maybeDeletes}
                serviceType={currentServiceType}
              />

              {hasErrors ? (
                <p className={css.error}>
                  <FormattedMessage id="JobListingFrom.submitError" />
                </p>
              ) : null}

              <div className={css.bottomWrapper}>
                <PrimaryButton
                  type="button"
                  onClick={onCancel}
                  className={css.cancelButton}
                >
                  <FormattedMessage id="JobListingForm.cancel" />
                </PrimaryButton>
                <div className={css.buttonSpacing} />
                <PrimaryButton
                  type="submit"
                  inProgress={inProgress}
                  disabled={submitDisabled}
                >
                  {isNewListing ? <FormattedMessage id="JobListingForm.submitJobListing"/>
                  : <FormattedMessage id="JobListingForm.updateJobListing"/>}
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  };
}

JobListingFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  inProgress: false,
  availabilityExceptions: [],
  updatedPlan: {},
  initialValues: {},
};

JobListingFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  intl: intlShape.isRequired,
  formId: string,
  inProgress: bool,

  availabilityExceptions: arrayOf(propTypes.availabilityException),
  onManageDisableScrolling: func.isRequired,
  onUpdateAvailabilityPlan: func.isRequired,

  errors: shape({
    showListingError: object,
    fetchExceptionsError: object,
    updateListingError: object,
    jobListingsError: object,
    createJobError: object,
  }).isRequired,
  updateInProgress: bool.isRequired,
  initialValues: object,
};

const JobListingForm = compose(
  injectIntl
)(JobListingFormComponent);

export default JobListingForm;
