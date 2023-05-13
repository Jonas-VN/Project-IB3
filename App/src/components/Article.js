import { StyleSheet, Text, View } from "react-native";
import React from "react";

import { COLORS } from "../constants";

const Article = ({ title, text, red = true }) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: red ? COLORS.RED : COLORS.GRAY },
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.articleContainer}>
        <Text style={styles.article}>{text}</Text>
      </View>
    </View>
  );
};

export default Article;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 15,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  titleContainer: {
    borderBottomColor: COLORS.WHITE,
    borderBottomWidth: 2,
    marginHorizontal: 10,
    marginTop: 10,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 25,
    marginHorizontal: 5,
  },
  articleContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  article: {
    color: COLORS.WHITE,
    fontSize: 15,
    marginHorizontal: 5,
    marginTop: 5,
  },
});
