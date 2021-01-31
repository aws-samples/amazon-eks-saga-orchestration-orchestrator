const logger = require("./logger")

function getAppConfig() {
  let appConfig = {
    orchestration: {},
    sqs: {}
  }
  if (process.env.TZ) {
    logger.info(`Timezone will be set to ${process.env.TZ}`)
  } else {
    logger.warn(`Timezone will default to Aisa/Kolkata`)
  }
  if (process.env.REGION) {
    appConfig.sqs.region = process.env.REGION
  } else {
    logger.error(`Environment variable for region was not found.`)
    return {}
  }
  if (process.env.INPT_QUEUE_URL) {
    appConfig.sqs.queueUrl = process.env.INPT_QUEUE_URL
  } else {
    logger.error(`Environment variable for input queue URL was not found.`)
    return {}
  }
  if (process.env.ORCHESTRATION) {
    try {
      appConfig.orchestration = JSON.parse(process.env.ORCHESTRATION)
    } catch (error) {
      logger.error(`Invalid Orchestration JSON received. ${error.message}`)
      return {}
    }
  } else {
    logger.error(`Environment variable for orchestration was not found.`)
    return {}
  }

  return appConfig
}

module.exports = {
  getAppConfig: getAppConfig
}