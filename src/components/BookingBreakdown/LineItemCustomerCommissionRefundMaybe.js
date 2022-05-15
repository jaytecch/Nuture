import React from 'react';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { propTypes, LINE_ITEM_CUSTOMER_COMMISSION } from '../../util/types';

import css from './BookingBreakdown.css';
import {arrayOf} from "prop-types";
import {types as sdkTypes} from "../../util/sdkLoader";

const { Money } = sdkTypes;

const LineItemCustomerCommissionRefundMaybe = props => {
  const { bookingTransactions=[], transaction, isCustomer, intl } = props;

  let showRefund = false;
  let refundTotal = 0;

  bookingTransactions.forEach(tx => {
    const refund = tx.attributes.lineItems.find(
      item => item.code === LINE_ITEM_CUSTOMER_COMMISSION && item.reversal
    );
    if(refund) {
      showRefund = true;
      refundTotal += Number(refund.lineTotal.amount);
    }
  })



  return isCustomer && showRefund ? (
    <div className={css.lineItem}>
      <span className={css.itemLabel}>
        <FormattedMessage id="BookingBreakdown.refundCustomerFee" />
      </span>
      <span className={css.itemValue}>{formatMoney(intl, new Money(refundTotal, 'USD'))}</span>
    </div>
  ) : null;
};

LineItemCustomerCommissionRefundMaybe.propTypes = {
  bookingTransactions: arrayOf(propTypes.transaction).isRequired,
  intl: intlShape.isRequired,
};

export default LineItemCustomerCommissionRefundMaybe;
