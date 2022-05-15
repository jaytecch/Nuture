import React from "react";
import Card from "../Card/Card";
import {FormattedMessage, injectIntl, intlShape} from "../../util/reactIntl";
import Button from "../Button/Button";
import css from "./CardQuickAction.css";
import classNames from "classnames";
import {string, bool} from 'prop-types';

export const CardQuickActions = props => {
  const {
    className,
    isGiver
  } = props;

  const classes = classNames(css.root, className);

  const giverButtons = (
      <div className={css.actions}>
        <Button className={css.button}>
          <FormattedMessage id="CardQuickActions.findAJob"/>
        </Button>

        <Button className={css.button}>
          <FormattedMessage id="CardQuickActions.updateAvailability"/>
        </Button>

        <Button className={css.button}>
          <FormattedMessage id="CardQuickActions.fileDispute"/>
        </Button>
    </div>
  );

  const seekerButtons = (
    <div className={css.actions}>
      <Button className={css.button}>
        <FormattedMessage id="CardQuickActions.findAGiver"/>
      </Button>

      <Button className={css.button}>
        <FormattedMessage id="CardQuickActions.createJobListing"/>
      </Button>

      <Button className={css.button}>
        <FormattedMessage id="CardQuickActions.fileDispute"/>
      </Button>
    </div>
  );



  return (
    <Card className={classes} flat={true}>
      <div className={css.header}>
        <h2><FormattedMessage id="CardQuickActions.header"/></h2>
      </div>

      {isGiver ? giverButtons :  seekerButtons}
    </Card>
  );
}

CardQuickActions.defaultProps = {
  isGiver: false
}

CardQuickActions.propTypes = {
  className: string,
  isGiver: bool,
}

export default CardQuickActions;
