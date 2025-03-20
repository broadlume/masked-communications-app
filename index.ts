// Copyright (c) 2022 Twilio Inc.

import {app} from './src/app/app'
import serverlessExpress from "@codegenie/serverless-express"

/****************************************************
 Start Server
 ****************************************************/

// app.listen(PORT, () => {
//   const phoneNumbers: string[] = Object.keys(phoneNumberMap).flatMap(country => Object.keys(phoneNumberMap[country]).flatMap(areacode => phoneNumberMap[country][areacode]));
//   console.log(`Twilio proxy is running on port:${PORT} with ${phoneNumbers.length} numbers in the pool.`);
// })

export const handler = serverlessExpress({
  app,
  respondWithErrors: true,
});