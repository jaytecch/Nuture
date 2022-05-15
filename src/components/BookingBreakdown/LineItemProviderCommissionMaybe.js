import React from 'react';
import {arrayOf, bool} from 'prop-types';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import { LINE_ITEM_PROVIDER_COMMISSION, propTypes } from '../../util/types';

import css from './BookingBreakdown.css';

const { Money } = sdkTypes;

// Validate the assumption that the commission exists and the amount
// is zero or negative.
const isValidCommission = commissionLineItem => {
  return commissionLineItem.lineTotal instanceof Money && commissionLineItem.lineTotal.amount <= 0;
};

const LineItemProviderCommissionMaybe = props => {
  const { bookingTransactions, isProvider, intl } = props;
  let showCommission = false;
  let commission = 0;

  if(!isProvider) return null;

  bookingTransactions.forEach(tx => {
    const providerCommissionLineItem = tx.attributes.lineItems.find(
      item => item.code === LINE_ITEM_PROVIDER_COMMISSION && !item.reversal
    );

    if (isValidCommission(providerCommissionLineItem)) {
      showCommission = true;
      commission += Number(providerCommissionLineItem.lineTotal.amount);
    } else {
      console.error('invalid commission line item:', providerCommissionLineItem);
    }
  })

  if (showCommission) {
    const formattedCommission = formatMoney(intl, new Money(commission, 'USD'));

    return (
      <div className={css.lineItem}>
        <span className={css.itemLabel}>
          <FormattedMessage id="BookingBreakdown.commission" />
        </span>
        <span className={css.itemValue}>{formattedCommission}</span>
      </div>
    );
  }

  return null;
};

LineItemProviderCommissionMaybe.propTypes = {
  bookingTransactions: arrayOf(propTypes.transaction).isRequired,
  isProvider: bool.isRequired,
  intl: intlShape.isRequired,
};

export default LineItemProviderCommissionMaybe;
