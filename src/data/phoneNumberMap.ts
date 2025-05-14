import { Twilio } from "twilio";
import areaCodeGeos from "../../scripts/areaCodeGeos";

export let phoneNumberMap: Record<string, Record<string, string[]>> | null = null;
/****************************************************
 Formats a list of phone numbers from the messaging service into the PhoneNumberMap
 structure.
****************************************************/
export async function getPhoneNumberMap(): Promise<Record<string, Record<string, string[]>>> {
	if (phoneNumberMap) return phoneNumberMap;
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_MESSAGING_SERVICE_SID) {
        throw new Error(
            "Must have TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_MESSAGING_SERVICE_SID in env vars",
        );
    }
	const twilioClient = new Twilio(
		process.env.TWILIO_ACCOUNT_SID,
		process.env.TWILIO_AUTH_TOKEN,
	);
	const caAreaCodes = areaCodeGeos.ca.map(({ areaCode }) => areaCode);
	const usAreaCodes = areaCodeGeos.us.map(({ areaCode }) => areaCode);
	const phoneNumberList: string[] = (
		await twilioClient.messaging.v1
			.services(process.env.TWILIO_MESSAGING_SERVICE_SID)
			.phoneNumbers.list()
	).map((number) => number.phoneNumber);
	console.info(
		`[${process.env.DEPLOYMENT_ENV} - ${process.env.TWILIO_MESSAGING_SERVICE_SID}]: Preparing ${phoneNumberList.length} phone numbers for the proxy pool...`,
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

	phoneNumberMap = phoneNumberPoolMap;
	return phoneNumberMap;
}
