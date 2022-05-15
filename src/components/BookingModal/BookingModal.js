import React, {useState} from "react";
import {compose} from "redux";
import {withRouter} from "react-router-dom";
import {injectIntl} from "../../util/reactIntl";
import {getServiceType} from "../../nurtureUpLists";
import {
  PrimaryButton,
  ManageAvailabilityCalendar,
  TimeSelection,
  BookingBreakdown
} from '../../components';
import css from './BookingModal.css';
import classNames from 'classnames';
import {types as sdkTypes} from "../../util/sdkLoader";
import * as moment from "moment";
import zipToTZ from "zipcode-to-timezone";
import {array, func, node, object, oneOfType, string} from 'prop-types';
import {DATE_TYPE_DATETIME, LINE_ITEM_UNITS, propTypes} from '../../util/types';

const {UUID} = sdkTypes;

const defaultAvailabilityPlan = {
  type: 'availability-plan/time',
  timezone: "America/New_York",
  entries: [
    // { dayOfWeek: 'mon', date: '1/1/20', startTime: moment, endTime: moment, seats: 1 },
    // { dayOfWeek: 'tue', date: '1/2/20', startTime: moment, endTime: moment, seats: 1 },
    // { dayOfWeek: 'wed', date: '1/3/20', startTime: moment, endTime: moment, seats: 1 },
    // { dayOfWeek: 'thu', date: '1/4/20', startTime: moment, endTime: moment, seats: 1 },
    // { dayOfWeek: 'fri', date: '1/5/20', startTime: moment, endTime: moment, seats: 1 },
    // { dayOfWeek: 'sat', date: '1/6/20', startTime: moment, endTime: moment, seats: 1 },
    // { dayOfWeek: 'sun', date: '1/7/20', startTime: moment, endTime: moment, seats: 1 },

  ],
};

const createEntriesFromTimeSlots = timeslots =>
  timeslots.reduce((allEntries, timeslot) => {
    const attributes = timeslot.attributes || {};
    const {start, end, seats} = attributes;

    const entry = start && end
      ? [{
        dayOfWeek: moment(start).format("ddd").toLowerCase(),
        date: moment(start).format("L"),
        seats: seats,
        startTime: moment(start),
        endTime: moment(end),
      }]
      : [];

    return allEntries.concat(entry);
  }, []);

const defaultState = {
  section: 1,
  selectedId: null,
  selectedListing: null,
  selectedDates: [],
  selectedTimeSlots: [],
  availabilityPlan: defaultAvailabilityPlan,
  transactionParams: [],
  speculatedTransaction: [],
  selectedServiceContract: null,
  contractNotChecked: true,
  selectedServiceLabel: null,
  timeNextButtonDisabled: true,
  multiSelectTime: true,
};

const BookingModal = props => {
  const {
    rootClassName,
    className,
    onFetchTimeSlots,
    onManageDisableScrolling,
    authorDisplayName,
    onSubmit,
    getListing,
    listingRefs,
    availability,
    fetchSpeculatedTransaction,
    onInitiateOrder,
    currentUser,
  } = props;

  const classes = classNames(rootClassName || css.root, className)

  const [bookingState, setBookingState] = useState(defaultState);

  const setDates = dates => {
    setBookingState({...bookingState, selectedDates: dates});
  }

  const onListingSelected = (value, nextSection) => {
    const listing = getListing(new UUID(value));
    const {id, attributes} = listing;
    const {publicData} = attributes;
    const {serviceType, expirationDate, zip} = publicData;
    const {contract, label, key} = getServiceType(serviceType) || {};
    const multiSelectTime = key !== 'carSeatTechnician';

    const start = moment().startOf('day').toDate();
    const end = new Date(expirationDate);
    const timezone = zipToTZ.lookup(zip);
    const newListing = bookingState.selectedId !== id;

    const newBookingState = {
      ...bookingState,
      section: nextSection,
      selectedId: id,
      selectedListing: listing,
      selectedServiceLabel: label,
      selectedServiceContract: contract,
      multiSelectTime: multiSelectTime,
      selectedDates: newListing ? [] : bookingState.selectedDates,
      selectedTimeSlots: newListing ? [] : bookingState.selectedTimeSlots,
    }

    availability.onFetchTimeSlots(id, start, end, timezone)
      .then(res => {
        const entries = createEntriesFromTimeSlots(res);
        setBookingState({
          ...newBookingState,
          availabilityPlan: {...bookingState.availabilityPlan, entries: entries},
        });
      })
      .catch(err => {
        console.log("ERROR setting avail plan: " + err)
        setBookingState(newBookingState);
      });
  };

  const onDateSelection = (dates, section) => {
    // Clear out times if dates have changed
    const updatedTimeSlots = bookingState.selectedTimeSlots.filter(slot => {
      const foundSlot = dates.find(date => slot.start.format('L') === date.format('L'));
      return foundSlot !== undefined;
    });

    // Determine of next button for time selection should be disabled. this handles if a user goes
    // and select new dates.
    const disableNext = timeNextButtonDisableCheck(updatedTimeSlots, dates);

    setBookingState({
      ...bookingState,
      section: section,
      selectedDates: dates,
      selectedTimeSlots: updatedTimeSlots,
      timeNextButtonDisabled: disableNext,
    });
  }

  const nextPageSubmit = (value) => {
    switch (bookingState.section) {
      case 1:
        onListingSelected(value, 2);
        break;
      case 2:
        onDateSelection(value, 3);
        break;
      case 3:
        prepareBookingReview(4);
        break;
      case 4:
        handleBooking(5);
    }
  };

  const goBack = () => {
    if (bookingState.section >= 2) {
      setBookingState({...bookingState, section: bookingState.section - 1});
    }
  }

  /*
    Combine timeslots that are consecutive. i.e. 2-3 and 3-4 should be combined to
    2-4.
   */
  const rollupTimeslots = () => {
    let rolledUpTimeslots = [];

    bookingState.selectedTimeSlots.forEach(time => {
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

  const prepareBookingReview = (nextSection) => {
    const listingId = bookingState.selectedId;
    const rolledUpTimeslots = rollupTimeslots();

    const stripeCustomer = currentUser.stripeCustomer || {};
    const defaultPaymentMethod = stripeCustomer.defaultPaymentMethod || {};
    const attributes = defaultPaymentMethod.attributes || {};
    const stripePayment = attributes.stripePaymentMethodId;

    const promises = [];
    const paramsArray = [];
    rolledUpTimeslots.forEach(timeslot => {
      const params = {
        listingId,
        "bookingStart": timeslot.start.toDate(),
        "bookingEnd": timeslot.end.toDate(),
        paymentMethod: stripePayment,
      }

      paramsArray.push(params);
      promises.push(fetchSpeculatedTransaction(params))
    });

    Promise.all(promises).then(values => {
      setBookingState({
        ...bookingState,
        section: nextSection,
        transactionParams: paramsArray,
        speculatedTransaction: values
      });
    });
  }

  const handleBooking = (nextSection) => {

    let error = false;

    bookingState.transactionParams.forEach(bookingParams => {
      onInitiateOrder(bookingParams)
        .then(order => {
          console.log("SUCCESSFUL booking");
        }).catch(e => {
        console.log("ERROR" + e);
        error = true;
      });
    });

    if (!error) {
      setBookingState({
        ...bookingState,
        section: nextSection,
      });
    }
  };

  const handleConfirmBookingSuccess = () => {
    setBookingState(defaultState);
    onSubmit();
  }

  const handleContractCheck = (event) => {
    console.log('Checked!!');
    let isChecked = event.target.checked;
    setBookingState({...bookingState, contractNotChecked: !isChecked});
  }


  const chooseService = (
    <div>
      <h2 className={css.pageTitle}>Select Service</h2>
      <div className={css.serviceButtonsGroup}>
        {listingRefs.map(listing => (
          <div key={listing.id.uuid} className={css.buttonSpacing}>
            <PrimaryButton
              rootClassName={css.serviceButton}
              onClick={() => nextPageSubmit(listing.id.uuid)}>
              <div className={css.serviceButtonContent}>
                <div className={css.serviceIcon}>
                  {getServiceType(listing.serviceType).icon(css.buttonIcon)}
                </div>
                <div className={css.serviceText}>
                  {getServiceType(listing.serviceType).label}
                </div>
              </div>

            </PrimaryButton>
          </div>
        ))}
      </div>
    </div>

  );

  const dateSelection = (
    <div className={css.dateSelection}>
      <h2 className={css.pageTitle}>Select Dates</h2>
      <div className={css.calendarWrapper}>
        <ManageAvailabilityCalendar
          availability={availability}
          availabilityPlan={bookingState.availabilityPlan}
          listingId={bookingState.selectedId}
          timezone={bookingState.availabilityPlan.timezone}
          setDates={setDates}
          selectedDates={bookingState.selectedDates}
          isBooking={true}
        />
      </div>

      <div className={css.buttonGroup}>
        <PrimaryButton className={css.actionButton} onClick={() => goBack()}>
          Back
        </PrimaryButton>
        <PrimaryButton
          className={css.actionButton}
          disabled={bookingState.selectedDates.length === 0}
          onClick={() => nextPageSubmit(bookingState.selectedDates)}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  )

  const timeNextButtonDisableCheck = (selectedTimes, selectedDates) => {
    return selectedDates.reduce((value, date) => {
      const found = selectedTimes.find(time => date.format('L') === time.start.format('L'));

      return (found === undefined) || value;
    }, false)
  }

  const handleTimeSelection = (times, action, date) => {
    let newSelected;
    const actionType = action.action;

    if (actionType === 'select-option') {
      let addedSlot;
      if(bookingState.multiSelectTime) {
        newSelected = [...bookingState.selectedTimeSlots, action.option]
      } else {
        addedSlot = times;
        newSelected = [
          ...bookingState.selectedTimeSlots.filter(slot => !slot.date.isSame(addedSlot.date)),
          addedSlot,
        ]
      }

    } else if (actionType === 'remove-value') {
      const removedSlot = action.removedValue;
      newSelected = bookingState.selectedTimeSlots.filter(slot => !slot.start.isSame(removedSlot.start))
    } else if (actionType === 'clear') {
      newSelected = bookingState.selectedTimeSlots.filter(slot => !slot.date.isSame(date))
    }

    setBookingState({
      ...bookingState,
      selectedTimeSlots: newSelected,
      timeNextButtonDisabled: timeNextButtonDisableCheck(newSelected, bookingState.selectedDates)
    });
  }

  const timeSelection = (
    <div className={css.timeSelection}>
      <h2 className={css.pageTitle}>Select Times</h2>
      <TimeSelection
        selectedDates={bookingState.selectedDates}
        availabilityPlan={bookingState.availabilityPlan}
        handleChange={handleTimeSelection}
        values={bookingState.selectedTimeSlots}
        isCreateBooking={true}
        isMulti={bookingState.multiSelectTime}
      />

      <div className={css.buttonGroup}>
        <PrimaryButton className={css.actionButton} onClick={() => goBack()}>
          Back
        </PrimaryButton>
        <PrimaryButton
          className={css.actionButton}
          onClick={() => nextPageSubmit()}
          disabled={bookingState.timeNextButtonDisabled}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  );

  const review = (
    <div>
      <h2 className={css.pageTitle}>Review Booking</h2>

      {bookingState.speculatedTransaction.length > 0 ? (
        <BookingBreakdown
          userRole="customer"
          unitType={LINE_ITEM_UNITS}
          dateType={DATE_TYPE_DATETIME}
          bookingTransactions={bookingState.speculatedTransaction}
          bookings={bookingState.speculatedTransaction.map(tx => tx.booking)}
          timeZone={bookingState.availabilityPlan.timezone}
        />) : null}

      <div className={css.contractDiv}>
        <input type="checkbox" id="contractCheck" className={css.checkbox}
               onClick={(event) => handleContractCheck(event)}/>
        <label for="contractCheck">By checking this box, you are electronically signing that you
          have read and agree to the
          <a href={bookingState.selectedServiceContract ? bookingState.selectedServiceContract() : null}
             download={"NU_" + bookingState.selectedServiceLabel + "_Contract"}> {bookingState.selectedServiceLabel} Contract.</a>
        </label>
      </div>
      <div className={css.buttonGroup}>
        <PrimaryButton className={css.actionButton} onClick={() => goBack()}>
          Back
        </PrimaryButton>
        <PrimaryButton className={css.actionButton} disabled={bookingState.contractNotChecked}
                       onClick={() => nextPageSubmit()}>
          Request Booking
        </PrimaryButton>
      </div>
    </div>
  );

  const successMessage = (
    <div>
      <h2>Your booking request has been sent!</h2>

      <PrimaryButton className={css.actionButton} onClick={() => handleConfirmBookingSuccess()}>
        Close
      </PrimaryButton>
    </div>
  )

  return (
    <div className={classes}>
      {bookingState.section === 1 ? chooseService : null}
      {bookingState.section === 2 ? dateSelection : null}
      {bookingState.section === 3 ? timeSelection : null}
      {bookingState.section === 4 ? review : null}
      {bookingState.section === 5 ? successMessage : null}
    </div>
  );
}

BookingModal.defautlProps = {
  listingRefs: {},
  availability: {},
}

BookingModal.propTypes = {
  onFetchTimeSlots: func,
  onManageDisableScrolling: func.isRequired,
  authorDisplayName: oneOfType([node, string]),
  onSubmit: func.isRequired,
  getListing: func.isRequired,
  listingRefs: array,
  availability: object,
  fetchSpeculatedTransaction: func.isRequired,
  onInitiateOrder: func.isRequired,
  currentUser: propTypes.currentUser,
}

export default compose(
  withRouter,
  injectIntl
)(BookingModal);
