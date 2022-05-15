import React from 'react';
import invariant from 'invariant';
import {Transition} from 'react-transition-group';
import {transitions} from './transitions';
import {getSafePercent} from './ProgressBarUtils';
import css from './UserProfileProgress.css';
import {bool, number, node, oneOf, string} from 'prop-types';

export const Step = props => {
  const {
    accomplished,
    position,
    index,
    children,
    transition = null,
    transitionDuration = 300,
    label,
  } = props;

  const safePosition = getSafePercent(position);

  let style = {
    left: `${safePosition}%`,
    transitionDuration: `${transitionDuration}ms`,
  };

  return (
    <Transition in={accomplished} timeout={transitionDuration}>
      {(state) => {
        if (transition) {
          invariant(
            transitions[transition] != null,
            `${transition} is not listed in the built-in transitions.`,
          );
          style = {
            ...style,
            ...transitions[transition][state],
          };
        }

        return (
            <div className={css.step} style={style}>
              {children({
                accomplished,
                position: safePosition,
                transitionState: state,
                index,
              })}
            </div>
        );
      }}
    </Transition>
  );
}

Step.defaultProps = {
  transitions: null,
  transitionDuration: 300,
  label: null,
}

Step.propTypes = {
  accomplished: bool.isRequired,
  position: number.isRequired,
  index: number.isRequired,
  children: node.isRequired,
  transition: oneOf(['scale', 'rotate', 'skew']),
  transitionDuration: number,
  label: string,
}

export default Step;
