import React, {useState} from 'react';
import {func, number, shape, string} from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { twitterPageURL} from '../../util/urlHelpers';
import { withViewport } from '../../util/contextHelpers';
import config from '../../config';
import {
  IconSocialMediaFacebook,
  IconSocialMediaInstagram,
  IconSocialMediaTwitter,
  ExternalLink,
  NamedLink,
  Modal,
  LayoutWrapperMain,
  TermsOfService,
  Logo,
  Form,
  FieldTextInput,
  PrimaryButton,
  ContactModal,
} from '../../components';
import IconFacebookFooter from '../Icons/IconSocialMediaFacebook/IconFacebookFooter';
import IconInstagramFooter from "../Icons/IconSocialMediaInstagram/IconInstagramFooter";
import IconTwitterFooter from "../Icons/IconSocialMediaTwitter/IconTwitterFooter";
import Mailchimp from 'react-mailchimp-form';
import MailchimpSubscribe from "react-mailchimp-subscribe";
import css from './Footer.css';
import {manageDisableScrolling} from "../../ducks/UI.duck";
import {compose} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import TermsOfUsage from "../TermsOfUsage/TermsOfUsage";
import TermsOfUsagePdf from '../../components/TermsOfUsage/TermsofUse.pdf';
import CovidWaiverPdf from '../../assets/documents/COVID-19 Waiver_Draft.pdf'
import FAQ from "../FAQ/FAQ";
import whiteLogo from '../../assets/nurtureup_logo/white-nu-logo.png';
import diclosureForBackgroundInvestigation
  from "../BackgroundDisclosures/Disclosure_Regarding_Background_Investigation__March_2018_NurtureUp.pdf";
import SinglePagePDFViewer from "../Pdf/single-page";
import { HashLink as Link } from 'react-router-hash-link';
import * as validators from "../../util/validators";
import Button from "../Button/Button";
import BioForm from "../../forms/BioForm/BioForm";
import BioPage from "../../containers/BioPage/BioPage";

const renderSocialMediaLinks = intl => {
  const { siteFacebookPage, siteInstagramPage, siteTwitterHandle } = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  const goToFb = intl.formatMessage({ id: 'Footer.goToFacebook' });
  const goToInsta = intl.formatMessage({ id: 'Footer.goToInstagram' });
  const goToTwitter = intl.formatMessage({ id: 'Footer.goToTwitter' });



  const fbLink = siteFacebookPage ? (
    <ExternalLink key="linkToFacebook" href={siteFacebookPage} className={css.icon} title={goToFb}>
      {/*<IconSocialMediaFacebook />*/}
      <IconFacebookFooter />
    </ExternalLink>
  ) : null;

  const twitterLink = siteTwitterPage ? (
    <ExternalLink
      key="linkToTwitter"
      href={siteTwitterPage}
      className={css.icon}
      title={goToTwitter}
    >
      <IconTwitterFooter />
    </ExternalLink>
  ) : null;

  const instragramLink = siteInstagramPage ? (
    <ExternalLink
      key="linkToInstagram"
      href={siteInstagramPage}
      className={css.icon}
      title={goToInsta}
    >
      <IconInstagramFooter />
    </ExternalLink>
  ) : null;
  return [fbLink, twitterLink, instragramLink].filter(v => v != null);
};

const subscribeButton = (
  <NamedLink name="Subscribe" className={css.subscribeButton}>
      <span className={css.subscribe}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
  </NamedLink>
);

export const FooterComponent = props => {
  const { rootClassName, className, intl, onManageDisableScrolling, viewport } = props;
  const socialMediaLinks = renderSocialMediaLinks(intl);
  const classes = classNames(rootClassName || css.root, className);
  const [modalOpen, setModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [covidModalOpen, setCovidModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const mailchimpUrl = config.mailchimp.url;

  //console.log('mailchimp url = ' + mailchimpUrl );

  const windowWidth = viewport.width;
  //const url = "https://candygyrltravels.us20.list-manage.com/subscribe/post?u=7703d03fb6f7b47790a6cf76d&amp;id=cf9d1e4594";
  const SimpleForm = (
    <div className={css.subscribeForm}>
      <MailchimpSubscribe url={mailchimpUrl}/>
    </div>
  );

  const CustomForm = ({status, message, onValidated}) => {
    let email;
    const submit = () =>
      email &&
      email.value.indexOf("@") > -1 &&
      onValidated({
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

          <button className={css.subscribeButton} onClick={submit}>
            Subscribe
          </button>
        </div>
        <div>
          <div className={css.subscribeStatus}>
          {status === "error" && (
            <div
              className={css.errorMsg}
              dangerouslySetInnerHTML={{__html: message}}
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
        </div>
      </div>
    );
  };
  return (

    <div className={classes}>
      <div className={css.topBorderWrapper}>
        <div className={css.content}>
          {/*<div className={css.someLiksMobile}>{socialMediaLinks}</div>*/}
          <div className={css.links}>
            <div className={css.infoLinks}>
              <ul className={css.list}>
                <li className={css.listItem}>
                <img src={whiteLogo}
                  className={css.whitelogo}
                  alt={intl.formatMessage({ id: 'TopbarDesktop.logo' })}
                />
                </li>
                <li className={css.listItem}>
                  <p className={css.link}>© 2021 NurtureUp </p>
                </li>

              </ul>
            </div>
            <div className={css.infoLinks}>
              <ul className={css.list}>
                <li><h3 className={css.headerText}>Resources</h3></li>
                {/*<li className={css.listItem}>*/}
                {/*  <NamedLink name="LandingPage" className={css.link}>*/}
                {/*    <FormattedMessage id="Footer.privacyStatement" />*/}
                {/*  </NamedLink>*/}
                {/*</li>*/}
                <li className={css.listItem}>
                  {windowWidth > 700 ? <a href="#" className={css.link} onClick={() => setCovidModalOpen(true )}>Covid-19 Waiver</a> :
                    <a href={CovidWaiverPdf} className={css.link} download={"NU COVID-19 Waiver"} >COVID-19 Waiver</a>
                  }


                </li>
                <li className={css.listItem}>
                  {windowWidth > 700 ?
                    <a href="#" className={css.link} onClick={() => setModalOpen(true)}>
                      <FormattedMessage id="Footer.termsOfUsage"/></a> :
                    <a href={TermsOfUsagePdf} className={css.link} download={"NU Terms Of Usage"}>Terms of Usage</a>
                  }
                </li>
                <li className={css.listItem}>
                  <a href="#" className={css.link} onClick={() => setFaqModalOpen(true )}>
                    <FormattedMessage id="Footer.toFaqPage" /></a>
                </li>
              </ul>
            </div>
            <div className={css.searches}>
              <ul className={css.list}>
                <li><h3 className={css.headerText}>Company</h3></li>
                <li className={css.listItem}>
                  <NamedLink
                    name="AboutPage"
                    className={css.link}
                  >
                    <FormattedMessage id="Footer.aboutUs" />
                  </NamedLink>
                </li>
                <li className={css.listItem}>
                  <Link


                    // href="safety-anchor"

                    className={css.link}
                  >
                    <FormattedMessage id="Footer.safety" />
                  </Link>
                </li>
                {/*<li className={css.listItem}>*/}
                {/*  <NamedLink*/}
                {/*    name="LandingPage"*/}
                {/*    className={css.link}*/}
                {/*  >*/}
                {/*    <FormattedMessage id="Footer.press" />*/}
                {/*  </NamedLink>*/}
                {/*</li>*/}
                <li className={css.listItem}>
                  <Link
                    className={css.link}
                    onClick={() => setContactModalOpen(true )}
                  >
                    <FormattedMessage id="Footer.toContactUs" />
                  </Link>
                </li>
              </ul>
            </div>
            <div className={css.socialMedia}>
              <ul className={css.list}>
                <li><h3 className={css.headerText}>Stay Connected</h3></li>
                <li className={css.listItem}>
                  <div className={css.link}>
                    {socialMediaLinks}
                  </div>
                </li>
                <li className={css.listItem}>
                  <div>
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
            </div>

          </div>
        </div>
      </div>
      <Modal
        id="termsOfServiceModal"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        {/*<TermsOfUsage/> */}
        <SinglePagePDFViewer pdf={TermsOfUsagePdf}/>
      </Modal>
      <Modal
        id="faqModal"
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        onManageDisableScrolling={onManageDisableScrolling}
      ><FAQ/> </Modal>

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <Modal
        id="covidModal"
        isOpen={covidModalOpen}
        onClose={() => setCovidModalOpen(false)}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <SinglePagePDFViewer pdf={CovidWaiverPdf}/>
      </Modal>
    </div>
  );
};


FooterComponent.defaultProps = {
  rootClassName: null,
  className: null,
};

FooterComponent.propTypes = {
  rootClassName: string,
  className: string,
  intl: intlShape.isRequired,
  onManageDisableScrolling: func.isRequired,
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const Footer = compose(
  withRouter,
  connect(null, mapDispatchToProps),
  withViewport,
  injectIntl,
)(FooterComponent);

export default Footer;
