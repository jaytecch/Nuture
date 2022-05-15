import React from "react";
import css from "./CardAboutMe.css";
import {FormattedMessage} from "react-intl";
import {propTypes} from "../../util/types";
import {string} from 'prop-types';
import classNames from 'classnames';
import {injectIntl, intlShape} from "../../util/reactIntl";
import {
  Card, IconEdit, NamedLink, PrimaryButton,
} from '../../components';
import {isScrollingDisabled} from "../../ducks/UI.duck";
import {compose} from "redux";
import {connect} from "react-redux";
import {ensureCurrentUser} from "../../util/data";

export const CardAboutMeComponent = props => {
  const {
    className,
    currentUser,
    intl,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const {email, profile} = user.attributes || {'email': '', 'profile': {}};
  const {phone, city, state, streetAddress1, zip, birthday} = profile.protectedData ||
  {'phone': '', 'city': '', 'state': '', 'streetAddress1': '', 'zip': '', 'birthday': ''};
  const address = streetAddress1 + " " + city + ", " + state + " " + zip;

  const classes = classNames(css.root, className);

  const emailLabel = intl.formatMessage({
    id: 'CardAboutMe.emailLabel',
  });

  const birthdayLabel = intl.formatMessage({
    id: 'CardAboutMe.birthdayLabel',
  });

  const phoneLabel = intl.formatMessage({
    id: 'CardAboutMe.phoneLabel',
  });

  const addressLabel = intl.formatMessage({
    id: 'CardAboutMe.addressLabel',
  });

  const field = (label, val = '') => {
    return (
      <div className={css.field}>
        <label className={css.label}>{label}</label>
        <div className={css.inputDiv}>
          <input type="text" className={css.inputText} value={val} readOnly/>
        </div>
      </div>
    )
  }

  const header = intl.formatMessage({id: "CardAboutMe.header"})

  return (
    <Card className={classes} flat={true} header={header}>

      <div className={css.form}>
        <div className={css.formRow}>
          {field(addressLabel, address)}
          {field(phoneLabel, phone)}
        </div>
        <div className={css.formRow}>
          {field(emailLabel, email)}
          <NamedLink name="ContactDetailsPage" className={css.namedLinkButton}>
            EDIT FULL PROFILE
          </NamedLink>
        </div>
      </div>
    </Card>
  )
};

CardAboutMeComponent.defaultProps = {
  currentUser: {},
}

CardAboutMeComponent.propTypes = {
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

const CardAboutMe = compose(
  connect(
    mapStateToProps,
  ),
  injectIntl
)(CardAboutMeComponent);

export default CardAboutMe;
