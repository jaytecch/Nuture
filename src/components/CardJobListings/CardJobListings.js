import React from "react";
import css from "./CardJobListings.css";
import {injectIntl} from "react-intl";
import {compose} from "redux";
import {Card, NamedLink} from '../../components';
import classNames from 'classnames';
import {propTypes} from "../../util/types";
import {arrayOf, string, object, bool} from 'prop-types';

const MAX_LISTINGS = 3

export const CardJobListingsComponent = props => {
  const {
    className,
    intl,
    listings,
    error,
    fetchInProgress
  } = props;
  const classes = classNames(css.root, className);

  const header = intl.formatMessage({id: 'Dashboard.myJobListings'});

  const limitedListings = listings.slice(0, MAX_LISTINGS);

  return (
    <Card
      className={classes}
      flat={true}
      header={header}
    >
      <div className={css.content}>
        <div className={css.list}>
          {limitedListings.length > 0 ? limitedListings.map(listing => {
            const {id, attributes} = listing
            const {title, publicData} = attributes;
            const {applicants} = publicData;
            const numApplicants = applicants ? applicants.length : 0;
            const uuid = id.uuid;


            return (
              <div className={css.listingPadding}>
                <div className={css.shadow}>
                  <NamedLink
                    id={uuid}
                    key={uuid}
                    className={css.listing}
                    name="JobListingPage"
                    params={{id: uuid,}}
                  >
                    <div className={css.headingBar}>
                      <div className={css.row}>
                        <div className={css.column}>
                          <div className={css.columnLeft}>
                            <h3 className={css.title}>{title}</h3>
                          </div>
                          <div className={css.columnRight}>
                            <p className={css.applicantCount}>Applicants: {numApplicants}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NamedLink>
                </div>
              </div>
            );
          }) : (<h3 className={css.noListingHeader}>You have no job listings.</h3>)}
        </div>

        <NamedLink name="EditJobListingPage" className={css.namedLinkButton}>
          {listings.length > 0 ? "SEE MORE" : "CREATE A JOB"}
        </NamedLink>
      </div>

    </Card>
  )
};

CardJobListingsComponent.defaultProps = {
  className: null,
  error: null,
  fetchInProgress: false,
}

CardJobListingsComponent.propTypes = {
  className: string,
  listings: arrayOf(object).isRequired,
  error: propTypes.error,
  fetchInProgress: bool,

}

const CardJobListings = compose(
  injectIntl
)(CardJobListingsComponent);

export default CardJobListings;
