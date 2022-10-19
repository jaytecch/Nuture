import React, {useEffect, useState} from "react";
import {string, node} from 'prop-types';
import css from "./Hero.css";
import classNames from 'classnames';
import { useGlobalEvent, useDebouncedFn } from "beautiful-react-hooks";
import {withViewport} from "../../util/contextHelpers";
import {compose} from "redux";

const MAX_MOBILE_WIDTH = 768;

const HeroComponent = props => {
  const {
    header,
    rootClassName,
    rootHeaderClass,
    headerClass,
    url,
    mobileUrl,
    children,
    viewport
  } = props;

  const [useMobile, setUseMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const onWindowResize = useGlobalEvent("resize");

  useEffect(() => {
    return () => {
      const vp = viewport.width;
      const setWidth = vp === 0 ? window.innerWidth : vp;
      setUseMobile(setWidth <= MAX_MOBILE_WIDTH);
      setWindowWidth(setWidth);
    }
  })

  const onWindowResizeHandler = useDebouncedFn(() => {
    const newWidth = viewport.width;

    if(windowWidth > MAX_MOBILE_WIDTH && newWidth <= MAX_MOBILE_WIDTH) {
      setUseMobile(true);
      setWindowWidth(newWidth)
    } else if(windowWidth <= MAX_MOBILE_WIDTH && newWidth > MAX_MOBILE_WIDTH) {
      setUseMobile(false);
      setWindowWidth(newWidth);
    }

  }, 250);

  onWindowResize(onWindowResizeHandler);

  const containerClass = classNames(rootClassName, css.heroContainer);
  const searchHeroText = classNames(headerClass, css.searchHeroText);
  const heroTextContainer = classNames(rootHeaderClass, css.heroTextContainer)

  const heroUrl = mobileUrl && useMobile ? mobileUrl : url;

  return (
    <div className={containerClass} style={{backgroundImage: `url(${heroUrl})`}}>
      {header ? (
        <div className={heroTextContainer}>
          <h3 className={searchHeroText}>{header}</h3>
        </div>
      ) : null}

      {children}
    </div>
  )
}

HeroComponent.defaultProps = {
  rootClassName: null,
  rootHeaderClass: null,
  headerClass: null,
  header: null,
  children: null,
  mobileUrl: null,
}

HeroComponent.propTypes = {
  header: string,
  headerClass: string,
  rootHeaderClass: string,
  url: string.isRequired,
  mobileUrl: string,
  rootClassName: string,
  children: node,
}

const Hero = compose(
  withViewport,
)(HeroComponent);

export default Hero;
