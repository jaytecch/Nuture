import React, {useState} from "react";
import {Document, Page} from "react-pdf";
import css from './single-page.css';

export default function SinglePage(props) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt page

    function onDocumentLoadSuccess({numPages}) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function changePage(offset) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    const {pdf, name, width} = props;
    //console.log('in singlepage, width = ' + width);
    let finalWidth;

    if(width > 650){
       finalWidth = 650;
       //console.log('The final width is greater than 650, so setting it to its default');
    }
    return (
        <>

            <div className={css.downloadDiv}><a className={css.linkToButton} href={pdf} download={name}>Download PDF</a>
            </div>

            <Document
                file={pdf}
                options={{workerSrc: "/pdf.worker.js"}}
                onLoadSuccess={onDocumentLoadSuccess}
            >
                <Page pageNumber={pageNumber} width={finalWidth}/>
            </Document>
            <div className={css.buttonsAndPaging}>

                <div className={css.buttonPrev}>
                    <button className={css.navButtonLeft} type="button" disabled={pageNumber <= 1}
                            onClick={previousPage}/>
                </div>
                <div className={css.paging}>
                    <p>
                        {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
                    </p>
                </div>
                <div className={css.buttonNext}>
                    <button
                        type="button"
                        disabled={pageNumber >= numPages}
                        onClick={nextPage}
                        className={css.navButtonRight}
                    />
                </div>
            </div>
            <div className={css.downloadDiv}><a className={css.linkToButton} href={pdf} download={name}>Download PDF</a>
            </div>
        </>
    );
}
