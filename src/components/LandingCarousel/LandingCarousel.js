import React from "react";
import css from './LandingCarousel.css';
import classNames from 'classnames'
import NamedLink from "../NamedLink/NamedLink";
import {FormattedMessage} from "react-intl";
import parentUrl from '../../assets/homepage/mother_and_baby.png';
import proUrl from '../../assets/homepage/servicepro-home.png';

const LandingCarousel = () => {
  // return (
  //   <div className={css.slideBody}>
  //     <section className={css.carousel} aria-label="Gallery">
  //       <ol className={classNames(css.listBase, css.carouselViewport)}>
  //
  //         <li id="carouselSlide1" tabIndex="0"
  //             className={classNames(css.listBase, css.carouselSlide)}>
  //           <div className={css.carouselSnapper}>
  //             <div className={css.slide}>
  //               <div className={classNames(css.carouselTextAndButtonGroup, css.carouselTextLeft)}>
  //                 <p className={css.carouselHeaderText}>FOR PARENTS</p>
  //                 <p className={css.carouselHeaderSubText}>
  //                   <FormattedMessage id={"LandingCarousel.parentMissionStatement"}/>
  //                 </p>
  //                 <NamedLink name="SignupPage" className={css.signupButton}>
  //                   <p className={css.buttonText}>SIGN UP AS A PARENT</p>
  //                 </NamedLink>
  //               </div>
  //
  //               <div className={css.carouselImageContainer}>
  //                 <img className={css.carouselImageParent} src={parentUrl}/>
  //               </div>
  //             </div>
  //           </div>
  //         </li>
  //
  //         <li id="carouselSlide2" tabIndex="0"
  //             className={classNames(css.listBase, css.carouselSlide)}>
  //           <div className={css.carouselSnapper}>
  //             <div className={css.slide}>
  //               <div className={css.carouselImageContainer}>
  //                 <img className={css.carouselImageProvider} src={proUrl}/>
  //               </div>
  //
  //               <div className={css.carouselTextAndButtonGroup}>
  //                 <p className={css.carouselHeaderText}>FOR SERVICE PROS</p>
  //                 <p className={css.carouselHeaderSubText}>
  //                   <FormattedMessage id={"LandingCarousel.proMissionStatement"}/>
  //                 </p>
  //                 <NamedLink name="SignupPage" className={css.signupButton}>
  //                   <p className={css.buttonText}>SIGN UP AS A SERVICE PRO</p>
  //                 </NamedLink>
  //               </div>
  //             </div>
  //           </div>
  //         </li>
  //       </ol>
  //
  //     </section>
  //   </div>
  // )

  return (
    <div className={css.root}>
      <div className={css.slide}>
        <div className={classNames(css.carouselTextAndButtonGroup, css.carouselTextLeft)}>
          <p className={css.carouselHeaderText}>FOR PARENTS</p>
          <p className={css.carouselHeaderSubText}>
            <FormattedMessage id={"LandingCarousel.parentMissionStatement"}/>
          </p>
          <NamedLink name="SignupPage" className={css.signupButton}>
            <p className={css.buttonText}>SIGN UP AS A PARENT</p>
          </NamedLink>
        </div>

        <div className={css.carouselImageContainer}>
          <img className={css.carouselImageParent} src={parentUrl}/>
        </div>
      </div>

      <div className={css.slide}>
        <div className={css.carouselImageContainer}>
          <img className={css.carouselImageProvider} src={proUrl}/>
        </div>

        <div className={css.carouselTextAndButtonGroup}>
          <p className={css.carouselHeaderText}>FOR SERVICE PROS</p>
          <p className={css.carouselHeaderSubText}>
            <FormattedMessage id={"LandingCarousel.proMissionStatement"}/>
          </p>
          <NamedLink name="SignupPage" className={css.signupButton}>
            <p className={css.buttonText}>SIGN UP AS A SERVICE PRO</p>
          </NamedLink>
        </div>
      </div>
    </div>
  )
}

export default LandingCarousel;
