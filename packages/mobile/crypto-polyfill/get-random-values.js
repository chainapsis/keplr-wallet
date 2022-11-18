import "react-native-get-random-values";
const getRandomValues = crypto.getRandomValues;
crypto = undefined;
// eslint-disable-next-line import/no-default-export
export default getRandomValues;
