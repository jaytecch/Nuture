import React from 'react';
import config from '../../config';
import {twitterPageURL} from '../../util/urlHelpers';
import {StaticPage, TopbarContainer} from '../../containers';
import {
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  ExternalLink, SectionServices, Hero
} from '../../components';
import heroUrl from '../../assets/father-child-floor/father-child-floor.jpeg';
import css from './AboutPage.css';
import image from '../../assets/about/jael_new_about.jpg';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';

const AboutPage = () => {
  const {siteTwitterHandle, siteFacebookPage} = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  const ourCompany = (
    <div className={css.ourCompanyContent}>

      <div className={css.row}>
        <div className={css.singleColumn}>
          <h2 className={css.headerText}>
            <FormattedMessage id="AboutMePage.ourCompanyTitle"/>
          </h2>

          <p className={css.smallfont}>
            <FormattedMessage id="AboutMePage.ourCompanyText-p1"/>
          </p>
          <p className={css.smallfont}>
            <FormattedMessage id="AboutMePage.ourCompanyText-p2"/>
          </p>

          <p className={classNames(css.smallfont, css.statsTitle)}><b>Key Stats</b></p>
          <ul className={css.statsList}>
            <li className={classNames(css.smallFontli, css.liNoBullet)}><b
              className={css.statsBold}>1 in 3</b> women experienced problems in the first 3 days of
              breastfeeding.
            </li>
            <li className={classNames(css.smallFontli, css.liNoBullet)}><b
              className={css.statsBold}>95%</b> of car seats are wrongly installed in the U.S.
            </li>
            <li className={classNames(css.smallFontli, css.liNoBullet)}><b
              className={css.statsBold}>40%</b> of moms feel overwhelmed and depressed by the
              demands of a new baby.
            </li>
            <li className={classNames(css.smallFontli, css.liNoBullet)}><b
              className={css.statsBold}>69%</b> of parents say they don’t know what to do with a new
              baby.
            </li>
            <li className={classNames(css.smallFontli, css.liNoBullet)}><b
              className={css.statsBold}>70%</b> of expectant moms suffer with anxiety about giving
              birth to a new baby.
            </li>
            <li className={classNames(css.smallFontli, css.liNoBullet)}><b
              className={css.statsBold}>In 2020</b>, home births have risen in the U.S 77%.
            </li>
          </ul>

        </div>
      </div>
    </div>

  );
  const meetTheFounder = (
    <div className={css.ourCompanyContent}>

      <div className={css.row}>
        <div className={css.columnLeft}>
          <h2 className={css.headerText}>
            <FormattedMessage id="AboutMePage.founderTitle"/>
          </h2>

          <p className={css.smallfont}>
            <FormattedMessage id="AboutMePage.founderText"/>
          </p>
          <ul className={css.aboutUl}>
            <li className={css.smallFontli}>Pregnancy Rehabilitation</li>
            <li className={css.smallFontli}>Postpartum Doula</li>
            <li className={css.smallFontli}>Birth Doula</li>
            <li className={css.smallFontli}>Newborn Care Specialist</li>
            <li className={css.smallFontli}>Car Seat Technician</li>
            <li className={css.smallFontli}>Student Midwife</li>
            <li className={css.smallFontli}>Student IBCLC</li>
          </ul>
        </div>

        <div className={css.columnRight}>
          <img src={image} className={css.image}/>
        </div>
      </div>
    </div>

  );

  const howNurtureUpWorks = (
    <div className={css.howItWorks}>
      <div className={css.row}>
        <div className={css.columnLeft}>
          <h2 className={css.headerText}>
            HOW NURTUREUP WORKS
          </h2>
          {/*<p className={css.smallfont}>How much does it cost? </p>*/}
          <ul className={css.aboutUl}>
            <li className={css.smallFontli}>Parents pay only for the services they book</li>
            <li className={css.smallFontli}>Every provider sets their own rate</li>
            <li className={css.smallFontli}>Service professionals pay a transaction and processing
              fee of 20% once booked
            </li>
            <li className={css.smallFontli}>Service providers are experts who assist parents to
              nurture and provide the best environment possible for their babies. They range from
              doulas to car seat technicians – whatever service you need to care for your little
              ones, you can find on our online platform. All service providers are certified in
              their fields and have been vetted through our rigorous process.
            </li>

            <li className={css.smallFontli}>Types of service providers include:</li>
            <ul className={css.aboutUl}>
              <li className={css.smallFontliNested}>Labor Doulas (supporting parents during the
                birth process)
              </li>
              <li className={css.smallFontliNested}>Postpartum Doulas (daytime and overnight
                caregivers)
              </li>
              <li className={css.smallFontliNested}>Lactation Consultants (assisting parents with
                all of baby’s feeding needs)
              </li>
              <li className={css.smallFontliNested}>Sleep Consultants (providing parents with
                guidance and tools to create good sleep habits)
              </li>
              <li className={css.smallFontliNested}>Car Seat Technicians (ensuring car seats are
                properly installed and safely positioned for baby)
              </li>
              <li className={css.smallFontliNested}>Midwives (trained health professionals who help
                women during labor, delivery, and after the birth of their babies)
              </li>
              <li className={css.smallFontliNested}>Newborn Care Specialists (skilled in newborn
                care)
              </li>
              <li className={css.smallFontliNested}>Meal Prep Services</li>
              <li className={css.smallFontliNested}>Infant & Pregnancy Photography</li>
              <li className={css.smallFontliNested}>Childbirth Education</li>
            </ul>
          </ul>
        </div>
        <div className={css.columnRight}>
          {/*<img src={image} className={css.image}/>*/}
        </div>
      </div>
    </div>

  );

  const safety = (
    <div className={css.wavyContainer}>
      <div className={css.row}>
        <div className={css.singleColumn}>
          <h2 id="safety-anchor" className={css.headerText}>
            <FormattedMessage id="AboutMePage.safetyTitle"/>
          </h2>
          <p className={css.smallfont}>
            <FormattedMessage id="AboutMePage.safetyText"/>
          </p>
        </div>
      </div>
    </div>
  );


  // prettier-ignore
  return (
    <StaticPage
      title="About Us"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'AboutPage',
        description: 'About NurtureUp',
        name: 'About page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="AboutPage"/>
          <Hero url={heroUrl} header='About Us'/>
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>

          {ourCompany}
          <SectionServices className={css.ourServices} textType={'about'}/>
          {meetTheFounder}
          {howNurtureUpWorks}
          {safety}
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer/>
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
};

export default AboutPage;
