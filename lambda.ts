// Copyright (c) 2022 Twilio Inc.

import {app} from './src/app/app'
import serverlessExpress from "@codegenie/serverless-express"
import { getPhoneNumberMap } from './src/data/phoneNumberMap';

/****************************************************
 Start Server
 ****************************************************/
getPhoneNumberMap();
export const handler = serverlessExpress({
  app,
  respondWithErrors: true,
}); 