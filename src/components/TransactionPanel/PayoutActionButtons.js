import React from "react";
import {FormattedMessage} from "../../util/reactIntl";

import css from './TransactionPanel.css';
import classNames from "classnames";
import {PrimaryButton, SecondaryButton} from "../Button/Button";

const PayoutActionButtons = props => {
  const {
    className,
    rootClassName,
    showButtons,
    payoutInProgress,
    disputeInProgress,
    payoutError,
    disputeError,
    onPayout,
    onDispute,
  } = props;

  const buttonsDisabled = payoutInProgress || disputeInProgress;

  const payoutErrorMessage = payoutError ? (
    <p className={css.actionError}>
      <FormattedMessage id="TransactionPage.payoutFailed" />
    </p>
  ) : null;

  const disputeErrorMessage = disputeError ? (
    <p className={css.actionError}>
      <FormattedMessage id="TransactionPage.disputeFailed" />
    </p>
  ) : null;

  const classes = classNames(rootClassName || css.actionButtons, className);

  return showButtons ? (
    <div className={classes} >
      <div className={css.actionErrors}>
        {payoutErrorMessage}
        {disputeErrorMessage}
      </div>

      <div className={css.actionButtonWrapper}>
        <SecondaryButton
          inProgress={disputeInProgress}
          disabled={buttonsDisabled}
          onClick={onDispute}
        >
          <FormattedMessage id="TransactionPage.disputeButton" />
        </SecondaryButton>
        <PrimaryButton
          inProgress={payoutInProgress}
          disabled={buttonsDisabled}
          onClick={onPayout}
        >
          <FormattedMessage id="TransactionPage.payoutButton" />
        </PrimaryButton>
      </div>
    </div>
  ) : null;
};

export default PayoutActionButtons;
