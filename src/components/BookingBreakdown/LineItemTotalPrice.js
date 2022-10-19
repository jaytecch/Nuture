import React from 'react';
import {arrayOf, bool} from 'prop-types';
import {FormattedMessage, intlShape} from '../../util/reactIntl';
import {formatMoney} from '../../util/currency';
import {txIsCanceled, txIsDelivered, txIsDeclined} from '../../util/transaction';
import {propTypes} from '../../util/types';

import css from './BookingBreakdown.css';
import {types as sdkTypes} from "../../util/sdkLoader";

const {Money} = sdkTypes;

const LineItemUnitPrice = props => {
  const {bookingTransactions, isProvider, intl} = props;

  let providerTotalMessageId = 'BookingBreakdown.providerTotalDefault';
  const tx = bookingTransactions[0];
  if (txIsDelivered(tx)) {
    providerTotalMessageId = 'BookingBreakdown.providerTotalDelivered';
  } else if (txIsDeclined(tx)) {
    providerTotalMessageId = 'BookingBreakdown.providerTotalDeclined';
  } else if (txIsCanceled(tx)) {
    providerTotalMessageId = 'BookingBreakdown.providerTotalCanceled';
  }

  const totalLabel = isProvider ? (
    <FormattedMessage id={providerTotalMessageId}/>
  ) : (
    <FormattedMessage id="BookingBreakdown.total"/>
  );

  let totalPrice = 0;
  bookingTransactions.forEach(tx => {
    const total = isProvider
      ? tx.attributes.payoutTotal
      : tx.attributes.payinTotal;

    if(total) {
      totalPrice += Number(total.amount);
    }
  })


  const formattedTotalPrice = formatMoney(intl, new Money(totalPrice, 'USD'));

  return (
    <>
      <hr className={css.totalDivider}/>
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{totalLabel}</div>
        <div className={css.totalPrice}>{formattedTotalPrice}</div>
      </div>
    </>
  );
};

LineItemUnitPrice.propTypes = {
  bookingTransactions: arrayOf(propTypes.transaction).isRequired,
  isProvider: bool.isRequired,
  intl: intlShape.isRequired,
};

export default LineItemUnitPrice;
