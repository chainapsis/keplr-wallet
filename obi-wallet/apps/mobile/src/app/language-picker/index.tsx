import DropDownPicker from "react-native-dropdown-picker";

// eslint-disable-next-line @typescript-eslint/no-var-requires
DropDownPicker.addTheme("custom", require("./theme"));
DropDownPicker.setTheme("custom");

export { DropDownPicker };
