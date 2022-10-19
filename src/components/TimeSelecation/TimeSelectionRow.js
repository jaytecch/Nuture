import React, {useState} from 'react';
import {compose} from "redux";
import {injectIntl} from "../../util/reactIntl";
import {object, bool, func, arrayOf} from 'prop-types';
import css from "./TimeSelection.css";
import moment from "moment";
import Select from 'react-select';

const getAvailableHours = (timeslot, date) => {
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

const getStartAvailHours = (timeslot, date) => {
  let {startTime, endTime} = timeslot;
  const startHours = [];

  const startZeroTime = moment(startTime).startOf("day");
  const endZeroTime = moment(endTime).startOf("day");

  let currTime = moment(startZeroTime).add(startTime.hours(), 'h');
  let lastHour = moment(endZeroTime).add(endTime.hours(), 'h').add(endTime.minutes(), 'm');
  let count = 0;

  while (currTime.isBefore(lastHour)) {
    const time = currTime.clone();
    const label = time.format("h:mm A");

    startHours.push({
      value: count,
      label: label,
      ms: time.seconds(0).milliseconds(0),
      date: date,
    });
    count++;

    currTime.add(1, 'h');
  }

  return startHours;
}

const getEndAvailHours = (start, timeslot, date) => {
  const endHours = [];
  if(start) {
    let {startTime, endTime} = timeslot;
    const startZeroTime = moment(startTime).startOf("day");
    const endZeroTime = moment(endTime).startOf("day");

    let currTime = moment(startZeroTime).add(startTime.hours(), 'h');
    let lastHour = moment(endZeroTime).add(endTime.hours(), 'h').add(endTime.minutes(), 'm');
    let count = 0;

    while (currTime.isBefore(lastHour)) {
      const time = currTime.clone();
      const difference = moment.duration(time.diff(start.ms)).asHours();

      if (difference > 3) {
        const label = time.format("h:mm A");

        endHours.push({
          value: count,
          label: label,
          ms: time.seconds(0).milliseconds(0),
          date: date,
        });
      }

      count++;
      currTime.add(1, 'h');
    }
  }

  return endHours;
}

const getValues = (values, isToFrom) => {
  if (isToFrom) {
    if(values[0]) {
      const value = values[0];
      const start = {
        value: value.value,
        label: value.start.format("h:mm A"),
        ms: value.start,
        date: value.date
      }
      const end = {
        value: value.value + 3,
        label: value.end.format("h:mm A"),
        ms: value.end,
        date: value.date
      }

      return {start, end};
    }
    return {};
  }

  return values;
}


const TimeSelectionRowComponent = props => {
  const {
    date,
    availability,
    intl,
    handleChange,
    values,
    isMulti,
    isToFrom,
  } = props;

  const [state, setState] = useState({
    endDisabled: !values[0],
    origValues: getValues(values, isToFrom)
  })

  const timeslot = availability.find(timeslot => timeslot.dayOfWeek === date.format('ddd').toLowerCase());
  const availHours = getAvailableHours(timeslot, date);
  const stringDate = date.format("MMM Do YYYY");
  //const animatedOptions = makeAnimated();
  let startHours = isToFrom ? getStartAvailHours(timeslot, date) : {};
  let endHours = isToFrom ? getEndAvailHours(state.origValues.start, timeslot, date) : {};

  const onChange = (times, action) => {
    handleChange(times, action, date);
    setState({...state, origValues: times});
  }

  const onStartChange = (time, action) => {
    if (action.action === 'select-option') {
      setState({
        endDisabled: false,
        origValues: {start: time, end: null}
      });
    } else if (action.action === 'remove-value') {

    } else if (action.action === 'clear') {

    }
  }

  const onEndChange = (time, action) => {
    if (action.action === 'select-option') {
      const start = state.origValues.start;
      const label = start.ms.format("h:mm A") + " - " + time.ms.format("h:mm A");

      const selectedTime = {
        value: start.count,
        label: label,
        start: start.ms,
        end: time.ms,
        date: start.date,
      };
      onChange(selectedTime, action, date);
      setState({...state, origValues: {start, end:time}});
    } else if (action.action === 'remove-value') {

    } else if (action.action === 'clear') {

    }
  }

  return (
    <div className={css.row}>
      <div className={css.dateBoxPadding}>
        <div className={css.dateItemBox}>
          <p className={css.dateItem}>{stringDate}</p>
        </div>
      </div>

      {isToFrom ? (
        <div className={css.toFromGroup}>
          <div className={css.toFromHour}>
            <Select
              value={state.origValues.start}
              options={startHours}
              isMulti={false}
              name="startSelection"
              onChange={onStartChange}
            />
          </div>
          <h3 className={css.toFromDivider}>to</h3>
          <div className={css.toFromHour}>
            <Select
              value={state.origValues.end}
              options={endHours}
              isMulti={false}
              name="endSelection"
              onChange={onEndChange}
              isDisabled={state.endDisabled}
            />
          </div>
        </div>
      ) : (
        <div className={css.hourSelect}>
          <Select
            value={state.origValues}
            options={availHours}
            isMulti={isMulti}
            name="timeSelections"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  )
}

TimeSelectionRowComponent.defaultProps = {
  availabilityPlan: {},
  values: [],
}

TimeSelectionRowComponent.propTypes = {
  date: object.isRequired,
  availabilityPlan: object,
  handleChange: func.isRequired,
  values: arrayOf(object),
  isMulti: bool.isRequired,
  isToFrom: bool.isRequired
}

const TimeSelectionRow = compose(
  injectIntl,
)(TimeSelectionRowComponent);

export default TimeSelectionRow;
