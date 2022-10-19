import React, {Component} from 'react';
import {array, bool, func, number, object, objectOf, string, shape} from 'prop-types';
import {FormattedMessage, injectIntl} from '../../util/reactIntl';
import classNames from 'classnames';
import merge from 'lodash/merge';
import {propTypes} from '../../util/types';
import {Form as FinalForm} from 'react-final-form';
import {
  SearchResultsPanel,
  SearchFilters,
  SearchFiltersMobile,
  SearchFiltersPanel, Form, FieldSelect,
  PrimaryButton, FieldTextInput, InlineTextButton, ModalInMobile, NamedLink
} from '../../components';
import {validFilterParams} from './SearchPage.helpers';

import css from './SearchPage.css';
import {withViewport} from "../../util/contextHelpers";
import {SERVICE_TYPES} from "../../nurtureUpLists";
import omit from "lodash/omit";
import {createResourceLocatorString} from "../../util/routes";
import routeConfiguration from "../../routeConfiguration";
import {withRouter} from "react-router-dom";
import {compose} from "redux";
import * as validators from '../../util/validators';
import zipcodes from "zipcodes";
import {LatLng} from "sharetribe-flex-integration-sdk/src/types";

const SORT_RATING_VALUE = "meta_rating";
const SORT_PRICE_VALUE = "-price";

class MainPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ratingSort: props.urlQueryParams.sort === SORT_RATING_VALUE,
      rateSort: props.urlQueryParams.sort === SORT_PRICE_VALUE,
      distanceSort: !!props.urlQueryParams.origin,
      isSearchFiltersPanelOpen: false,
      searchValues: {},
      isButtonModalOpen: false,
    };
  }

  render() {
    const {
      className,
      rootClassName,
      urlQueryParams,
      listings,
      searchInProgress,
      searchListingsError,
      searchParamsAreInSync,
      onActivateListing,
      onManageDisableScrolling,
      onOpenModal,
      onCloseModal,
      onMapIconClick,
      pagination,
      searchParamsForPagination,
      showAsModalMaxWidth,
      primaryFilters,
      secondaryFilters,
      viewport,
      history,
      currentZip,
      intl,
      getReviews,
      isAuthenticated,
      onSendInquiry,
      sendInquiryError,
      sendInquiryInProgress,
      onApply,
      getApplicableProListing,
      getAvailabilityPlan,
      currentUser
    } = this.props;

    const isMobile = viewport.width <= showAsModalMaxWidth;
    const isSearchFiltersPanelOpen = !!secondaryFilters && this.state.isSearchFiltersPanelOpen;

    const filters = merge(primaryFilters, secondaryFilters);
    const selectedFilters = validFilterParams(urlQueryParams, filters);
    const selectedFiltersCount = Object.keys(selectedFilters).length;

    const selectedSecondaryFilters = secondaryFilters
      ? validFilterParams(urlQueryParams, secondaryFilters)
      : {};
    const searchFiltersPanelSelectedCount = Object.keys(selectedSecondaryFilters).length;

    const searchFiltersPanelProps = !!secondaryFilters
      ? {
        isSearchFiltersPanelOpen: this.state.isSearchFiltersPanelOpen,
        toggleSearchFiltersPanel: isOpen => {
          this.setState({isSearchFiltersPanelOpen: isOpen});
        },
        searchFiltersPanelSelectedCount,
      }
      : {};

    const hasPaginationInfo = !!pagination && pagination.totalItems != null;
    const totalItems = searchParamsAreInSync && hasPaginationInfo ? pagination.totalItems : 0;
    const listingsAreLoaded = !searchInProgress && searchParamsAreInSync && hasPaginationInfo;

    const classes = classNames(rootClassName || css.searchResultContainer, className);

    const filterParamNames = Object.values(filters).map(f => f.paramName);
    const secondaryFilterParamNames = secondaryFilters
      ? Object.values(secondaryFilters).map(f => f.paramName)
      : [];

    const onHandleSubmit = values => {
      // const queryParams =
      //   options && options.length > 0
      //     ? { ...urlQueryParams, [urlParam]: options.join(',') }
      //     : omit(urlQueryParams, urlParam);


      const params = {};
      params[primaryFilters.serviceTypeFilter.paramName] = values.serviceType;
      params[primaryFilters.zipFilter.paramName] = values.zip;

      console.log("search values: " + JSON.stringify(params));
      history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, params));
    }

    const searchParamsForm = (
      <FinalForm
        onSubmit={onHandleSubmit}
        render={formRenderProps => {
          const {
            handleSubmit,
          } = formRenderProps;

          const {
            serviceType
          } = this.state.searchValues;

          const isReady = serviceType && true;

          const onSelectFieldChange = (value, fieldName, props) => {
            const {form} = props;
            form.change(fieldName, value);
          }

          const zipIsNumber = validators.addressZipFormatNotRequired("Please enter a valid zip");

          return (
            <Form className={css.searchParamsForm} onSubmit={values => handleSubmit(values)}>
              <div className={css.searchFields}>
                <FieldSelect
                  className={css.searchFieldItem}
                  selectClassName={css.serviceSelect}
                  name="serviceType"
                  id="serviceType"
                  onChange={value => onSelectFieldChange(value, 'serviceType', formRenderProps)}
                >
                  <option value="">
                    Select Service
                  </option>
                  {SERVICE_TYPES.map(p => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </FieldSelect>

                <FieldTextInput
                  className={css.zipInput}
                  inputRootClass={css.zipInputRoot}
                  successClass={css.zipSuccessClass}
                  name="zip"
                  id="zip"
                  type="text"
                  maxlength="5"
                  placeholder="Zip Code"
                  validate={zipIsNumber}
                />
              </div>


              <div className={css.buttonGroup}>
                <PrimaryButton
                  type="submit"
                  ready={isReady}
                  className={css.searchButton}
                >
                  <span className={css.searchBtnText}>Search</span>
                </PrimaryButton>

                <NamedLink name="SearchPage" className={css.clearButtonRoot}>
                  Clear
                </NamedLink>
              </div>
            </Form>
          );
        }}
      />
    );

    const handleSort = value => {
      const selected = !this.state[value];
      let sortValue;
      let sortKey = "sort";

      if (value === "ratingSort") {
        omit(urlQueryParams, "origin");
        sortValue = selected ? SORT_RATING_VALUE : null;
        this.setState({
          ratingSort: selected,
          distanceSort: false,
          rateSort: false,
        });
      } else if (value === "distanceSort") {
        omit(urlQueryParams, "sort");
        const {latitude, longitude} = currentZip ? zipcodes.lookup(currentZip) : {};
        sortValue = currentZip ? new LatLng(latitude, longitude) : null;
        sortKey = "origin";
        this.setState({
          ratingSort: false,
          distanceSort: selected,
          rateSort: false,
        })
      } else {
        omit(urlQueryParams, "origin");
        sortValue = selected ? SORT_PRICE_VALUE : null;
        this.setState({
          ratingSort: false,
          distanceSort: false,
          rateSort: selected,
        })
      }

      const queryParams = sortValue
        ? {...urlQueryParams, [sortKey]: sortValue}
        : omit(urlQueryParams, sortKey);

      history.push(createResourceLocatorString(
        'SearchPage',
        routeConfiguration(),
        {},
        queryParams
      ));
    }

    const sortButtons = (
      <div className={css.sortButtonsCard}>
        <h3 className={css.sortTitle}>Sort</h3>

        <div className={css.sortButtons}>
          <InlineTextButton
            className={this.state.ratingSort ? css.sortSelected : css.sortButton}
            onClick={() => handleSort("ratingSort")}
          >
            Rating
          </InlineTextButton>

          <InlineTextButton
            className={this.state.distanceSort ? css.sortSelected : css.sortButton}
            onClick={() => handleSort("distanceSort")}
          >
            Distance
          </InlineTextButton>

          <InlineTextButton
            className={this.state.rateSort ? css.sortSelected : css.sortButton}
            onClick={() => handleSort("rateSort")}
          >
            Hourly Rate
          </InlineTextButton>
        </div>

      </div>
    );

    const searchResultsPanel = (
      <SearchResultsPanel
        className={css.searchListingsPanel}
        listings={listings}
        pagination={listingsAreLoaded ? pagination : null}
        search={searchParamsForPagination}
        setActiveListing={onActivateListing}
        getReviews={getReviews}
        isAuthenticated={isAuthenticated}
        onSendInquiry={onSendInquiry}
        sendInquiryError={sendInquiryError}
        sendInquiryInProgress={sendInquiryInProgress}
        isMobile={isMobile}
        showAsModalMaxWidth={showAsModalMaxWidth}
        onManageDisableScrolling={onManageDisableScrolling}
        onApply={onApply}
        getApplicableProListing={getApplicableProListing}
        currentUser={currentUser}
      />
    )

    const desktopLayout = (
      <div className={classes}>
        <div className={css.topSection}>
          {searchParamsForm}
        </div>

        <div className={css.bottomSection}>
          <div className={css.filtersSideNav}>
            {sortButtons}
            <SearchFilters
              className={css.searchFilters}
              urlQueryParams={urlQueryParams}
              listingsAreLoaded={listingsAreLoaded}
              resultsCount={totalItems}
              searchInProgress={searchInProgress}
              searchListingsError={searchListingsError}
              onManageDisableScrolling={onManageDisableScrolling}
              {...searchFiltersPanelProps}
              {...primaryFilters}
            />

          </div>


          <div
            className={classNames(css.listings, {
              [css.newSearchInProgress]: !listingsAreLoaded,
            })}
          >
            {searchListingsError ? (
              <h2 className={css.error}>
                <FormattedMessage id="SearchPage.searchError"/>
              </h2>
            ) : null}

            {searchResultsPanel}

          </div>
        </div>
      </div>
    );

    const filtersButtonClasses =
      this.state.ratingSort || this.state.distanceSort || this.state.rateSort ?
        css.mobileSortButtonSelected
        : css.mobileSortButton;

    const mobileLayout = (
      <div className={classes}>
        <div className={css.topSection}>
          {searchParamsForm}

          <div className={css.mobileButtonsGroup}>
            <SearchFiltersMobile
              className={css.searchFiltersMobile}
              urlQueryParams={urlQueryParams}
              listingsAreLoaded={listingsAreLoaded}
              resultsCount={totalItems}
              searchInProgress={searchInProgress}
              searchListingsError={searchListingsError}
              showAsModalMaxWidth={showAsModalMaxWidth}
              onMapIconClick={onMapIconClick}
              onManageDisableScrolling={onManageDisableScrolling}
              onOpenModal={onOpenModal}
              onCloseModal={onCloseModal}
              filterParamNames={filterParamNames}
              selectedFiltersCount={selectedFiltersCount}
              {...primaryFilters}
              {...secondaryFilters}
            />

            <InlineTextButton
              className={filtersButtonClasses}
              onClick={() => this.setState({isButtonModalOpen: true})}
            >
              <div className={css.buttonText}>
                <FormattedMessage id="SearchPage.sortButtonLabel"/>
              </div>
            </InlineTextButton>
          </div>
        </div>

        <div className={css.bottomSection}>
          <div
            className={classNames(css.listings, {
              [css.newSearchInProgress]: !listingsAreLoaded,
            })}
          >
            {searchListingsError ? (
              <h2 className={css.error}>
                <FormattedMessage id="SearchPage.searchError"/>
              </h2>
            ) : null}

            {searchResultsPanel}
          </div>
        </div>

        <ModalInMobile
          id="mobileSortButtons"
          isModalOpenOnMobile={this.state.isButtonModalOpen}
          onClose={() => this.setState({isButtonModalOpen: false})}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onManageDisableScrolling={onManageDisableScrolling}
          containerClassName={css.modalContainer}
          closeButtonMessage={intl.formatMessage({id: "SearchPage.sortModalClose"})}
        >
          {sortButtons}
        </ModalInMobile>
      </div>
    )

    return (
      <div className={css.mainWrapper}>
        {isMobile ? mobileLayout : desktopLayout}
      </div>
    );
  }
}

MainPanelComponent.defaultProps = {
  className: null,
  rootClassName: null,
  listings: [],
  resultsCount: 0,
  pagination: null,
  searchParamsForPagination: {},
  primaryFilters: null,
  secondaryFilters: null,
  currentZip: null,
  isAuthenticated: false,
};

MainPanelComponent.propTypes = {
  className: string,
  rootClassName: string,

  urlQueryParams: object.isRequired,
  listings: array,
  searchInProgress: bool.isRequired,
  searchListingsError: propTypes.error,
  searchParamsAreInSync: bool.isRequired,
  onActivateListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onOpenModal: func.isRequired,
  onCloseModal: func.isRequired,
  onMapIconClick: func.isRequired,
  pagination: propTypes.pagination,
  searchParamsForPagination: object,
  showAsModalMaxWidth: number.isRequired,
  primaryFilters: objectOf(propTypes.filterConfig),
  secondaryFilters: objectOf(propTypes.filterConfig),
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,
  currentZip: number,
  getReviews: func.isRequired,
  isAuthenticated: bool,
  onSendInquiry: func.isRequired,
  sendInquiryError: propTypes.error.isRequired,
  sendInquiryInProgress: bool.isRequired,
};

const MainPanel = compose(
  withViewport,
  withRouter,
  injectIntl
)(MainPanelComponent)

export default MainPanel;
