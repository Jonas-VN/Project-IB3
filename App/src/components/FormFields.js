import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { IconButton } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { COLORS } from "../constants";

function FormButton({ text, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={false}
      style={styles.formButton}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function InputField({
  field,
  setField,
  placeholder,
  icon,
  keyboardType,
  editable = true,
  onChange = undefined,
}) {
  return (
    <View>
      <IconButton icon={icon} color={COLORS.BLACK} style={styles.frontIcon} />
      <TextInput
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={COLORS.BLACK}
        style={styles.textInput}
        onChangeText={
          onChange ? (text) => onChange(text) : (text) => setField(text)
        }
        value={field}
        editable={editable}
      />
    </View>
  );
}

function TimeField({ field, isDate = true }) {
  const [isPickerVisible, setPickerVisibility] = useState(false);

  const showPicker = () => {
    setPickerVisibility(true);
  };

  const hidePicker = () => {
    setPickerVisibility(false);
  };

  const handleConfirm = (date) => {
    if (isDate) {
      field.setFullYear(date.getFullYear());
      field.setMonth(date.getMonth());
      field.setDate(date.getDate());
    } else {
      field.setUTCHours(date.getUTCHours());
      if (date.getUTCMinutes() >= 15 && date.getUTCMinutes() < 45) {
        field.setUTCMinutes(30);
      } else if (date.getUTCMinutes() < 15) {
        field.setUTCMinutes(0);
      } else {
        field.setUTCMinutes(0);
        field.setUTCHours(date.getUTCHours() + 1);
      }
      field.setSeconds(0);
      field.setUTCMilliseconds(0);
    }
    hidePicker();
  };

  return (
    <View>
      <TouchableWithoutFeedback onPress={showPicker}>
        <View>
          <IconButton
            icon={isDate ? "calendar" : "clock"}
            color={COLORS.BLACK}
            style={styles.frontIcon}
          />
          <TextInput
            placeholder={isDate ? "Date" : "Time"}
            placeholderTextColor={COLORS.BLACK}
            style={[styles.textInput, { color: COLORS.BLACK }]}
            value={
              isDate
                ? `${field.getDate()}/${
                    field.getMonth() + 1
                  }/${field.getFullYear()}`
                : field.toLocaleTimeString()
            }
            editable={false}
          />
        </View>
      </TouchableWithoutFeedback>
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={isDate ? "date" : "time"}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        date={field}
      />
    </View>
  );
}

function PasswordField({ password, setPassword }) {
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  return (
    <View>
      <IconButton icon="lock" color={COLORS.BLACK} style={styles.frontIcon} />
      <TextInput
        keyboardType={isPasswordSecure ? undefined : "visible-password"}
        placeholder="Password"
        placeholderTextColor={COLORS.BLACK}
        style={styles.textInput}
        secureTextEntry={isPasswordSecure}
        onChangeText={(text) => setPassword(text)}
        value={password}
        autoCapitalize="none"
      />
      <IconButton
        icon={isPasswordSecure ? "eye" : "eye-off"}
        onPress={() => {
          isPasswordSecure
            ? setIsPasswordSecure(false)
            : setIsPasswordSecure(true);
        }}
        style={styles.eye}
      />
    </View>
  );
}

export { InputField, PasswordField, FormButton, TimeField };

const styles = StyleSheet.create({
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    paddingLeft: 10,
    backgroundColor: COLORS.WHITE,
    paddingLeft: 50,
    paddingRight: 50,
  },
  eye: {
    position: "absolute",
    top: 12.5,
    right: 25,
  },
  frontIcon: {
    position: "absolute",
    top: 12.5,
    left: 25,
    zIndex: 1,
  },
  formButton: {
    backgroundColor: COLORS.RED,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.WHITE,
    letterSpacing: 0.5,
    width: "100%",
    height: "100%",
    textAlignVertical: "center",
    textAlign: "center",
  },
});
