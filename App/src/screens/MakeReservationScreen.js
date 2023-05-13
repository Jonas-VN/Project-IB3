import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
} from "react-native";
import { CheckBox } from "@rneui/themed";
import * as Notifications from "expo-notifications";
import axios from "axios";

import { COLORS, API_ENTRY_POINT, AUTH_TOKEN } from "../constants";
import { TimeField, FormButton, InputField } from "../components/FormFields";
import { auth } from "../firebase";

const MakeReservationScreen = () => {
  var user = auth.currentUser;
  user.reload();
  user = auth.currentUser;

  const emailVerified = user.emailVerified;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetFields();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  var now = new Date();
  if (now.getUTCMinutes() > 0 && now.getUTCMinutes() < 30) {
    now.setUTCMinutes(30);
  } else {
    now.setUTCMinutes(0);
    now.setUTCHours(now.getUTCHours() + 1);
  }
  now.setSeconds(0);
  now.setUTCMilliseconds(0);
  const [startDate, setStartDate] = useState(now);

  var soon = new Date();
  if (soon.getUTCMinutes() > 0 && soon.getUTCMinutes() < 30) {
    soon.setUTCMinutes(30);
    soon.setUTCHours(soon.getUTCHours() + 1);
  } else {
    soon.setUTCMinutes(0);
    soon.setUTCHours(soon.getUTCHours() + 2);
  }
  soon.setSeconds(0);
  soon.setUTCMilliseconds(0);
  const [endDate, setEndDate] = useState(soon);
  const [disabled, setDisabled] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");

  const resetFields = () => {
    setLicensePlate("");
    var now = new Date();
    if (now.getUTCMinutes() > 0 && now.getUTCMinutes() < 30) {
      now.setUTCMinutes(30);
    } else {
      now.setUTCMinutes(0);
      now.setUTCHours(now.getUTCHours() + 1);
    }
    now.setSeconds(0);
    now.setUTCMilliseconds(0);
    setStartDate(now);

    var soon = new Date();
    if (soon.getUTCMinutes() > 0 && soon.getUTCMinutes() < 30) {
      soon.setUTCMinutes(30);
      soon.setUTCHours(soon.getUTCHours() + 1);
    } else {
      soon.setUTCMinutes(0);
      soon.setUTCHours(soon.getUTCHours() + 2);
    }
    soon.setSeconds(0);
    soon.setUTCMilliseconds(0);
    setEndDate(soon);

    setDisabled(false);
  };

  const handleReservate = async () => {
    const data = {
      plate: licensePlate,
      start: startDate,
      end: endDate,
      disabled: disabled,
      uid: user.uid,
    };
    axios
      .post(API_ENTRY_POINT + "insertReservation", data, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      })
      .then((response) => {
        alert(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 420) alert(error.response.data);
        else alert("Something went wrong... Try again...");
      });

    await schedulePushNotification();
    resetFields();
  };

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your parking reservation is ending in 15min",
        body: "Be fast or you'll be charged extra!",
      },
      // 15 min vroeger
      trigger: endDate.getTime() - 15 * 60 * 1000,
    });
  }

  const handleTextChange = (newText) => {
    // Only allow letters and numbers
    const filteredText = newText.replace(/[^a-zA-Z0-9]/g, "");
    setLicensePlate(filteredText);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.topContainer}
      elevation={4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Make A Reservation</Text>
      </View>
      {emailVerified ? (
        <View>
          <View>
            <InputField
              field={licensePlate}
              setField={setLicensePlate}
              placeholder={"Your license plate (no '-' permitted)"}
              icon={"car"}
              onChange={handleTextChange}
            />
          </View>
          <View>
            <Text style={styles.info}>Start date</Text>
            <TimeField field={startDate} />
            <TimeField field={startDate} isDate={false} />
          </View>
          <View>
            <Text style={styles.info}>End date</Text>
            <TimeField field={endDate} />
            <TimeField field={endDate} isDate={false} />
          </View>
          <CheckBox
            center
            checked={disabled}
            onPress={() => setDisabled(!disabled)}
            title={"Disabled parkingspace?"}
            checkedColor={COLORS.RED}
            uncheckedColor={COLORS.GRAY}
          />
          <FormButton text={"Reservate"} onPress={handleReservate} />
        </View>
      ) : (
        <View style={styles.verifyFirst}>
          <Text style={styles.verifyFirstText}>
            Verfiy your email first in the profile tab before making a
            reservation!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MakeReservationScreen;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    marginBottom: 90,
    marginHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
  },
  info: {
    margin: 15,
    borderBottomWidth: 2,
    fontSize: 20,
  },
  infoContainer: {
    backgroundColor: COLORS.RED,
    height: 80,
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 32,
    color: COLORS.WHITE,
  },
  verifyFirst: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  verifyFirstText: {
    fontSize: 20,
    textAlign: "center",
  },
});
