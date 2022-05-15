import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import css from './IconSubscription.css';

const IconSubscription = props => {
  const {
    className,
    rootClassName
  } = props;

  const classes = classNames(className || css.root);

  return (
    <svg className={rootClassName} height="511pt" viewBox="-48 1 511 511.99976" width="511pt" xmlns="http://www.w3.org/2000/svg">
      <path className={classes} d="m208.667969 78.167969h59.65625l-22.59375 22.632812c-5.851563 5.863281-5.84375 15.359375.019531 21.214844 5.851562 5.839844 15.351562 5.851563 21.210938-.019531l48.117187-48.199219c5.921875-5.933594 5.871094-15.6875-.34375-21.539063l-47.773437-47.855468c-5.851563-5.863282-15.347657-5.871094-21.210938-.019532-5.863281 5.855469-5.871094 15.351563-.019531 21.214844l22.53125 22.570313c-67.972657 0-59.496094-.003907-60.238281-.003907-158.574219 0-259.230469 172.582032-179.714844 311.300782 4.117187 7.183594 13.277344 9.675781 20.472656 5.554687 7.1875-4.121093 9.671875-13.285156 5.554688-20.472656-68.320313-119.179687 18.914062-267.058594 154.332031-266.378906zm0 0"/>
      <path className={classes} d="m388.148438 152.53125c-4.117188-7.183594-13.285157-9.671875-20.472657-5.554688-7.1875 4.121094-9.671875 13.289063-5.550781 20.476563 67.914062 118.476563-17.800781 266.378906-153.894531 266.378906h-60.097657l22.59375-22.632812c5.855469-5.863281 5.847657-15.359375-.015624-21.214844-5.863282-5.851563-15.363282-5.84375-21.214844.019531l-48.117188 48.199219c-6.003906 6.015625-5.808594 15.765625.363282 21.558594l47.753906 47.835937c5.851562 5.859375 15.347656 5.875 21.214844.019532 5.863281-5.855469 5.871093-15.351563.019531-21.214844l-22.53125-22.570313h60.21875c158.65625-.003906 259.230469-172.609375 179.730469-311.300781zm0 0"/>
      <path className={classes} d="m193.230469 211h60c8.28125 0 15-6.71875 15-15 0-8.285156-6.71875-15-15-15h-30v-15c0-8.285156-6.71875-15-15-15-8.285157 0-15 6.714844-15 15v15c-24.816407 0-45 20.1875-45 45s20.183593 45 45 45h29.996093c8.273438 0 15.003907 6.726562 15.003907 15s-6.691407 15.003906-15.003907 15.003906c-.003906 0-60-.003906-59.996093-.003906-8.285157 0-15 6.714844-15 14.996094-.003907 8.285156 6.710937 15 14.996093 15.003906h30.003907v15c0 8.28125 6.714843 15 15 15 8.28125 0 15-6.71875 15-15v-14.996094c24.867187 0 45-20.121094 45-45.003906 0-24.8125-20.191407-45-45.003907-45h-29.996093c-8.273438 0-15-6.730469-15-15 0-8.273438 6.726562-15 15-15zm0 0"/>
    </svg>
  );
}

const { string } = PropTypes;

IconSubscription.defaultProps = {
  className: null,
  rootClassName: null,
}

IconSubscription.propTypes = {
  className: string,
  rootClassName: string,
}

export default IconSubscription;
