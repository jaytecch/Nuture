import React from 'react';
import {FormattedMessage} from '../../util/reactIntl';
import classNames from 'classnames';
import {PrimaryButton, SecondaryButton} from '../../components';

import css from './TransactionPanel.css';

// Functional component as a helper to build ActionButtons for
// provider when state is preauthorized
const SaleActionButtonsMaybe = props => {
  const {
    className,
    rootClassName,
    showButtons,
    acceptInProgress,
    declineInProgress,
    acceptSaleError,
    declineSaleError,
    onAcceptSale,
    onDeclineSale,
    isHireRequest,
  } = props;

  const buttonsDisabled = acceptInProgress || declineInProgress;

  const acceptErrorMessage = acceptSaleError ? (
    <p className={css.actionError}>
      isHireRequest ?
      <FormattedMessage id="TransactionPanel.confirmHireFailed"/>
        : <FormattedMessage id="TransactionPanel.acceptSaleFailed"/>
    </p>
  ) : null;
  const declineErrorMessage = declineSaleError ? (
    <p className={css.actionError}>
      {isHireRequest ?
        <FormattedMessage id="TransactionPanel.declineHireFailed"/>
        : <FormattedMessage id="TransactionPanel.declineSaleFailed"/>
      }
    </p>
  ) : null;

  const classes = classNames(rootClassName || css.actionButtons, className);

  return showButtons ? (
    <div className={classes}>
      <div className={css.actionErrors}>
        {acceptErrorMessage}
        {declineErrorMessage}
      </div>
      <div className={css.actionButtonWrapper}>
        <SecondaryButton
          inProgress={declineInProgress}
          disabled={buttonsDisabled}
          onClick={onDeclineSale}
        >
          <FormattedMessage id="TransactionPanel.declineButton"/>
        </SecondaryButton>
        <PrimaryButton
          inProgress={acceptInProgress}
          disabled={buttonsDisabled}
          onClick={onAcceptSale}
        >
          {isHireRequest ?
            <FormattedMessage id="TransactionPanel.confirmHireButton" />
            : <FormattedMessage id="TransactionPanel.acceptButton"/>
          }
        </PrimaryButton>
      </div>
    </div>
  ) : null;
};

export default SaleActionButtonsMaybe;
