const axios = require('axios');
const Stripe = require('stripe');
const {handleError, serialize} = require('../api-util/sdk');


const STRIPE_SECRET_KEY = process.env.REACT_APP_STRIPE_SECRET_KEY;
const STRIPE_SUBSCRIPTION_ID = process.env.REACT_APP_STRIPE_SUBSCRIPTION_ID;
const STRIPE_URL = process.env.REACT_APP_STRIPE_URL;

module.exports = (req, res) => {
  const customer = req.body.customer;
  const stripe = Stripe(STRIPE_SECRET_KEY);

  // const data = new URLSearchParams({
  //   customer: customer,
  //   "items[0][price]": STRIPE_SUBSCRIPTION_ID
  // });

  stripe.subscriptions.create({
    customer: customer,
    items: [{price: STRIPE_SUBSCRIPTION_ID}]
  })
    .then(response => {
      console.log("CHARGED: " + JSON.stringify(response));
      res
        .status("200")
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status: "200",
            statusText: "success",
            data: response,
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    })

  // // const base64Key = Buffer.from(STRIPE_SECRET_KEY, 'utf-8').toString('base64');
  // const url = STRIPE_URL + "/subscriptions";
  // const config = {
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     "Authorization": "Bearer " + STRIPE_SECRET_KEY,
  //   }
  // };
  //
  // axios.post(url, data, config)
  //   .then(response => {
  //     const {status, statusText, data} = response;
  //     res
  //       .status(status)
  //       .set('Content-Type', 'application/transit+json')
  //       .send(
  //         serialize({
  //           status,
  //           statusText,
  //           data,
  //         })
  //       )
  //       .end();
  //   })
  //   .catch(e => {
  //     handleError(res, e);
  //   })
}
