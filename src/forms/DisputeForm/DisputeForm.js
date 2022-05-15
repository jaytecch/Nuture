import React from "react";
import css from './DisputeForm.css';
import { Form as FinalForm } from 'react-final-form';
import {FieldSelect, FieldTextInput, Form, PrimaryButton} from "../../components";
import {injectIntl} from "react-intl";
import {compose} from "redux";
import * as validators from '../../util/validators';
import {string, func, arrayOf } from 'prop-types';


const DisputeFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        intl,
        handleSubmit,
        handleClose,
        disputeTypes,
        invalid,
      } = formRenderProps;

      const onClose = e => {
        e.preventDefault();
        handleClose();
      }

      const onDisputeTypeChange = (value, props) => {
        const {form} = props;
        form.change('disputeType', value);
      }

      return (
        <Form
          onSubmit={handleSubmit}
        >
          <FieldSelect
            id="disputeType"
            name="disputeType"
            onChange={value => onDisputeTypeChange(value, formRenderProps)}
            className={css.select}
            validate={validators.required("Please select a dispute type.")}
          >
            <option disabled value="">Select Dispute Type</option>
            {disputeTypes.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </FieldSelect>

          <FieldTextInput
            id="message"
            name="message"
            type="textarea"
            label="Reason for dispute:"
            rows='5'
            className={css.textArea}
            validate={validators.required("A dispute explanation is required.")}
          />

          <div className={css.buttonGroup}>
            <PrimaryButton className={css.button} onClick={onClose}>Cancel</PrimaryButton>
            <PrimaryButton className={css.button} type="submit" disabled={invalid}>Send</PrimaryButton>
          </div>
        </Form>
      )
    }}
  />
);

DisputeFormComponent.defaultProps = {
  disputeTypes: ["General"],
}

DisputeFormComponent.propTypes = {
  handleClose: func.isRequired,
  disputeTypes: arrayOf(string)
};

const DisputeForm = compose(
  injectIntl
)(DisputeFormComponent);

export default DisputeForm;
