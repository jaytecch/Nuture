const {handleError, serialize} = require('../api-util/sdk');
const aws = require('aws-sdk');

const NU_EMAIL = process.env.REACT_APP_CONTACT_US_EMAIL;
const AWS_REGION = process.env.REACT_APP_AWS_REGION;
const AWS_PROFILE = process.env.REACT_APP_AWS_PROFILE;

module.exports = (req, res) => {
  console.log(JSON.stringify(req.body));
  const credentials = new aws.SharedIniFileCredentials({profile: AWS_PROFILE});
  aws.config.update({region: AWS_REGION});
  aws.config.credentials = credentials;

  const {emailType, name, email, subject, message} = req.body;

  const msgBody = "[Sent From] " + name + " (" + email + ")\n\n"
    + "[Message]\n" + message;

  const params = {
    Destination: {
      ToAddresses: [NU_EMAIL]
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: '[' + emailType + '] ' + subject
      },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: msgBody,
        }
      }
    },
    Source: NU_EMAIL,
    ReplyToAddresses: [email]
  };

  const sendPromise = new aws.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  sendPromise
    .then(response => {
      res
        .status('200')
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status: '200',
            statusText: 'email send success',
            data: response
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    })
}
