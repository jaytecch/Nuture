import React, {useEffect, useState} from "react";
import css from './LandingCarousel.css';
import image1 from '../../assets/crib/crib.png';
import image2 from '../../assets/father-and-baby/father-and-baby.png';
import classNames from 'classnames'
import NamedLink from "../NamedLink/NamedLink";

const slides = [
  {
    id: 1,
    url: image1,
    content: isCurrent => {
      const hiddenText = isCurrent ? null : css.hiddenText;
      const headerTextClass = classNames(css.carouselHeaderText, hiddenText);
      const headerSubTextClass = classNames(css.carouselHeaderSubText, hiddenText);
      const buttonClass = classNames(css.proSignupButton, {
        [css.hiddenButton]: !isCurrent
      })

      return (
        <React.Fragment>
          <div className={css.carouselTextAndButtonGroup}>
            <p className={headerTextClass}>FOR PARENTS</p>
            <p className={headerSubTextClass}>I understand the challenges that new
              parents have</p>
            <NamedLink name="SignupPage" className={buttonClass}>
              <p className={css.proButtonText}>SIGN UP AS A PARENT</p>
            </NamedLink>
          </div>

          <div className={css.carouselImageContainer}>
            <img className={css.carouselImageParent}/>
          </div>
        </React.Fragment>
      )
    }
  },
  {
    id: 2,
    url: image2,
    content: isCurrent => {
      const hiddenText = isCurrent ? null : css.hiddenText;
      const headerTextClass = classNames(css.carouselHeaderText, hiddenText);
      const headerSubTextClass = classNames(css.carouselHeaderSubText, hiddenText);
      const buttonClass = classNames(css.proSignupButton, {
        [css.hiddenButton]: !isCurrent
      })

      return (
        <React.Fragment>
          <div className={css.carouselTextAndButtonGroup}>
            <p className={headerTextClass}>FOR SERVICE PROS</p>
            <p className={headerSubTextClass}>I understand the challenges that new
              parents have</p>
            <NamedLink name="SignupPage" className={buttonClass}>
              <p className={css.proButtonText}>SIGN UP AS A SERVICE PRO</p>
            </NamedLink>
          </div>

          <div className={css.carouselImageContainer}>
            <img className={css.carouselImageProvider}/>
          </div>
        </React.Fragment>
      )
    }
  }
]

const LandingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => nextSlide(), 8000);

    return () => clearTimeout(timer);
  })

  const nextSlide = () => {
    const numSlides = slides.length;

    if (currentSlide === numSlides) {
      setCurrentSlide(1);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  }

  return (
    <div className={css.root}>
      <div className={css.slide}>
        {slides.map(slide => {
          const isCurrent = slide.id === currentSlide;
          const classname = classNames(css.slideContentsBase, {
            [css.hidden]: !isCurrent,
          })

          return (
            <div className={classname}>
              {slide.content(isCurrent)}
            </div>
          )
        })}
        <div className={css.ellipseGroup}>
          {slides.map(slide => {
            const classes = classNames(css.ellipseBase, {
              [css.selectedEllipse]: slide.id === currentSlide,
            })

            return (<div className={classes} onClick={() => setCurrentSlide(slide.id)} />)
          })}
        </div>
      </div>
    </div>

  )
}

export default LandingCarousel;
