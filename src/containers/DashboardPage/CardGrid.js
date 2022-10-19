import React from "react";
import {arrayOf, node, number} from 'prop-types';
import css from './CardGrid.css';

const CardGrid = props => {
  const {
    cards,
    width,
  } = props;

  const largeGrid = (
    <div className={css.grid}>
      <div className={css.row}>
        <div className={css.largeColumn}>{cards[0]}</div>
        <div className={css.largeColumn}>{cards[1]}</div>
        <div className={css.largeColumn}>{cards[2]}</div>
      </div>

      <div className={css.row}>
        <div className={css.largeColumn}>{cards[3]}</div>
        <div className={css.largeColumn}>{cards[4]}</div>
        <div className={css.largeColumn}>{cards[5]}</div>
      </div>
    </div>
  );

  const mediumGrid = (
    <div className={css.grid}>
      <div className={css.row}>
        <div className={css.mediumColumn}>{cards[0]}</div>
        <div className={css.mediumColumn}>{cards[1]}</div>
      </div>

      <div className={css.row}>
        <div className={css.mediumColumn}>{cards[2]}</div>
        <div className={css.mediumColumn}>{cards[3]}</div>
      </div>

      <div className={css.row}>
        <div className={css.mediumColumn}>{cards[4]}</div>
        <div className={css.mediumColumn}>{cards[5]}</div>
      </div>
    </div>
  )

  const smallGrid = (
    <div className={css.grid}>
      <div className={css.row}>
        <div className={css.smallColumn}>{cards[0]}</div>
      </div>
      <div className={css.row}>
        <div className={css.smallColumn}>{cards[1]}</div>
      </div>
      <div className={css.row}>
        <div className={css.smallColumn}>{cards[2]}</div>
      </div>
      <div className={css.row}>
        <div className={css.smallColumn}>{cards[3]}</div>
      </div>
      <div className={css.row}>
        <div className={css.smallColumn}>{cards[4]}</div>
      </div>
      <div className={css.row}>
        <div className={css.smallColumn}>{cards[5]}</div>
      </div>
    </div>
  )

  let layout = smallGrid;
  if(width > 1400) {
    layout = largeGrid;
  } else if(width > 1000) {
    layout = mediumGrid;
  }

  return layout;
}

CardGrid.defaultProps = {

}

CardGrid.propTypes = {
  cards: arrayOf(node).isRequired,
  width: number.isRequired
}

export default CardGrid;
