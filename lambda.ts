// Copyright (c) 2022 Twilio Inc.

import {app} from './src/app/app'
import serverlessExpress from "@codegenie/serverless-express"

/****************************************************
 Start Server
 ****************************************************/

export const handler = serverlessExpress({
  app,
  respondWithErrors: true,
});