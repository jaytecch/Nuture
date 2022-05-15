const {getIntegrationSdk, handleError, serialize } = require('../api-util/sdk');

module.exports = (req, res) => {
  const {listingId, applicant} = req.body || {};
  const sdk = getIntegrationSdk();

  console.log("listingId: " + JSON.stringify(listingId));

  sdk.listings
    .show({id: listingId})
    .then(response => {
      const listing = response.data.data;
      const {attributes} = listing || {};
      const {publicData} = attributes || {};
      const {applicants} = publicData || {};

      const newApplicantList = [...applicants, applicant];

      return sdk.listings.update({
        id: listingId,
        publicData: {...publicData, applicants: newApplicantList}
      });
    })
    .then(response => {
      const {status, statusText, data} = response;
      console.log("Update response: " + JSON.stringify(response));
      res
        .status(status)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status,
            statusText,
            data,
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
