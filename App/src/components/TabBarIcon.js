import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../constants";

export default function TabBarIcon({ icon, focused }) {
  return (
    <View style={styles.tabButton}>
      <FontAwesome5
        name={icon}
        size={20}
        color={focused ? COLORS.RED : COLORS.GRAY}
      ></FontAwesome5>
    </View>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    position: "absolute",
    top: 20,
  },
  notification: {
    height: 15,
    width: 15,
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 1,
    backgroundColor: COLORS.RED,
    alignItems: "center",
    borderRadius: 10,
    bottom: 30,
    left: 10,
  },
  notificationText: {
    color: COLORS.WHITE,
    fontSize: 8,
    fontWeight: "bold",
  },
});
