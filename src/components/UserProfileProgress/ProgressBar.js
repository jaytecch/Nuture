import React from 'react';
import invariant from 'invariant';
import { getSafePercent, getStepPosition } from './ProgressBarUtils';
import css from './UserProfileProgress.css';
import {arrayOf, bool, number, string, node} from 'prop-types';

const ProgressBar = props =>  {
    const {
      percent,
      children,
      stepPositions,
      unfilledBackground,
      filledBackground,
      width,
      height,
      hasStepZero,
      text,
    } = props;

    invariant(
      !(stepPositions.length > 0 && stepPositions.length !== React.Children.count(children)),
      'When specifying a stepPositions props, the number of children must match the length of the positions array.',
    );

    const safePercent = getSafePercent(percent);

    return (
      <div className={css.progressBar} style={{ background: unfilledBackground, width, height }}>
        {/* Here we're looping over the children to clone them and add them custom props */}
        {React.Children.map(children, (step, index) => {
          const position = stepPositions.length > 0
            ? stepPositions[index]
            : getStepPosition(React.Children.count(children), index, hasStepZero);

          return React.cloneElement(step, {
            accomplished: position <= safePercent,
            position,
            index,
          });
        })}

        {text ? <div className={css.progressBarText}>{text}</div> : null}

        <div
          className={css.progression}
          style={{
            background: filledBackground,
            width: `${safePercent}%`,
          }}
        />
      </div>
    );
};

ProgressBar.defaultProps = {
  stepPositions: [],
  unfilledBackground: null,
  filledBackground: null,
  width: null,
  height: null,
  hasStepZero: true,
  text: null,
}

ProgressBar.propTypes = {
  percent: number.isRequired,
  children: node.isRequired,
  stepPositions: arrayOf(number),
  unfilledBackground: string,
  filledBackground: string,
  width: number,
  height: number,
  hasStepZero: bool,
  text: string,
}

export default ProgressBar;
