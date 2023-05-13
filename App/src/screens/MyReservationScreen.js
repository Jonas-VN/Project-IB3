import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS, API_ENTRY_POINT, AUTH_TOKEN } from "../constants";
import Reservation from "../components/Reservation";
import { auth } from "../firebase";

const MyReservationScreen = () => {
  var user = auth.currentUser;
  user.reload();
  user = auth.currentUser;
  const uid = user.uid;
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [pastReservations, setPastReservations] = useState([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReservations();
    fetchPastReservations();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const fetchReservations = async () => {
    const response = await axios
      .get(API_ENTRY_POINT + "getReservations", {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "X-Secure-String": uid,
        },
      })
      .catch(() => {});
    setReservations(response.data);
  };

  const fetchPastReservations = async () => {
    const response = await axios
      .get(API_ENTRY_POINT + "getPastReservations", {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "X-Secure-String": uid,
        },
      })
      .catch(() => {});
    setPastReservations(response.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchReservations(), fetchPastReservations()]);
    };
    fetchData();
  }, []);

  // Zo worden nieuwe reservaties ook getoond als je terug naar dit scherm komt
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
      fetchPastReservations();
    }, [])
  );

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
        <Text style={styles.infoText}>Your Reservations</Text>
      </View>
      <View>
        {reservations.length > 0 ? (
          reservations.map((data) => {
            return <Reservation data={data} key={data._id} />;
          })
        ) : (
          <Text style={[styles.notFound, { color: COLORS.RED }]}>
            No reservations planned
          </Text>
        )}
      </View>
      <View style={styles.line}></View>
      <View>
        {pastReservations.length > 0 ? (
          pastReservations.map((data) => {
            return <Reservation data={data} past={true} key={data._id} />;
          })
        ) : (
          <Text style={[styles.notFound, { color: COLORS.GRAY }]}>
            No past reservations found
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default MyReservationScreen;

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
  line: {
    borderBottomWidth: 2,
    borderColor: COLORS.GRAY,
    marginHorizontal: 10,
  },
  notFound: {
    textAlign: "center",
    marginVertical: 30,
  },
});
