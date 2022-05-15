import React from "react";
import css from './CardAppointmentsCalendar.css';
import { injectIntl} from "react-intl";
import {DayPickerSingleDateController, isSameDay} from "react-dates";
import {Card, IconArrowHead} from "../index";
import moment from "moment";
import {intlShape} from "../../util/reactIntl";
import {arrayOf, string, bool} from "prop-types";
import {propTypes} from "../../util/types";
import {txState} from "../CardInbox/CardInbox";
import {compose} from "redux";

export const CardAppointmentsCalendarComponent = props => {
  const {
    className,
    transactions,
    isOrders,
    intl,
  } = props;

  const header = intl.formatMessage({id: 'Dashboard.appointments'});

  const acceptedOnly = tx => {
    const txRole = isOrders ? 'customer' : 'provider';
    const stateData = txState(intl, tx, txRole);

    const booking = tx.booking || {};
    const bookingAttributes = booking.attributes || {};
    const start = bookingAttributes.start || {};

    // Render InboxItem only if the latest transition of the transaction is handled in the `txState` function.
    return stateData && stateData.state.includes("Accepted") ? moment(start) : null;
  }

  const mapAppointmentData = () => {
    const tempArray = transactions.map(acceptedOnly);
    return tempArray.filter(function (el) {
      return el != null;
    });
  }

  const customMonthSelect = ({ month, onMonthSelect, onYearSelect }) => (
    <div className={css.calendarContent}>
      <div className={css.selectSection}>
        <select
          value={month.month()}
          onChange={(e) => { onMonthSelect(month, e.target.value); }}
        >
          {moment.months().map((label, value) => (
            <option value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className={css.selectSection}>
        <select
          value={month.year()}
          onChange={(e) => { onYearSelect(month, e.target.value); }}
        >
          <option value={moment().year() - 1}>Last Year</option>
          <option value={moment().year()}>{moment().year()}</option>
          <option value={moment().year() + 1}>{moment().year() + 1}</option>
        </select>
      </div>
    </div>
  );

  return (
    <Card className={className} flat={true} header={header}>
      <div className={css.root}>
        <DayPickerSingleDateController
          renderNavPrevButton={() => <div className={css.removeNav}/>}
          renderNavNextButton={() => <div className={css.removeNav}/>}
          numberOfMonths={1}
          hideKeyboardShortcutsPanel
          initialVisibleMonth={() => moment()}
          isDayHighlighted={day1 => mapAppointmentData().some(day2 => isSameDay(day1, day2))}
          renderMonthElement={customMonthSelect}
        />
      </div>

    </Card>
  )
}

CardAppointmentsCalendarComponent.defaultProps = {
  className: null,
  isOrders: true,
};

CardAppointmentsCalendarComponent.propTypes = {
  className: string,
  transactions: arrayOf(propTypes.transaction).isRequired,
  intl: intlShape.isRequired,
  isOrders: bool,
};

const CardAppointmentsCalendar = compose(
  injectIntl
)(CardAppointmentsCalendarComponent);

export default CardAppointmentsCalendar;
