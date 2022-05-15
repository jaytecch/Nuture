import React from 'react';
import config from '../../config';
import { twitterPageURL } from '../../util/urlHelpers';
import { StaticPage, TopbarContainer } from '../../containers';
import {
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  ExternalLink, SectionServices,
} from '../../components';

import css from './AboutPage.css';
import image from '../../assets/about/jael_new_about.jpg';

const AboutPage = () => {
  const { siteTwitterHandle, siteFacebookPage } = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  const ourCompany = (
    <div className={css.ourCompanyContent}>

      <div className={css.row}>
        <div className={css.columnLeft}>
      <h2 className={css.headerText}>
            OUR COMPANY
      </h2>

      <p className={css.smallfont}>
        {/*<span className={css.OurCompanyImg}>*/}
        {/*  <img src={image} />*/}
        {/*</span>*/}
        NurtureUp was founded in response to the growing needs families have.  The strength of a parent-child relationship begins in the womb. When parents have the proper resources and support to help them understand how to care for themselves and their babies, they are well on their way to beginning their parenting journey successfully. Unfortunately, this has not been the case in our society.  Mothers who suffer from postpartum depression ought to have a postpartum doula by their side, but they may not know where to find an affordable doula.  Many new parents have car seats that are installed incorrectly and are not aware of where to find car seat technicians. There are many resources that new parents should have that they are unaware of or cannot afford.  The disconnect between parents and services they need is also a result of the obstacles service providers must overcome to connect with families.
      </p>
      <p className={css.smallfont}>
        NurtureUp is dedicated to helping new and expectant parents during the process. We are currently working to address the disparities in maternal services for minority women. We are partnering with various organizations to raise funds for mothers who cannot afford to pay for service providers. Stay tuned for more updates…
      </p>
        </div>
        <div className={css.columnRight}>
            {/*<img src={image} className={css.image}/>*/}
        </div>
      </div>
  </div>

  );
  const meetTheFounder = (
    <div className={css.ourCompanyContent}>

      <div className={css.row}>
        <div className={css.columnLeft}>
      <h2 className={css.headerText}>
        MEET THE FOUNDER
      </h2>

      <p className={css.smallfont}>
        Jael is the woman behind a platform that connects parents of new babies with service providers who offer the care services they desire. Her passion to assist parents stems from her own experience of having a newborn and having difficulty finding the right type of care for her and her baby.. Furthermore, as she worked as a  postpartum doula she realized that service providers do not have enough opportunities to find independent work either. Out of these two needs, NurtureUp was born.
        Jael has worked with young children and babies for the past ten years. She has helped more than 60 mothers and families nurture and properly care for babies while they transition through inevitable and challenging changes. Her training and certification background include:
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

      <p className={css.smallfont}>
        In Jael’s Own Words…
        “Once I became a Postpartum Doula, I began searching for jobs and found that there was no website for a provider like myself. There were many fragmented pieces of the market. So, I asked myself, ‘As a parent – what would I have wanted to help nurture my babies, and as a provider – what did I need to be successful?’ I started speaking with other providers and parents and realized my experiences were not unique..
        During my training as a car seat technician I learned so much safety information that is not taught to parents. I was shocked at how many car seats are installed the wrong way.
        I wanted a health tech marketplace for parents to find the services they need and providers to find the clients they desire. I developed this platform with both parties in mind, to provide the best value for each of them.”

      </p>
    </div>

        <div className={css.columnRight}>
          <img src={image} className={css.image}/>
        </div>
      </div>
    </div>

  );

  const howNurtureUpWorks =(

      <div className={css.wavyContainer}>

      <div className={css.row}>
        <div className={css.columnLeft}>
          <h2 className={css.headerText}>
            HOW NURTUREUP WORKS
          </h2>
          {/*<p className={css.smallfont}>How much does it cost? </p>*/}
          <ul className={css.aboutUl}>
             <li className={css.smallFontli}>Parents pay only for the services they book</li>
             <li className={css.smallFontli}>Every provider sets their own rate</li>
             <li className={css.smallFontli}>Service professionals pay a transaction and processing fee of 20% once booked</li>
             <li className={css.smallFontli}>Service providers are experts who assist parents to nurture and provide the best environment possible for their babies. They range from doulas to car seat technicians – whatever service you need to care for your little ones, you can find on our online platform. All service providers are certified in their fields and have been vetted through our rigorous process.</li>

             <li className={css.smallFontli}>Types of service providers include:</li>
            <ul className={css.aboutUl}>
               <li className={css.smallFontliNested}>Labor Doulas (supporting parents during the birth process)</li>
               <li className={css.smallFontliNested}>Postpartum Doulas (daytime and overnight caregivers)</li>
               <li className={css.smallFontliNested}>Lactation Consultants (assisting parents with all of baby’s feeding needs)</li>
               <li className={css.smallFontliNested}>Sleep Consultants (providing parents with guidance and tools to create good sleep habits)</li>
               <li className={css.smallFontliNested}>Car Seat Technicians (ensuring car seats are properly installed and safely positioned for baby)</li>
               <li className={css.smallFontliNested}>Midwives (trained health professionals who help women during labor, delivery, and after the birth of their babies)</li>
               <li className={css.smallFontliNested}>Newborn Care Specialists (skilled in newborn care)</li>
               <li className={css.smallFontliNested}>Meal Prep Services</li>
               <li className={css.smallFontliNested}>Infant & Pregnancy Photography</li>
               <li className={css.smallFontliNested}>Childbirth Education </li>
            </ul>
          </ul>


          <div className={css.safetyContainer}><h2 id="safety-anchor" className={css.headerText}>
            SAFETY
          </h2>
          <p className={css.smallfont}>At the heart of NurtureUp is safety. We value providing safety to babies, parents, and our service providers. All service providers affiliated with NurtureUp have passed our Safety Check; which include background checks and certification verifications so that parents can trust the provider they are working with. As we navigate the current climate of the COVID-19 pandemic, all users of the platform are required to sign our COVID-19 waiver agreement and parties are encouraged to practice preventative measures and discuss with one another proper safety measures for the well being of both parent clients and service providers.
          </p>
        </div>
        </div>
        <div className={css.columnRight}>
          {/*<img src={image} className={css.image}/>*/}
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
          <TopbarContainer
            currentPage="AboutPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
          <div className={css.heroContainer}>
            <div className={css.heroContent}>
              <h2 className={css.heroText}> About Us </h2>
            </div>
          </div>
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>

          {ourCompany}
                <SectionServices className={css.ourServices} textType={'about'}/>
          {meetTheFounder}
          {howNurtureUpWorks}
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
};

export default AboutPage;
