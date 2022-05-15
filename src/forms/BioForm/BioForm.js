import React, {Component} from "react";
import {bool, string} from 'prop-types';
import {compose} from 'redux';
import {propTypes} from "../../util/types";
import {Form as FinalForm} from 'react-final-form';
import {ensureCurrentUser} from '../../util/data';
import {EDUCATION_LEVELS, PREFERENCES} from "./bioLists";
import arrayMutators from 'final-form-arrays';
import css from './BioForm.css';
import classNames from "classnames";
import isEqual from "lodash/isEqual";
import {FormattedMessage, injectIntl, intlShape} from "../../util/reactIntl";

import {
  FieldSelect,
  FieldTextInput,
  Form,
  PrimaryButton,
  FieldRangeSlider, FieldCheckboxGroup
} from '../../components';

class BioFormComponent extends Component {
  constructor(props) {
    super(props)
    this.submittedValues = {};
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
            currentUser,
            inProgress,
            intl,
            values,
            handleSubmit,
            formId,
            saveBioError,
          } = fieldRenderProps;

          const {bio, experience, travelRadius, educationLevel, preferences} = values;
          const user = ensureCurrentUser(currentUser);
          if (!user.id) {
            return null;
          }

          const attributes = user.attributes || {};
          const {bio: currentBio, publicData} = attributes.profile || {};
          const {
            experience: currentExperience,
            travelRadius: currentTravelRadius,
            educationLevel: currentEducationLevel,
            preferences: currentPreferences,
          } = publicData || {};

          //Bio
          const bioChanged = currentBio !== bio;
          const bioLabel = intl.formatMessage({id: 'BioForm.bioLabel'});
          const bioPlaceHolder = intl.formatMessage({id: 'BioForm.bioPlaceholder'});

          //Experience
          const experienceChanged = JSON.stringify(currentExperience) !== JSON.stringify(experience);
          const experienceLabel = intl.formatMessage({id: 'BioForm.experienceLabel'});

          //Travel Radius
          const travelRadiusChanged = currentTravelRadius !== travelRadius;
          const travelRadiusLabel = intl.formatMessage({id: 'BioForm.travelRadiusLabel'});

          //Education Level
          const educationLevelChanged = currentEducationLevel !== educationLevel;
          const educationLevelLabel = intl.formatMessage({id: 'BioForm.educationLevelLabel'});
          const educationLevelPlaceholder = intl.formatMessage({id: 'BioForm.educationLevelPlaceholder'});

          //Preferences
          const preferencesChanged = JSON.stringify(currentPreferences) !== JSON.stringify(preferences);
          const preferencesLabel = intl.formatMessage({id: 'BioForm.preferencesLabel'});

          const classes = classNames(rootClassName || css.root, className);
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled = pristineSinceLastSubmit || inProgress ||
            !(bioChanged || experienceChanged || travelRadiusChanged || educationLevelChanged
              || preferencesChanged)

          let genericError = null;
          if (saveBioError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="BioForm.genericBioError"/>
              </span>
            );
          }

          const onEducationLevelChange = (value, props) => {
            const {form} = props;
            form.change('educationLevel', value);
          }

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.bioSection}>
                <FieldTextInput
                  className={css.bioInput}
                  type="textarea"
                  rows='5'
                  id={formId ? `${formId}.bio` : 'bio'}
                  name="bio"
                  label={bioLabel}
                  placeholder={bioPlaceHolder}
                />
              </div>

              <div className={css.left}>
                <FieldRangeSlider
                  id={`${formId}.experience`}
                  name="experience"
                  label={experienceLabel}
                  min={0}
                  max={100}
                  step={1}
                  handles={[experience]}
                />

                <FieldRangeSlider
                  id={`${formId}.travelRadius`}
                  name="travelRadius"
                  label={travelRadiusLabel}
                  min={0}
                  max={100}
                  step={1}
                  handles={[travelRadius]}
                />

                <FieldSelect
                  id="educationLevel"
                  name={formId ? `${formId}.educationLevel` : 'educationLevel'}
                  label={educationLevelLabel}
                  onChange={value => onEducationLevelChange(value, fieldRenderProps)}
                >
                  <option disabled value="">
                    {educationLevelPlaceholder}
                  </option>
                  {EDUCATION_LEVELS.map(p => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </FieldSelect>
              </div>

              <div className={css.right}>
                <FieldCheckboxGroup
                  name="preferences"
                  id={`${formId}.preferences`}
                  //label={preferencesLabel}
                  twoColumns={true}
                  options={PREFERENCES}
                />
              </div>

              <div className={css.bottomWrapper}>
                {genericError}
                <PrimaryButton
                  type="submit"
                  inProgress={inProgress}
                  disabled={submitDisabled}
                >
                  <FormattedMessage id="AboutMeForm.saveChanges"/>
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  };
}

BioFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  inProgress: false,
  saveBioError: null,
};

BioFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  inProgress: bool,
  intl: intlShape.isRequired,
  formId: string,
  saveBioError: propTypes.error,
};

const BioForm = compose(injectIntl)(BioFormComponent);

BioForm.displayName = 'BioForm';

export default BioForm;
