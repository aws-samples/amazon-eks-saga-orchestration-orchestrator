const mom = require('moment-timezone')

const pub = require('../sqs/pub')
const logger = require('../utils/logger')

const TZ = process.env.TZ || 'Asia/Kolkata'

function publishMessage(sqsConfig, payload, cb) {
  let orderId = payload.msg.orderId
  let requestId = payload.msg.requestId
  let messageId = payload.msg.messageId

  pub.publishMessage({
    region: sqsConfig.region,
    queueUrl: sqsConfig.queueUrl
  }, {
    ts: mom().tz(TZ).format('YYYY-MM-DDTHH:mm:ss.SSS'),
    msg: payload
  }, (err, res) => {
    if (err) {
      logger.error(`Request ID: ${requestId} - MessageId: ${messageId} - OrderId: ${orderId} - Message could not be published on ${sqsConfig.queueUrl} - ${err.code} ${err.message}`)
      cb({ type: 'sqs', msg: `Message could not be published on ${sqsConfig.queueUrl} - ${err.code} ${err.message}` })
    } else {
      logger.info(`Request ID: ${requestId} - MessageId: ${messageId} - OrderId: ${orderId} - Message published on ${sqsConfig.queueUrl} - MessageId: ${res.msgId}`)
      cb(null)
    }
  })
}

function orchestration(req, cb) {
  let orcheMsg = req.payload
  let body = orcheMsg.msg
  let sqsConfig = req.sqsConfig
  let orcheConfig = req.orcheConfig

  let orderId = body.orderId
  let msgId = orcheMsg.messageId
  let requestId = body.requestId

  if (orcheConfig[orcheMsg.us]) {
    if (orcheConfig[orcheMsg.us][orcheMsg.msgType]) {
      publishMessage({
        region: sqsConfig.region,
        queueUrl: orcheConfig[orcheMsg.us][orcheMsg.msgType]
      }, orcheMsg,
        (sqsErr) => {
          if (sqsErr) {
            cb(sqsErr)
          } else {
            cb(null)
          }
        })
    } else {
      logger.error(`Request ID: ${requestId} - MessageId: ${msgId} - OrderId: ${orderId} - No routes for ${orcheMsg.msgType} path of ${orcheMsg.us} microservice.`)
      publishMessage({
        region: sqsConfig.region,
        queueUrl: orcheConfig[orcheMsg.us][orcheMsg.msgType]
      }, orcheMsg,
        (sqsErr) => {
          if (sqsErr) {
            cb(sqsErr)
          } else {
            cb({ type: 'orche' })
          }
        })
    }
  } else {
    logger.error(`Request ID: ${requestId} - MessageId: ${msgId} - OrderId: ${orderId} - No routes for ${orcheMsg.us} microservice.`)
    publishMessage({
      region: sqsConfig.region,
      queueUrl: orcheConfig[orcheMsg.us][orcheMsg.msgType]
    }, orcheMsg,
      (sqsErr) => {
        if (sqsErr) {
          cb(sqsErr)
        } else {
          cb({ type: 'orche' })
        }
      })
  }
}

module.exports = {
  orchestration: orchestration
}