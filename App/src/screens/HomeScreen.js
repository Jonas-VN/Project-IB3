import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  RefreshControl,
} from "react-native";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";

import { COLORS } from "../constants";
import { auth } from "../firebase";
import Article from "../components/Article";

const HomeScreen = () => {
  var user = auth.currentUser;
  user.reload();
  user = auth.currentUser;
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
        <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
        <AutoSizeText
          style={styles.profileText}
          fontSize={32}
          numberOfLines={1}
          mode={ResizeTextMode.max_lines}
        >
          Welcome {user.displayName ? user.displayName : user.email}!
        </AutoSizeText>
      </View>
      <View style={styles.bottomContainer}>
        <Article
          title={"Who are we"}
          text={
            "We are a group of 3 students making a fully automated parking garage using Home Assistant."
          }
        />
        <Article
          title={"How to pay"}
          text={
            "You can pay at the entrance of the garage using your credit card."
          }
        />
        <Article
          title={"Where"}
          text={"We are located in Ghent at the KU Leuven."}
        />
        <Article
          title={"Disabled parking spaces"}
          text={"We provide 2 disabled parking spaces."}
        />
        <Article
          title={"Security"}
          text={"There is 1 security guard on site 24/7."}
        />
        <Article
          title={"Contact"}
          text={
            "You can contact us via email: gil.nimmegeers@student.kuleuven.be"
          }
        />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

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
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: COLORS.WHITE,
    borderWidth: 2,
    margin: 20,
  },
  profileText: {
    fontSize: 20,
    color: COLORS.WHITE,
    marginRight: 110,
  },
  bottomContainer: {
    // borderWidth: 5,
    // flex: 1,
  },
});
