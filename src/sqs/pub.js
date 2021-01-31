'use strict';

const AWS = require('aws-sdk');

function publishMessage(sqsConfig, msg, cb) {
  AWS.config.update(sqsConfig.region)
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

  let params = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: sqsConfig.queueUrl
  }

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      cb(err, {
        queueUrl: params.QueueUrl,
        msgId: null
      })
    } else {
      cb(null, {
        queueUrl: params.QueueUrl,
        msgId: data.MessageId
      })
    }
  })
}

module.exports = {
  publishMessage: publishMessage
}