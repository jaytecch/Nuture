import React, {useEffect, useState} from "react";
import {compose} from "redux";
import {withRouter} from "react-router-dom";
import {injectIntl} from "../../util/reactIntl";
import {
  PrimaryButton,
  ManageAvailabilityCalendar,
  TimeSelection,
} from '../../components';
import css from './JobListingForm.css';
import classNames from 'classnames';
import {types as sdkTypes} from "../../util/sdkLoader";
import * as moment from "moment";
import {func, object, string} from 'prop-types';
import Modal from "../../components/Modal/Modal";

const defaultAvailabilityPlan = {
  type: 'availability-plan/time',
  timezone: "America/New_York",
  entries: [
    {
      dayOfWeek: 'mon',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },
    {
      dayOfWeek: 'tue',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },
    {
      dayOfWeek: 'wed',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },
    {
      dayOfWeek: 'thu',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },
    {
      dayOfWeek: 'fri',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },
    {
      dayOfWeek: 'sat',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },
    {
      dayOfWeek: 'sun',
      startTime: moment().startOf('day'),
      endTime: moment().endOf('day'),
      seats: 1
    },

  ],
};

/*
  Combine timeslots that are consecutive. i.e. 2-3 and 3-4 should be combined to
  2-4.
 */
const rollupTimeslots = (selectedTimeSlots) => {
  let rolledUpTimeslots = [];

  selectedTimeSlots.forEach(time => {
    const filteredTimeslots = rolledUpTimeslots.filter(timeslot => timeslot.date.isSame(time.date));

    if (filteredTimeslots.length > 0) {
      const addBeforeIndex = filteredTimeslots.findIndex(timeslot => timeslot.start.isSame(time.end));
      const addAfterIndex = filteredTimeslots.findIndex(timeslot => timeslot.end.isSame(time.start));

      // Place time between to timeslots to create one
      if (addBeforeIndex >= 0 && addAfterIndex >= 0) {
        rolledUpTimeslots[addAfterIndex].end = rolledUpTimeslots[addBeforeIndex].end;
        rolledUpTimeslots[addAfterIndex].label =
          rolledUpTimeslots[addAfterIndex].start.format("h:mm") + " - " +
          rolledUpTimeslots[addBeforeIndex].end.format("h:mm");
        rolledUpTimeslots = rolledUpTimeslots.splice(addBeforeIndex, 1);

        //Place time after timeslot to create one
      } else if (addAfterIndex >= 0) {
        rolledUpTimeslots[addAfterIndex].end = time.end;
        rolledUpTimeslots[addAfterIndex].label =
          rolledUpTimeslots[addAfterIndex].start.format("h:mm") + " - " + time.end.format("h:mm");

        //Place time before timeslot to create one
      } else if (addBeforeIndex >= 0) {
        rolledUpTimeslots[addBeforeIndex].start = time.start;
        rolledUpTimeslots[addBeforeIndex].label =
          time.start.format("h:mm") + " - " + rolledUpTimeslots[addBeforeIndex].end.format("h:mm");
      } else {
        rolledUpTimeslots.push(time);
      }
    } else {
      rolledUpTimeslots.push(time);
    }
  })

  return rolledUpTimeslots;
};

const defaultState = {
  section: 1,
  selectedDates: [],
  selectedTimeSlots: [],
  timeslotsToDelete: [],
  availabilityPlan: defaultAvailabilityPlan,
  isModalOpen: false,
};

const SetScheduleSection = props => {
  const {
    rootClassName,
    className,
    onManageDisableScrolling,
    initialPlan,
    onSubmit,
    intl,
    maybeDeletes,
    serviceType,
  } = props;

  const classes = classNames(rootClassName || css.root, className)

  const planEntries = initialPlan.entries || [];
  const dates = planEntries.map(entry => entry.date);
  const uniqueDates = [...new Set(dates.map(date => date.format('L')))];

  const initState = planEntries.length > 0 ? {
    ...defaultState,
    selectedDates: uniqueDates.map(date => moment(date)),
    selectedTimeSlots: planEntries,
    timeslotsToDelete: maybeDeletes
  } : defaultState;

  const [scheduleState, setScheduleState] = useState(initState);

  const title = intl.formatMessage({id: 'JobListingForm.availabilityTitle'})

  const setDates = dates => {
    setScheduleState({...scheduleState, selectedDates: dates});
  }

  const handleNext = (value, e) => {
    e.preventDefault();
    setScheduleState({
      ...scheduleState,
      section: 2,
      selectedDates: value
    });
  };

  const handleGoBack = e => {
    e.preventDefault();
    if (scheduleState.section >= 2) {
      setScheduleState({...scheduleState, section: scheduleState.section - 1});
    }
  }

  const handleDone = e => {
    e.preventDefault();
    const rolledUpTimeslots = rollupTimeslots(scheduleState.selectedTimeSlots);
    setScheduleState({
      ...scheduleState,
      selectedTimeSlots: rolledUpTimeslots,
      section: 1,
      isModalOpen: false
    });
    onSubmit(rolledUpTimeslots, scheduleState.timeslotsToDelete);
  }

  const handleTimeSelection = (times, action, date) => {
    // Handle is called by a specific Date row. selectedTimeSlots stores timeslots from all dates.
    // We need to grab all timeslots from the date of the new selection

    let newSelected;
    const toDeleteList = scheduleState.timeslotsToDelete;
    const actionType = action.action;

    if (actionType === 'select-option') {
      let addedSlot;
      if (serviceType !== "postpartumDoula") {
        newSelected = [...scheduleState.selectedTimeSlots, action.option]
      } else {
        addedSlot = times;
        newSelected = [
          ...scheduleState.selectedTimeSlots.filter(slot => !slot.date.isSame(addedSlot.date)),
          addedSlot,
        ]
      }

    } else if (actionType === 'remove-value') {
      const removedSlot = action.removedValue;
      const toDelete = scheduleState.selectedTimeSlots.find(slot => slot.start.isSame(removedSlot.start))
      if(toDelete.id && !toDeleteList.find(entry => entry.id.uuid === toDelete.id.uuid)) {
            toDeleteList.push(toDelete.id);
      }
      newSelected = scheduleState.selectedTimeSlots.filter(slot => !slot.start.isSame(toDelete.start));
    } else if (actionType === 'clear') {
      newSelected = scheduleState.selectedTimeSlots.filter(slot => !slot.date.isSame(date))
    }


    // const selectedOnDate = times.length > 0 ?
    //   scheduleState.selectedTimeSlots.filter(slot => slot.date.isSame(times[0].date))
    // : scheduleState.selectedTimeSlots;
    //
    // let newSelected;
    // const toDeleteList = scheduleState.timeslotsToDelete;
    //
    // // If the selected dates is greater the values passed in then the user removed a selection
    // if (selectedOnDate.length > times.length) {
    //   const removedDates = selectedOnDate.filter(slot => !times.includes(slot));
    //   newSelected = [...scheduleState.selectedTimeSlots];
    //   removedDates.forEach(toDelete => {
    //     if(toDelete.id && !toDeleteList.find(entry => entry.id.uuid === toDelete.id.uuid)) {
    //       toDeleteList.push(toDelete.id);
    //     }
    //     newSelected = newSelected.filter(slot => !slot.start.isSame(toDelete.start));
    //   });
    // } else {
    //   const addedDates = times.filter(slot => !selectedOnDate.includes(slot));
    //   newSelected = [...scheduleState.selectedTimeSlots, ...addedDates]
    // }

    setScheduleState({
      ...scheduleState,
      selectedTimeSlots: newSelected,
      timeslotsToDelete: toDeleteList
    });
  }

  const selectedTimeList = (
    <div className={css.selectedTimes}>
      <ul>
      {scheduleState.selectedTimeSlots.map(timeslot => {
        const slotLabel = timeslot.date.format("ddd MMM Do YYYY") + ": " +
          timeslot.start.format("h A") + " - " +
          timeslot.end.format("h A");

        return (
          <li key={slotLabel}>{slotLabel}</li>
      )})}
      </ul>
    </div>
  );

  const dateSelection = (
    <div className={css.dateSelection}>
      <div className={css.calendarWrapper}>
        <ManageAvailabilityCalendar
          availability={{calendar: {}}}
          availabilityPlan={scheduleState.availabilityPlan}
          timezone={scheduleState.availabilityPlan.timezone}
          setDates={setDates}
          selectedDates={scheduleState.selectedDates}
        />
      </div>

      <div className={css.buttonGroup}>
        <PrimaryButton
          className={css.actionButton}
          ready={scheduleState.selectedDates.length > 0}
          disabled={scheduleState.selectedDates.length == 0}
          onClick={e => handleNext(scheduleState.selectedDates, e)}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  )

  const timeSelection = (
    <div className={css.timeSelection}>
      <TimeSelection
        selectedDates={scheduleState.selectedDates}
        availabilityPlan={scheduleState.availabilityPlan}
        handleChange={handleTimeSelection}
        isCreateBooking={false}
        values={scheduleState.selectedTimeSlots}
        isMulti={serviceType === "postpartumDoula"}
        isToFrom={serviceType === "postpartumDoula"}
      />

      <div className={css.buttonGroup}>
        <PrimaryButton className={css.actionButton} onClick={handleGoBack}>
          Back
        </PrimaryButton>
        <PrimaryButton
          className={css.actionButton}
          disabled={scheduleState.selectedTimeSlots.length == 0}
          onClick={handleDone}
        >
          Done
        </PrimaryButton>
      </div>
    </div>
  );

  const handleSelectSchedule = e => {
    e.preventDefault();
    setScheduleState({...scheduleState, isModalOpen: true});
  }

  return (
    <div className={classes}>
      <h2 className={css.h2Title}>{title}</h2>
      <PrimaryButton className={css.actionButton} onClick={handleSelectSchedule}>
        {scheduleState.selectedTimeSlots.length > 0 ? "Edit Schedule" : "Select Schedule"}
      </PrimaryButton>

      {scheduleState.selectedTimeSlots.length > 0 ? selectedTimeList : <p className={css.selectedTimes} >No Schedule selected</p>}

      <Modal
        id="selectDatesAndTimesModal"
        isOpen={scheduleState.isModalOpen}
        onClose={() => setScheduleState({...scheduleState, section: 1, isModalOpen: false})}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        {scheduleState.section === 1 ? dateSelection : null}
        {scheduleState.section === 2 ? timeSelection : null}
      </Modal>
    </div>
  );
}

SetScheduleSection.defautlProps = {
  rootClassName: null,
  className: null,
}

SetScheduleSection.propTypes = {
  onManageDisableScrolling: func.isRequired,
  onSubmit: func.isRequired,

  rootClassName: string,
  className: string,
}

export default compose(
  withRouter,
  injectIntl
)(SetScheduleSection);
