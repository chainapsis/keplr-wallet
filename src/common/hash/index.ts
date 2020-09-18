export function truncHashPortion(str, firstCharCount = str.length, endCharCount = 0) {
	return str.substring(0, firstCharCount) + "…" + str.substring(str.length-endCharCount, str.length);
}
  