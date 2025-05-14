// Copyright (c) 2022 Twilio Inc.

import {app} from './src/app/app'

import { getPhoneNumberMap } from "./src/data/phoneNumberMap"
const PORT = process.env.PORT || 3000

/****************************************************
 Start Server
 ****************************************************/


app.listen(PORT, async () => {
  const map = await getPhoneNumberMap();
  const phoneNumbers: string[] = Object.keys(map).flatMap(country => Object.keys(map[country]).flatMap(areacode => map[country][areacode]));
  console.log(`Twilio proxy is running on port:${PORT} with ${phoneNumbers.length} numbers in the pool.`);
})
