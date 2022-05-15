import React, {useState} from 'react';
import {injectIntl} from "../../util/reactIntl";
import {compose} from "redux";
import {arrayOf, object, func, bool} from "prop-types";
import css from './TimeSelection.css';
import moment from 'moment';
import TimeSelectionRow from "./TimeSelectionRow";

const TimeSelectionComponent = props => {
  const {
    selectedDates,
    availabilityPlan,
    handleChange,
    isCreateBooking,
    values,
    isMulti,
  } = props;

  return (
    <div className={css.rows}>
      {selectedDates.map(date => {
        const availability = isCreateBooking ?
          availabilityPlan.entries.filter(value => value.date === date.format("L"))
        : availabilityPlan.entries;
        const selectedValues = values.filter(value => value.date.format('L') === date.format('L'));

        return (
          <TimeSelectionRow
            key={date}
            date={date}
            availability={availability}
            handleChange={handleChange}
            values={selectedValues}
            isMulti={isMulti}
          />
        )
      })}
    </div>
  );
};

TimeSelectionComponent.defaultProps = {
  selectedDates: [],
  filterDates: true,
  isMulti: true,
};

TimeSelectionComponent.propTypes = {
  selectedDates: arrayOf(object),
  availabilityPlan: object.isRequired,
  handleChange: func.isRequired,
  isCreate: bool,
  isMulti: bool,
};

const TimeSelection = compose(
  injectIntl,
)(TimeSelectionComponent);

export default TimeSelection;
