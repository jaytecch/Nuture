import React from "react";
import {string, node} from 'prop-types';
import css from "./Hero.css";
import classNames from 'classnames';

const Hero = props => {
  const {
    header,
    rootClassName,
    className,
    rootHeaderClass,
    headerClass,
    url,
    children
  } = props;

  const containerClass = classNames(rootClassName, css.heroContainer);
  const contentClass = classNames(className, css.heroContent);
  const searchHeroText = classNames(headerClass, css.searchHeroText);
  const heroTextContainer = classNames(rootHeaderClass, css.heroTextContainer)

  return (
    <div className={containerClass}>
      {header ? (
        <div className={heroTextContainer}>
          <h3 className={searchHeroText}>{header}</h3>
        </div>
      ) : null}
      <div className={contentClass} style={{backgroundImage: `url(${url})`}}/>
      {children}
    </div>
  )
}

Hero.defaultProps = {
  rootClassName: null,
  rootHeaderClass: null,
  headerClass: null,
  className: null,
  header: null,
  children: null,
}

Hero.propTypes = {
  header: string,
  headerClass: string,
  rootHeaderClass: string,
  url: string.isRequired,
  rootClassName: string,
  className: string,
  children: node,
}

export default Hero;
