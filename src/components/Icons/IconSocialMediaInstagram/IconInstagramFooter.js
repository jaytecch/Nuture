import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './IconSocialMediaInstagram.css';

const IconInstagramFooter = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (

    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="40" height="40" x="0" y="0"
         viewBox="0 0 512 512" space="preserve"
         ><g>
<circle xmlns="http://www.w3.org/2000/svg"  cx="256" cy="256" r="256" fill="#e36253"
        data-original="#ef72ad"/>
<path xmlns="http://www.w3.org/2000/svg"
      d="M256,0c-11.317,0-22.461,0.744-33.391,2.167C348.216,18.53,445.217,125.933,445.217,256  s-97.002,237.47-222.609,253.833C233.539,511.256,244.683,512,256,512c141.385,0,256-114.616,256-256S397.385,0,256,0z"
      fill="#e36253" data-original="#ee539e" />
<g xmlns="http://www.w3.org/2000/svg">
	<path
        d="M350.84,91.826H161.16c-38.231,0-69.334,31.103-69.334,69.334v189.682   c0,38.231,31.103,69.334,69.334,69.334h189.682c38.231,0,69.334-31.103,69.334-69.334V161.16   C420.174,122.929,389.071,91.826,350.84,91.826z M403.478,350.84c0,29.025-23.613,52.638-52.638,52.638H161.16   c-29.025,0-52.638-23.613-52.638-52.638V161.16c0-29.025,23.613-52.638,52.638-52.638h189.682   c29.025,0,52.638,23.613,52.638,52.638v189.68H403.478z"
        fill="#ffffff" data-original="#ffffff"/>
  <path
        d="M256,169.739c-47.565,0-86.261,38.696-86.261,86.261s38.696,86.261,86.261,86.261   s86.261-38.696,86.261-86.261S303.565,169.739,256,169.739z M256,325.565c-38.358,0-69.565-31.208-69.565-69.565   s31.208-69.565,69.565-69.565s69.565,31.208,69.565,69.565S294.358,325.565,256,325.565z"
        fill="#ffffff" data-original="#ffffff"/>
  <circle  cx="345.043" cy="155.826" r="22.261" fill="#ffffff" data-original="#ffffff"/>
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
</g></svg>


  );
};

IconInstagramFooter.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconInstagramFooter.propTypes = { rootClassName: string, className: string };

export default IconInstagramFooter;
