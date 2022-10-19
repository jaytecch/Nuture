import React from 'react';
import {injectIntl, intlShape} from '../../util/reactIntl';
import {isScrollingDisabled} from '../../ducks/UI.duck';
import {bool, object} from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import config from '../../config';
import {
  Footer, Hero, LandingCarousel,
  LayoutSingleColumn,
  LayoutWrapperFooter,
  LayoutWrapperMain,
  LayoutWrapperTopbar,
  Page, PrimaryButton,
  SectionHero,
  SectionServices,
} from '../../components';
import {TopbarContainer} from '../../containers';
import MailchimpSubscribe from "react-mailchimp-subscribe";
import facebookImage from '../../assets/nurtureupFacebook-1200x630.jpg';
import twitterImage from '../../assets/nurtureupTwitter-600x314.jpg';
import css from './LandingPage.css';
import heroUrl from '../../assets/hero-landing/hero-landing.png';
import mobileHeroUrl from '../../assets/hero-landing/midwife-750px.png';
import SectionHowItWorks from "./SectionHowItWorks";
import SectionVetting from "./SectionVetting";
import {FormattedMessage} from "react-intl";


export const LandingPageComponent = props => {
  const {
    history,
    intl,
    location,
    scrollingDisabled,
  } = props;

  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({id: 'LandingPage.schemaTitle'}, {siteTitle});
  const schemaDescription = intl.formatMessage({id: 'LandingPage.schemaDescription'});
  const schemaImage = `${config.canonicalRootURL}${facebookImage}`;
  const mailchimpUrl = config.mailchimp.url;

  const url = "https://candygyrltravels.us20.list-manage.com/subscribe/post?u=7703d03fb6f7b47790a6cf76d&amp;id=cf9d1e4594";
  const SimpleForm = (
    <div className={css.subscribeForm}>
      <MailchimpSubscribe url={mailchimpUrl}/>
    </div>
  );

  const CustomForm = ({status, message, onValidated}) => {
    let email;
    const STATE_RE = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i;




    const submit = () =>

      email &&
      email.value.indexOf("@") > -1
      && onValidated({
        EMAIL: email.value,

      });

    return (
      <div>
        <div className={css.customFormDiv}>
          {status === "sending" && <div className={css.sendingMsg}>sending...</div>}

          <div className={css.subscribeBox}>

            <input className={css.emailInput}
                   ref={node => (email = node)}
                   type="email"
                   placeholder="Email Address"
            />

            <PrimaryButton className={css.subscribeButton} onClick={submit}>
              SUBSCRIBE
            </PrimaryButton>
          </div>
        </div>
        <div className={css.subscribeStatus}>
          {status === "error" && (
            <div
              className={css.errorMsg} dangerouslySetInnerHTML={{__html: message}}
            />
          )}
          {status === "success" && (
            <div
              className={css.successMsg}
              dangerouslySetInnerHTML={{__html: message}}
            />
          )}
        </div>
      </div>
    );
  };
  return (
    <Page
      className={css.root}
      scrollingDisabled={scrollingDisabled}
      contentType="website"
      description={schemaDescription}
      title={schemaTitle}
      facebookImages={[{url: facebookImage, width: 1200, height: 630}]}
      twitterImages={[
        {url: `${config.canonicalRootURL}${twitterImage}`, width: 600, height: 314},
      ]}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WebPage',
        description: schemaDescription,
        name: schemaTitle,
        image: [schemaImage],
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer/>

          <Hero url={heroUrl} mobileUrl={mobileHeroUrl} rootClassName={css.heroRootClass}>
            <SectionHero history={history} location={location}/>
          </Hero>
        </LayoutWrapperTopbar>
        <LayoutWrapperMain className={css.flexcontainer}>
          <div className={css.row}>
            <p className={css.manuscriptText}>
              <FormattedMessage id='LandingPage.manuscriptText' />
            </p>
            <LandingCarousel/>
          </div>

          <div className={css.subSectionGroup}>
            <SectionHowItWorks />
            <SectionVetting />
            <SectionServices className={css.ourservices} textType={'landing'}/>
          </div>


          <ul className={css.sections}>
            <li className={css.section}>
              <div className={css.centerDiv}>
                <h2 className={css.headerText}>STAY CONNECTED</h2>
                <p className={css.centeredText}>Subscribe for news, updates and announcements from
                  NurtureUp</p>
                <MailchimpSubscribe
                  className={css.subscribeForm}
                  url={mailchimpUrl}
                  render={({subscribe, status, message}) => (
                    <CustomForm
                      status={status}
                      message={message}
                      onValidated={formData => subscribe(formData)}
                    />)}
                />
              </div>
            </li>

          </ul>

        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer/>
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

LandingPageComponent.defaultProps = {
  currentUserListing: null,
  currentUserListingFetched: false,
};

LandingPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,

// from withRouter
  history: object.isRequired,
  location: object.isRequired,

// from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {

  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(
  connect(
    mapStateToProps,
  ),
  injectIntl
)(LandingPageComponent);

export default LandingPage;
