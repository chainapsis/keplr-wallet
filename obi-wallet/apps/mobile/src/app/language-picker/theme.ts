import { StyleSheet } from "react-native";
// @ts-expect-error
import Colors from "react-native-dropdown-picker/src/constants/colors";

// @ts-expect-error
export { ICONS } from "react-native-dropdown-picker/src/themes/dark";

// eslint-disable-next-line import/no-default-export
export default StyleSheet.create({
  container: {
    width: 140,
    flex: 1,
  },
  style: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#2F2B4C",
  },
  label: {
    flex: 1,
    color: "#F6F5FF",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
  },
  labelContainer: {
    flex: 1,
    flexDirection: "row",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  tickIcon: {
    width: 20,
    height: 20,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
  badgeStyle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.ALTO,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDotStyle: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    marginRight: 8,
    backgroundColor: Colors.GREY,
  },
  badgeSeparator: {
    width: 5,
  },
  listBody: {
    height: "100%",
  },
  listBodyContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  dropDownContainer: {
    position: "absolute",
    borderRadius: 12,
    borderColor: "transparent",
    borderWidth: 1,
    width: "100%",
    overflow: "hidden",
    zIndex: 1000,
    paddingRight: 20,
    //backgroundColor: "#090817",
  },
  modalContentContainer: {
    flexGrow: 1,
    backgroundColor: Colors.EBONY_CLAY,
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    //justifyContent: "space-between",
    //paddingHorizontal: 20,
    height: 40,
    textAlign: "left",
  },
  listItemLabel: {
    flex: 1,
    color: "#F6F5FF",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
  },
  iconContainer: {
    marginRight: 10,
  },
  arrowIconContainer: {
    marginLeft: 10,
  },
  tickIconContainer: {
    marginLeft: 10,
  },
  closeIconContainer: {
    marginLeft: 10,
  },
  listParentLabel: {},
  listChildLabel: {},
  listParentContainer: {},
  listChildContainer: {
    paddingLeft: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomColor: Colors.SHUTTLE_GREY,
    borderBottomWidth: 1,
  },
  searchTextInput: {
    flexGrow: 1,
    flexShrink: 1,
    margin: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    //borderColor: Colors.SHUTTLE_GREY,
    borderWidth: 1,
    color: Colors.WHITE,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.SHUTTLE_GREY,
  },
  flatListContentContainer: {
    flexGrow: 1,
  },
  customItemContainer: {},
  customItemLabel: {
    fontStyle: "italic",
  },
  listMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  listMessageText: {
    color: Colors.HEATHER,
  },
  selectedItemContainer: {
    display: "none",
  },
  selectedItemLabel: { display: "none" },
  modalTitle: {
    fontSize: 18,
    color: Colors.HEATHER,
  },
  extendableBadgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  extendableBadgeItemContainer: {
    marginVertical: 3,
    marginEnd: 7,
  },
});
