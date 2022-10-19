import React, {Component} from 'react';
import {array, bool, func, number, oneOf, object, shape, string} from 'prop-types';
import {injectIntl, intlShape} from '../../util/reactIntl';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withRouter} from 'react-router-dom';
import debounce from 'lodash/debounce';
import unionWith from 'lodash/unionWith';
import heroUrl from '../../assets/search/hero-img-search.png';
import mobileHeroUrl from '../../assets/search/hero-img-search-791px.png';
import config from '../../config';
import routeConfiguration from '../../routeConfiguration';
import {createResourceLocatorString, pathByRouteName} from '../../util/routes';
import {parse, stringify} from '../../util/urlHelpers';
import {propTypes} from '../../util/types';
import {getListingsById} from '../../ducks/marketplaceData.duck';
import {manageDisableScrolling, isScrollingDisabled} from '../../ducks/UI.duck';
import {
  Page,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LoginModal,
  LayoutWrapperFooter,
  Footer,
  LayoutSingleColumn,
  Hero,
} from '../../components';
import {TopbarContainer} from '../../containers';
import {
  loadData,
  searchMapListings,
  setActiveListing,
  queryUserReviews,
  sendInquiry,
  apply, getAssociatedProListing, getListingAvailabilityPlan
} from './SearchPage.duck';
import {
  pickSearchParamsOnly,
  validURLParamsForExtendedData,
  validFilterParams,
  createSearchResultSchema,
} from './SearchPage.helpers';
import MainPanel from './MainPanel';
import css from './SearchPage.css';

// Pagination page size might need to be dynamic on responsive page layouts
// Current design has max 3 columns 12 is divisible by 2 and 3
// So, there's enough cards to fill all columns on full pagination pages
const RESULT_PAGE_SIZE = 10;
const MODAL_BREAKPOINT = 768; // Search is in modal on mobile layout
const SEARCH_WITH_MAP_DEBOUNCE = 300; // Little bit of debounce before search is initiated.

export class SearchPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSearchMapOpenOnMobile: props.tab === 'map',
      isMobileModalOpen: false,
      showLocation: false,
      showTimes: false,
      showSearchResultsPanel: false,
    };

    this.searchMapListingsInProgress = false;

    this.filters = this.filters.bind(this);
    this.onMapMoveEnd = debounce(this.onMapMoveEnd.bind(this), SEARCH_WITH_MAP_DEBOUNCE);
    this.onOpenMobileModal = this.onOpenMobileModal.bind(this);
    this.onCloseMobileModal = this.onCloseMobileModal.bind(this);
  }

  filters() {
    const {
      serviceTypeFilterConfig,
      priceFilterConfig,
      keywordFilterConfig,
      preferencesFilterConfig,
      experienceFilterConfig,
      educationLevelsFilterConfig,
    } = this.props;


    return {
      serviceTypeFilter: {
        paramName: 'pub_serviceType',
        options: serviceTypeFilterConfig,
      },
      priceFilter: {
        paramName: 'price',
        config: priceFilterConfig,
      },
      experienceFilter: {
        paramName: 'experience',
        config: experienceFilterConfig,
      },
      keywordFilter: {
        paramName: 'keywords',
        config: keywordFilterConfig,
      },
      preferencesFilter: {
        paramName: 'pub_preferences',
        options: preferencesFilterConfig,
      },
      educationLevelsFilter: {
        paramName: 'pub_educationLevels',
        options: educationLevelsFilterConfig,
      },
      zipFilter: {
        paramName: 'pub_zip'
      }
    };
  }

  // Callback to determine if new search is needed
  // when map is moved by user or viewport has changed
  onMapMoveEnd(viewportBoundsChanged, data) {
    const {viewportBounds, viewportCenter} = data;

    const routes = routeConfiguration();
    const searchPagePath = pathByRouteName('SearchPage', routes);
    const currentPath =
      typeof window !== 'undefined' && window.location && window.location.pathname;

    // When using the ReusableMapContainer onMapMoveEnd can fire from other pages than SearchPage too
    const isSearchPage = currentPath === searchPagePath;

    // If mapSearch url param is given
    // or original location search is rendered once,
    // we start to react to "mapmoveend" events by generating new searches
    // (i.e. 'moveend' event in Mapbox and 'bounds_changed' in Google Maps)
    if (viewportBoundsChanged && isSearchPage) {
      const {history, location} = this.props;

      // parse query parameters, including a custom attribute named certificate
      const {address, bounds, mapSearch, ...rest} = parse(location.search, {
        latlng: ['origin'],
        latlngBounds: ['bounds'],
      });

      //const viewportMapCenter = SearchMap.getMapCenter(map);
      const originMaybe = config.sortSearchByDistance ? {origin: viewportCenter} : {};

      const searchParams = {
        address,
        ...originMaybe,
        bounds: viewportBounds,
        mapSearch: true,
        ...validFilterParams(rest, this.filters()),
      };

      history.push(createResourceLocatorString('SearchPage', routes, {}, searchParams));
    }
  }

  // Invoked when a modal is opened from a child component,
  // for example when a filter modal is opened in mobile view
  onOpenMobileModal() {
    this.setState({isMobileModalOpen: true});
  }

  // Invoked when a modal is closed from a child component,
  // for example when a filter modal is opened in mobile view
  onCloseMobileModal() {
    this.setState({isMobileModalOpen: false});
  }

  render() {
    const {
      className,
      intl,
      listings,
      location,
      mapListings,
      onManageDisableScrolling,
      pagination,
      scrollingDisabled,
      searchInProgress,
      searchListingsError,
      searchParams,
      activeListingId,
      onActivateListing,
      currentZip,
      isPro,
      getReviews,
      isAuthenticated,
      onSendInquiry,
      sendInquiryError,
      sendInquiryInProgress,
      onApply,
      getApplicableProListing,
      getAvailabilityPlan,
      currentUser,
      searchFor,
    } = this.props;
    // eslint-disable-next-line no-unused-vars
    const {mapSearch, page, ...searchInURL} = parse(location.search, {
      latlng: ['origin'],
      latlngBounds: ['bounds'],
    });

    const isAProSearch = searchFor ? searchFor === 'job' : isPro;

    const filters = this.filters();

    // urlQueryParams doesn't contain page specific url params
    // like mapSearch, page or origin (origin depends on config.sortSearchByDistance)
    const urlQueryParams = pickSearchParamsOnly(searchInURL, filters);

    // Page transition might initially use values from previous search
    const urlQueryString = stringify(urlQueryParams);
    const paramsQueryString = stringify(pickSearchParamsOnly(searchParams, filters));
    const searchParamsAreInSync = urlQueryString === paramsQueryString;

    const validQueryParams = validURLParamsForExtendedData(searchInURL, filters);

    const onMapIconClick = () => {
      this.useLocationSearchBounds = true;
      this.setState({isSearchMapOpenOnMobile: true});
    };
    const someHandler = (question, value) => {
      console.log(question + '' + value);
      this.setState({showLocation: true});
    }

    const handleZip = (zip) => {
      console.log(zip);
      this.setState({showLocation: false});
      this.setState({showTimes: true});
    }

    const handleTimeFrame = (question, time) => {
      console.log(time);
      this.setState({showLocation: false});
      this.setState({showTimes: false});
      this.setState({showSearchResultsPanel: true});
    }

    const {address, bounds, origin} = searchInURL || {};
    const {title, description, schema} = createSearchResultSchema(listings, address, intl);

    // Set topbar class based on if a modal is open in
    // a child component
    const topbarClasses = this.state.isMobileModalOpen ? css.topbarBehindModal : null;

    const heroTitle = isAProSearch ? "Find a Service Job" : "Find a Service Pro";

    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        description={description}
        title={title}
        schema={schema}
      >
        <LayoutSingleColumn>
          <LayoutWrapperTopbar className={topbarClasses}>
            <TopbarContainer
              className={topbarClasses}
              currentPage="SearchPage"
              desktopClassName={css.desktopTopbar}
              mobileClassName={css.mobileTopbar}
            />
            <Hero header={heroTitle} url={heroUrl} mobileUrl={mobileHeroUrl}/>
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.container}>
              <MainPanel
                urlQueryParams={validQueryParams}
                listings={listings}
                searchInProgress={searchInProgress}
                searchListingsError={searchListingsError}
                searchParamsAreInSync={searchParamsAreInSync}
                onActivateListing={onActivateListing}
                onManageDisableScrolling={onManageDisableScrolling}
                onOpenModal={this.onOpenMobileModal}
                onCloseModal={this.onCloseMobileModal}
                onMapIconClick={onMapIconClick}
                pagination={pagination}
                searchParamsForPagination={parse(location.search)}
                showAsModalMaxWidth={MODAL_BREAKPOINT}
                primaryFilters={{
                  serviceTypeFilter: filters.serviceTypeFilter,
                  priceFilter: filters.priceFilter,
                  experienceFilter: filters.experienceFilter,
                  keywordFilter: filters.keywordFilter,
                  preferencesFilter: filters.preferencesFilter,
                  educationLevelsFilter: filters.educationLevelsFilter,
                  zipFilter: filters.zipFilter,
                }}
                currentZip={currentZip}
                getReviews={getReviews}
                isAuthenticated={isAuthenticated}
                onSendInquiry={onSendInquiry}
                sendInquiryError={sendInquiryError}
                sendInquiryInProgress={sendInquiryInProgress}
                onApply={onApply}
                getApplicableProListing={getApplicableProListing}
                currentUser={currentUser}
              />
            </div>
            <LoginModal/>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer/>
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

SearchPageComponent.defaultProps = {
  listings: [],
  mapListings: [],
  pagination: null,
  searchListingsError: null,
  searchParams: {},
  tab: 'listings',
  serviceTypeFilterConfig: config.custom.serviceTypes,
  priceFilterConfig: config.custom.priceFilterConfig,
  experienceFilterConfig: config.custom.experienceFilterConfig,
  keywordFilterConfig: config.custom.keywordFilterConfig,
  preferencesFilterConfig: config.custom.preferences,
  educationLevelsFilterConfig: config.custom.educationLevels,
  activeListingId: null,
  currentZip: null,
  searchFor: null,
};

SearchPageComponent.propTypes = {
  listings: array,
  mapListings: array,
  onActivateListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onSearchMapListings: func.isRequired,
  pagination: propTypes.pagination,
  scrollingDisabled: bool.isRequired,
  searchInProgress: bool.isRequired,
  searchListingsError: propTypes.error,
  searchParams: object,
  tab: oneOf(['filters', 'listings', 'map']).isRequired,
  serviceTypeFilterConfig: array,
  preferencesFilterConfig: array,
  educationLevelsFilterConfig: array,
  priceFilterConfig: shape({
    min: number.isRequired,
    max: number.isRequired,
    step: number.isRequired,
  }),
  experienceFilterConfig: shape({
    min: number.isRequired,
    max: number.isRequired,
    step: number.isRequired,
  }),

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
  currentZip: number,
  isPro: bool.isRequired,
  searchFor: string,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    searchInProgress,
    searchListingsError,
    searchParams,
    searchMapListingIds,
    activeListingId,
    isPro,
    sendInquiryError,
    sendInquiryInProgress,
  } = state.SearchPage;
  const {isAuthenticated} = state.Auth;
  const {currentUser} = state.user;
  const pageListings = getListingsById(state, currentPageResultIds);
  const mapListings = getListingsById(
    state,
    unionWith(currentPageResultIds, searchMapListingIds, (id1, id2) => id1.uuid === id2.uuid)
  );

  const {attributes} = currentUser || {};
  const {profile} = attributes || {};
  const {protectedData} = profile || {};
  const {zip} = protectedData || {};

  return {
    listings: pageListings,
    mapListings,
    pagination,
    scrollingDisabled: isScrollingDisabled(state),
    searchInProgress,
    searchListingsError,
    searchParams,
    activeListingId,
    currentZip: zip,
    isPro,
    isAuthenticated,
    sendInquiryError,
    sendInquiryInProgress,
    currentUser,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onSearchMapListings: searchParams => dispatch(searchMapListings(searchParams)),
  onActivateListing: listingId => dispatch(setActiveListing(listingId)),
  getReviews: userId => dispatch(queryUserReviews(userId)),
  onSendInquiry: (listingId, message) => dispatch(sendInquiry(listingId, message)),
  onApply: (listingId, applicant) => dispatch(apply(listingId, applicant)),
  getApplicableProListing: (proId, serviceType) => dispatch(getAssociatedProListing(proId, serviceType)),
});

const SearchPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(SearchPageComponent);

SearchPage.loadData = (params, search) => {
  const queryParams = parse(search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const {page = 1, address, origin, ...rest} = queryParams;
  const {searchFor, ...restParams} = params;
  const originMaybe = config.sortSearchByDistance && origin ? {origin} : {};
  return loadData({
    ...rest,
    ...originMaybe,
    ...restParams,
    page,
    perPage: RESULT_PAGE_SIZE,
    include: ['author', 'images'],
    'fields.listing': ['title', 'geolocation', 'price', 'publicData'],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': ['variants.landscape-crop', 'variants.landscape-crop2x'],
    'limit.images': 1,
  }, searchFor);
};

export default SearchPage;
