import React from 'react';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import {convertMoneyToNumber, formatMoney} from '../../util/currency';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes } from '../../util/types';
import {arrayOf, bool} from 'prop-types';

import css from './BookingBreakdown.css';
import {types as sdkTypes} from "../../util/sdkLoader";

const { Money } = sdkTypes;

const LineItemBasePriceMaybe = props => {
  const { unitType, intl, bookingTransactions, isFlatRate} = props;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;
  const translationKey = isNightly
    ? 'BookingBreakdown.baseUnitNight'
    : isDaily
      ? 'BookingBreakdown.baseUnitDay'
      : 'BookingBreakdown.baseUnitQuantity';

  let bookingTotal = 0;
  let bookingQuantity = 0;

  // Find correct line-item for given unitType prop.
  // It should be one of the following: 'line-item/night, 'line-item/day', 'line-item/units', or 'line-item/time'
  // These are defined in '../../util/types';
  const unitPurchase = bookingTransactions[0].attributes.lineItems.find(
    item => item.code === unitType && !item.reversal
  );

  bookingTransactions.forEach(tx => {
    const unitPurchase = tx.attributes.lineItems.find(
      item => item.code === unitType && !item.reversal
    );
    const quantity = unitPurchase ? Number(unitPurchase.quantity.toString()) : 0;
    const total = unitPurchase ? unitPurchase.lineTotal.amount : 0;

    bookingQuantity += quantity;
    bookingTotal += total;
  })

  // const quantity = unitPurchase ? unitPurchase.quantity.toString() : null;
  const quantity = unitPurchase ? bookingQuantity.toString() : null;
  const unitPrice = unitPurchase ? formatMoney(intl, unitPurchase.unitPrice) : null;
  const total = unitPurchase ? formatMoney(intl, new Money(bookingTotal, 'USD')) : null;

  return !isFlatRate && quantity && total ? (
    <div className={css.lineItem}>
      <span className={css.itemLabel}>
        <FormattedMessage id={translationKey} values={{ unitPrice, quantity }} />
      </span>
      <span className={css.itemValue}>{total}</span>
    </div>
  ) : null;
};

LineItemBasePriceMaybe.propTypes = {
  bookingTransactions: arrayOf(propTypes.transaction).isRequired,
  unitType: propTypes.bookingUnitType.isRequired,
  intl: intlShape.isRequired,
  isFlatRate: bool.isRequired,
};

export default LineItemBasePriceMaybe;
