import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Text,
} from "react-native";
import Article from "../components/Article";

import { COLORS } from "../constants";

const PriceScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
        <Text style={styles.infoText}>Our Prices</Text>
      </View>
      <Article
        title={"First 30 Minutes"}
        text={"The first half an hour is free!"}
      />
      <Article title={"Day Rate"} text={"€1,5 per hour"} />
      <Article title={"Long Term"} text={"€30 per day"} />
    </ScrollView>
  );
};

export default PriceScreen;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    marginBottom: 90,
    marginHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
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
});
