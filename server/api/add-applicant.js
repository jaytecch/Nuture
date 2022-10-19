const {getIntegrationSdk, handleError, serialize } = require('../api-util/sdk');

module.exports = (req, res) => {
  const {listingId, applicant} = req.body || {};
  const proListingId = applicant.listingId;
  const sdk = getIntegrationSdk();

  console.log("listingId: " + JSON.stringify(listingId));

  sdk.listings
    .show({id: listingId})
    .then(response => {
      const listing = response.data.data;
      const {attributes} = listing || {};
      const {publicData, availabilityPlan} = attributes || {};
      const {applicants} = publicData || {};

      console.log("Plan: " + JSON.stringify(availabilityPlan))

      doesNotExist = applicants.every(pro => {
        if(pro.id = applicant.id) {
          return false;
        }

        return true;
      })

      if(doesNotExist) {
        const newApplicantList = [...applicants, applicant];

        return sdk.listings.update({
          id: listingId,
          publicData: {...publicData, applicants: newApplicantList}
        });
      } else {
        throw {message: "exists"}
      }
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
      console.log(e)
      handleError(res, e);
    });
};
