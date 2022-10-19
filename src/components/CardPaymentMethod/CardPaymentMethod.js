import React, {useState} from "react";
import css from "./CardPaymentMethod.css";
import {FormattedMessage} from "react-intl";
import {propTypes} from "../../util/types";
import {string} from 'prop-types';
import classNames from 'classnames';
import {injectIntl, intlShape} from "../../util/reactIntl";
import {
  Card,
  IconCard, NamedLink,
} from '../../components';
import {isScrollingDisabled} from "../../ducks/UI.duck";
import {compose} from "redux";
import {connect} from "react-redux";
import {ensureCurrentUser, ensurePaymentMethodCard, ensureStripeCustomer} from "../../util/data";


export const CardPaymentMethodComponent = props => {

  const {
    className,
    currentUser,
    intl,
  } = props;

  const classes = classNames(css.root, className);

  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const currentUserLoaded = !!ensuredCurrentUser.id;

  const hasDefaultPaymentMethod =
    currentUserLoaded &&
    ensureStripeCustomer(ensuredCurrentUser.stripeCustomer).attributes.stripeCustomerId &&
    ensurePaymentMethodCard(ensuredCurrentUser.stripeCustomer.defaultPaymentMethod).id;

  const card = hasDefaultPaymentMethod
    ? ensurePaymentMethodCard(ensuredCurrentUser.stripeCustomer.defaultPaymentMethod).attributes.card
    : null;


  const { last4Digits, brand } = card || {};

  const defaultCard = (
    <div className={css.savedPaymentMethod}>
      <div className={css.subheader}>Credit Card</div>
      <IconCard brand={brand} className={css.cardIcon} />
      <span className={css.cardDigits}>{last4Digits}</span>
    </div>
  );

  const header = intl.formatMessage({id: "CardPaymentMethod.header"});
  const buttonText = intl.formatMessage({id: "CardPaymentMethod.updateButtonLabel"})

  return (
    <Card className={classes} flat={true} header={header}>
      <div className={css.content}>
        <div >
          {!card ? null : defaultCard }
        </div>

        <NamedLink name="PaymentMethodsPage" className={css.namedLinkButton}>
          <span className={css.updateButtonText}>{buttonText}</span>
        </NamedLink>

      </div>

    </Card>
  );
};

CardPaymentMethodComponent.defaultProps = {
  currentUser: {},
}

CardPaymentMethodComponent.propTypes = {
  currentUser: propTypes.currentUser,
  className: string,
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentUser,
  } = state.user;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
  }
}

const CardPaymentMethod = compose(
  connect(
    mapStateToProps,
  ),
  injectIntl
)(CardPaymentMethodComponent);

export default CardPaymentMethod;
