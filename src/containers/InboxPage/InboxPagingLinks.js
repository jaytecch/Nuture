import React, {useState} from "react";
import range from 'lodash/range';
import classNames from 'classnames';
import css from './InboxPage.css';
import {IconArrowHead, NamedLink} from "../../components";
import {stringify} from "../../util/urlHelpers";

const RADIUS_SIZE = 3;

let pgKey = 0;
const paginationGapKey = () => {
  pgKey += 1;
  return pgKey;
};

const getPageNumbersArray = (page, totalPages) => {
  // Create array of numbers: [1, 2, 3, 4, ..., totalPages]
  const numbersFrom1ToTotalPages = range(1, totalPages + 1);
  return numbersFrom1ToTotalPages
    .filter(v => {
      // Filter numbers that are next to current page and pick also first and last page
      // E.g. [1, 4, 5, 6, 9], where current page = 5 and totalPages = 9.
      return v === 1 || Math.abs(v - page) <= 1 || v === totalPages;
    })
    .reduce((newArray, p) => {
      // Create a new array where gaps between consecutive numbers is filled with ellipsis character
      // E.g. [1, '…', 4, 5, 6, '…', 9], where current page = 5 and totalPages = 9.
      const isFirstPageOrNextToCurrentPage = p === 1 || newArray[newArray.length - 1] + 1 === p;
      return isFirstPageOrNextToCurrentPage ? newArray.concat([p]) : newArray.concat(['\u2026', p]);
    }, []);
};

const InboxPagingLinks = props => {
  const {
    numberOfPages,
    currentPage,
    changePage,
  } = props;


  let pageList = getPageNumbersArray(currentPage, numberOfPages).map(v => {
    const isCurrentPage = v === currentPage;
    const pageClassNames = classNames(css.toPageLink, { [css.currentPage]: isCurrentPage });
    return typeof v === 'number' ? (
      <div className={pageClassNames} onClick={() => changePage(v)}>
        {v}
      </div>
    ) : (
      <span key={`pagination_gap_${paginationGapKey()}`} className={css.paginationGap}>
        {v}
      </span>
    );
  });

  const prev = currentPage > 1 ? (
    <div className={css.prev} onClick={() => changePage(currentPage - 1 )}>
      <IconArrowHead direction="left" size="big" rootClassName={css.arrowIcon} />
    </div>
  ) : null;

  const next = currentPage < numberOfPages ? (
    <div className={css.next} onClick={() => changePage(currentPage + 1)}>
      <IconArrowHead direction="right" size="big" rootClassName={css.arrowIcon} />
    </div>
  ) : null;

  const pageNumberListClassNames = classNames(
    css.numberList,
    css[`pageNumberList${pageList.length}Items`]
  );

  return (
    <nav className={css.pagingLinks}>
      {prev}
      <div className={pageNumberListClassNames}>
        {pageList}
      </div>
      {next}
    </nav>
  );
}

export default InboxPagingLinks;
