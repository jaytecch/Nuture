import React from 'react';
import {compose} from "redux";
import {injectIntl} from "../../util/reactIntl";
import {object, bool, func, arrayOf} from 'prop-types';
import css from "./TimeSelection.css";
import moment from "moment";
import Select from 'react-select';

const getAvailableHours = (selectedValues, timeslot, date) => {
  let {
    startTime,
    endTime
  } = timeslot;
  const possibleHours = [];

  const startZeroTime = moment(startTime).startOf("day");
  const endZeroTime = moment(endTime).startOf("day");

  let currTime = moment(startZeroTime).add(startTime.hours(), 'h');
  let lastHour = moment(endZeroTime).add(endTime.hours(), 'h').add(endTime.minutes(), 'm');
  let count = 0;

  while (currTime.isBefore(lastHour)) {
    const start = currTime.clone();
    const end = currTime.add(1, 'h').clone();
    const label = start.format("h:mm A") + " - " + end.format("h:mm A");

    possibleHours.push({
      value: count,
      label: label,
      start: start.seconds(0).milliseconds(0),
      end: end.seconds(0).milliseconds(0),
      date: date,
    });
    count++;
  }

  return possibleHours;
};

const TimeSelectionRowComponent = props => {
  const {
    date,
    availability,
    intl,
    handleChange,
    values,
    isMulti,
  } = props;

  const timeslot = availability.find(timeslot => timeslot.dayOfWeek === date.format('ddd').toLowerCase());
  const availHours = getAvailableHours(values, timeslot, date);
  const stringDate = date.format("MMM Do YYYY");
  //const animatedOptions = makeAnimated();

  const onChange = (times, action) => {
    handleChange(times, action, date);
  }

  return (
    <div className={css.row}>
      <div className={css.dateBoxPadding}>
        <div className={css.dateItemBox}>
          <p className={css.dateItem}>{stringDate}</p>
        </div>
      </div>

      <div className={css.hourSelect}>
        <Select
          value={values}
          options={availHours}
          isMulti={isMulti}
          name="timeSelections"
          onChange={onChange}
        />
      </div>
    </div>
  )
}

TimeSelectionRowComponent.defaultProps = {
  availabilityPlan: {},
  values: [],
  isMulti: true,
}

TimeSelectionRowComponent.propTypes = {
  date: object.isRequired,
  availabilityPlan: object,
  handleChange: func.isRequired,
  values: arrayOf(object),
  isMulti: bool,
}

const TimeSelectionRow = compose(
  injectIntl,
)(TimeSelectionRowComponent);

export default TimeSelectionRow;
