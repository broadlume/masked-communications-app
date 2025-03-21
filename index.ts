// Copyright (c) 2022 Twilio Inc.

import {app} from './src/app/app'

import phoneNumberMap from "./src/data/phoneNumberMap.json"
const PORT = process.env.PORT || 3000

/****************************************************
 Start Server
 ****************************************************/

app.listen(PORT, () => {
  const phoneNumbers: string[] = Object.keys(phoneNumberMap).flatMap(country => Object.keys(phoneNumberMap[country]).flatMap(areacode => phoneNumberMap[country][areacode]));
  console.log(`Twilio proxy is running on port:${PORT} with ${phoneNumbers.length} numbers in the pool.`);
})
