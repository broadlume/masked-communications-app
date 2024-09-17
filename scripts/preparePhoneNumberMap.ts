import * as fsp from "node:fs/promises";
import path from "node:path";
import areaCodeGeos from "./areaCodeGeos";
import { parseArgs } from "node:util";
import { Twilio } from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
	throw new Error(
		"Must have TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in env vars",
	);
}
const numberPool = parseArgs({
	args: Bun.argv,
	options: {
		numberPool: {
			type: "string",
		},
	},
	strict: true,
	allowPositionals: true
}).values.numberPool;
if (numberPool == null) {
	throw new Error("Must pass in --numberPool flag as 'development' or 'production'.");
}
const SERVICE_IDS = {
	development: "MG4b8b54ec0a6b494ce7713ae21a596b91",
	production: "MG45c14b248d579bdfcc79684429a3ee1f",
} as const;

/****************************************************
 Formats a text list of phone numbers (in src/data/phone-numbers.txt) into the PhoneNumberMap
 structure.
****************************************************/
async function preparePhoneNumberMap() {
	const twilioClient = new Twilio(
		process.env.TWILIO_ACCOUNT_SID,
		process.env.TWILIO_AUTH_TOKEN,
	);
	const caAreaCodes = areaCodeGeos.ca.map(({ areaCode }) => areaCode);
	const usAreaCodes = areaCodeGeos.us.map(({ areaCode }) => areaCode);
	const phoneNumberList: string[] = (
		await twilioClient.messaging.v1
			.services(SERVICE_IDS[numberPool])
			.phoneNumbers.list()
	).map((number) => number.phoneNumber);
	console.info(
		`[${numberPool} - ${SERVICE_IDS[numberPool]}]: Preparing ${phoneNumberList.length} phone numbers for the proxy pool...`,
	);
	const phoneNumberPoolMap = {
		ca: {},
		us: {},
	};

	for (const phoneNumber of phoneNumberList) {
		const { countryCode, areaCode } = phoneNumber.match(
			/^\s*(?:\+?(?<countryCode>\d{1,3}))?[-. (]*(?<areaCode>\d{3})[-. )]*(?<prefix>\d{3})[-. ]*(?<line>\d{4})(?: *x(\d+))?\s*$/,
		).groups;

		if (!areaCode) throw Error(`${phoneNumber} is not valid E.164 format`);

		// Check if area code is Canadian
		if (caAreaCodes.includes(Number.parseInt(areaCode))) {
			// If the area code has an entry in our number pool output...
			if (phoneNumberPoolMap.ca[areaCode]) {
				// Push the number into the existing array
				phoneNumberPoolMap.ca[areaCode].push(phoneNumber);
				// Otherwise create a new entry and array
			} else phoneNumberPoolMap.ca[areaCode] = [phoneNumber];
		} else if (usAreaCodes.includes(Number.parseInt(areaCode))) {
			if (phoneNumberPoolMap.us[areaCode]) {
				phoneNumberPoolMap.us[areaCode].push(phoneNumber);
			} else phoneNumberPoolMap.us[areaCode] = [phoneNumber];
		} else {
			if (phoneNumberPoolMap[countryCode]) {
				phoneNumberPoolMap[countryCode].push(phoneNumber);
			} else phoneNumberPoolMap[countryCode] = [phoneNumber];
		}
	}

	await fsp.writeFile(
		path.resolve(__dirname, "../src/data/phoneNumberMap.json"),
		JSON.stringify(phoneNumberPoolMap),
	);
}

preparePhoneNumberMap();
