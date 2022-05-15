import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './SummaryConsumerRights.css';
import FieldCheckbox from "../FieldCheckbox/FieldCheckbox";
import {PrimaryButton} from "..";


const SummaryConsumerRights = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  const showBackgroundDisclosures = values => {
    //window.alert('I made it');
    //this.setState({showDisclosures: true});
    //this.setState({showPaymentDiv: false});
    //this.setState({showBackgroundDiv:false});

  };


  // prettier-ignore
  return (
    <div className={classes}>
      <p className={css.lastUpdated}>Last updated: July 18, 2020</p>

      <p>
        Para información en español, visite  www.consumerfinance.gov/learnmore o escribe a la Consumer
        Financial Protection Bureau, 1700 G Street N.W., Washington, DC 20552.
      </p>

      <h2> A Summary of Your Rights Under the Fair Credit Reporting Act</h2>
      <p>
        The federal Fair Credit Reporting Act (FCRA) promotes the accuracy, fairness, and privacy of
        information in the files of consumer reporting agencies.  There are many types of consumer reporting
        agencies, including credit bureaus and specialty agencies (such as agencies that sell information about
        check writing histories, medical records, and rental history records).  Here is a summary of your major
        rights under FCRA.   For more information, including information about additional rights, go to
        www.consumerfinance.gov/learnmore or write to: Consumer Financial Protection Bureau, 1700 G
        Street N.W., Washington, DC 20552.
      </p>
      <ul>
      <li>You must be told if information in your file has been used against you.   Anyone who uses a
      credit report or another type of consumer report to deny your application for credit, insurance, or
      employment – or to take another adverse action against you – must tell you, and must give you
        the name, address, and phone number of the agency that provided the information.</li>
      <li>You have the right to know what is in your file.   You may request and obtain all the
      information about you in the files of a consumer reporting agency (your “file disclosure”).  You
      will be required to provide proper identification, which may include your Social Security number.
        In many cases, the disclosure will be free.  You are entitled to a free file disclosure if: </li>
        <ul>
          <li> a person has taken adverse action against you because of information in your credit
      report; </li>
            <li>  you are the victim of identity theft and place a fraud alert in your file;</li>
              <li> your file contains inaccurate information as a result of fraud;</li>
                <li> you are on public assistance;</li>
                  <li> you are unemployed but expect to apply for employment within 60 days.</li>
        </ul>
        </ul>

      <p> In addition, all consumers are entitled to one free disclosure every 12 months upon request from each
      nationwide credit bureau and from nationwide specialty consumer reporting agencies.  See
        www.consumerfinance.gov/learnmore for additional information. </p>
       <ul>
         <li> You have the right to ask for a credit score.   Credit scores are numerical summaries of your
      credit­worthiness based on information from credit bureaus.  You may request a credit score from
      consumer reporting agencies that create scores or distribute scores used in residential real
      property loans, but you will have to pay for it.  In some mortgage transactions, you will receive
      credit score information for free from the mortgage lender.</li>
           <li>You have the right to dispute incomplete or inaccurate information.   If you identify
      information in your file that is incomplete or inaccurate, and report it to the consumer reporting
      agency, the agency must investigate unless your dispute is frivolous.  See
      www.consumerfinance.gov/learnmore for an explanation of dispute procedures.</li>
             <li> Consumer reporting agencies must correct or delete inaccurate, incomplete, or unverifiable
      information.   Inaccurate, incomplete, or unverifiable information must be removed or corrected,
      usually within 30 days.  However, a consumer reporting agency may continue to report
      information it has verified as accurate.</li>
               <li> Consumer reporting agencies may not report outdated negative information.   In most cases,
      a consumer reporting agency may not report negative information that is more than seven years
      old, or bankruptcies that are more than 10 years old.</li>
                 <li> Access to your file is limited.   A consumer reporting agency may provide information about you
      only to people with a valid need – usually to consider an application with a creditor, insurer,
      employer, landlord, or other business.  The FCRA specifies those with a valid need for access.</li>
                   <li> You must give your consent for reports to be provided to employers.   A consumer reporting
      agency may not give out information about you to your employer, or a potential employer,
      without your written consent given to the employer.  Written consent generally is not required in
      the trucking industry.  For more information, go to  www.consumerfinance.gov/learnmore .</li>
                     <li>You may limit “prescreened” offers of credit and insurance you get based on information in
      your credit report.   Unsolicited “prescreened” offers for credit and insurance must include a
      toll­free phone number you can call if you choose to remove your name and address form the lists
      these offers are based on.  You may opt out with the nationwide credit bureaus at
      1­888­5­OPTOUT (1­888­567­8688).</li>
                       <li>The following FCRA right applies with respect to nationwide consumer reporting agencies :
      CONSUMERS HAVE THE RIGHT TO OBTAIN A SECURITY FREEZE
      You have a right to place a “security freeze” on your credit report, which will prohibit a consumer
      reporting agency from releasing information in your credit report without your express
      authorization.   The security freeze is designed to prevent credit, loans, and services from being approved
      in your name without your consent.  However, you should be aware that using a security freeze to take
      control over who gets access to the personal and financial information in your credit report may delay,
      interfere with, or prohibit the timely approval of any subsequent request or application you make
      regarding a new loan, credit, mortgage, or any other account involving the extension of credit.
      As an alternative to a security freeze, you have the right to place an initial or extended fraud alert on your
      credit file at no cost.  An initial fraud alert is a 1­year alert that is placed on a consumer’s credit file.
      Upon seeing a fraud alert display on a consumer’s credit file, a business is required to take steps to verify
      the consumer’s identity before extending new credit.  If you are a victim of identity theft, you are entitled
      to an extended fraud alert, which is a fraud alert lasting 7 years.</li>
         </ul>

      <p>A security freeze does not apply to a person or entity, or its affiliates, or collection agencies acting on
      behalf of the person or entity, with which you have an existing account that requests information in your
      credit report for the purposes of reviewing or collecting the account.  Reviewing the account includes
      activities related to account maintenance, monitoring, credit line increases, and account upgrades and
        enhancements. </p>
      <ul>
        <li> You may seek damages from violators.   If a consumer reporting agency, or, in some cases, a
      user of consumer reports or a furnisher of information to a consumer reporting agency violates the
      FCRA, you may be able to sue in state or federal court.</li>
          <li> Identity theft victims and active duty military personnel have additional rights.   For more
      information, visit  www.consumerfinance.gov/learnmore .</li>
      </ul>
      <p> States may enforce the FCRA, and many states have their own consumer reporting laws.  In some
      cases, you may have more rights under state law.  For more information, contact your state or local
      consumer protection agency or your state Attorney General.  For information about your federal
        rights, contact: </p>

      <p className="s1" style={{paddingTop: '3pt',paddingLeft: '34pt',textIndent: '0pt',lineHeight: '119%',textAlign: 'center',}}>
        <a href="http://www.consumerfinance.gov/learnmore"
           target="_blank">Para información en español, visite </a>
        <a href="http://www.consumerfinance.gov/learnmore" className="s2"
        target="_blank">www.consumerfinance.gov/learnmore</a>
        <span> </span>
        Describe a la Consumer Financial Protection Bureau, 1700 G Street N.W., Washington, DC 20552.
      </p>




    </div>


  );
};

SummaryConsumerRights.defaultProps = {
  rootClassName: null,
  className: null,
};

const { string } = PropTypes;

SummaryConsumerRights.propTypes = {
  rootClassName: string,
  className: string,
};

export default SummaryConsumerRights;
