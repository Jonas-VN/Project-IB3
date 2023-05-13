import * as React from "react";
import { Animated, Dimensions, Platform, StyleSheet, View } from "react-native";
import { useRef } from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../constants";

// All Screens
import HomeScreen from "./HomeScreen";
import MakeReservationScreen from "./MakeReservationScreen";
import MyReservationScreen from "./MyReservationScreen";
import MyProfileScreen from "./MyProfileScreen";
import PriceScreen from "./PriceScreen";

// All components
import TabBarIcon from "../components/TabBarIcon";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Tab = createBottomTabNavigator();

export default function NavigationScreen() {
  const tabOffsetValueX = useRef(new Animated.Value(0)).current;
  const lineOpacity = useSharedValue(100);

  const animatedLineStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(lineOpacity.value, { duration: 500 }),
    };
  });

  const handleTabPress = (index, lineVisible) => {
    lineOpacity.value = lineVisible ? 1 : 0;
    Animated.spring(tabOffsetValueX, {
      toValue: getWidth() * index,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBarStyle,
        }}
        elevation={4}
      >
        <Tab.Screen
          name={"Home"}
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon icon="home" focused={focused} />
            ),
          }}
          listeners={() => ({
            tabPress: () => handleTabPress(0, true),
          })}
        />

        <Tab.Screen
          name={"Prices"}
          component={PriceScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon icon="dollar-sign" focused={focused} />
            ),
          }}
          listeners={() => ({
            tabPress: () => handleTabPress(1, true),
          })}
        />

        <Tab.Screen
          name={"Make Reservation"}
          component={MakeReservationScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <View
                  style={{
                    width: focused ? 75 : 50,
                    height: focused ? 75 : 50,
                    backgroundColor: COLORS.RED,
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: Platform.OS == "android" ? 60 : 30,
                    borderColor: COLORS.WHITE,
                    borderWidth: 2,
                  }}
                >
                  <FontAwesome5
                    name="plus"
                    size={focused ? 30 : 20}
                    color={COLORS.WHITE}
                  />
                </View>
              </View>
            ),
          }}
          listeners={() => ({
            tabPress: () => handleTabPress(2, false),
          })}
        />

        <Tab.Screen
          name={"My Reservations"}
          component={MyReservationScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon icon="calendar-check" focused={focused} />
            ),
          }}
          listeners={() => ({
            tabPress: () => handleTabPress(3, true),
          })}
        />

        <Tab.Screen
          name={"My Profile"}
          component={MyProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon icon="user-alt" focused={focused} />
            ),
          }}
          listeners={() => ({
            tabPress: () => handleTabPress(4, true),
          })}
        />
      </Tab.Navigator>
      <View>
        <Animated.View
          style={[
            {
              width: getWidth() - 20,
              height: 2,
              backgroundColor: COLORS.RED,
              position: "absolute",
              bottom: 78,
              left: 50,
              borderRadius: 20,
              transform: [{ translateX: tabOffsetValueX }],
              opacity: lineOpacity.value,
            },
            animatedLineStyle,
          ]}
        ></Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    position: "absolute",
    bottom: 20,
    marginHorizontal: 20,
    height: 60,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
});

function getWidth() {
  let width = Dimensions.get("window").width;

  // Horizontal Padding = 20...
  width = width - 80;

  // Total five Tabs...
  return width / 5;
}
