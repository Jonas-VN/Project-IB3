import { useNavigation } from "@react-navigation/core";
import { signOut, updateProfile, sendEmailVerification } from "firebase/auth";
import React, { useState, useCallback } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { auth, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FormButton, InputField } from "../components/FormFields";
import { COLORS } from "../constants";
import { FontAwesome5 } from "@expo/vector-icons";

const MyProfileScreen = () => {
  var user = auth.currentUser;
  user.reload();
  user = auth.currentUser;

  const [name, setName] = useState(user.displayName);
  const [image, setImage] = useState(user.photoURL);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.cancelled) {
      // Upload image to firebase
      const imageRef = ref(storage, `${user.uid}/profilePicture.png`);
      const image = await fetch(result.uri);
      const bytes = await image.blob();
      await uploadBytes(imageRef, bytes).then(() => {
        alert("Image saved!");
      });

      // Set profile image in profile
      getDownloadURL(imageRef).then((url) => {
        updateProfile(user, {
          photoURL: url,
        });
        setImage(url);
      });
    }
  };

  const handleSave = () => {
    if (user.displayName !== name) {
      updateProfile(user, {
        displayName: name,
      });
      alert("Saved changes!");
    }
  };

  const confirmEmail = () => {
    if (!user.emailVerified) {
      sendEmailVerification(user)
        .then(() => {
          alert("Verification email sent to " + user.email + "!");
        })
        .catch((error) => {
          alert(error);
        });
    } else {
      alert("Your email (" + user.email + ") already has been verified!");
    }
  };

  const handleLogOut = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate("Login");
      })
      .catch((error) => alert(error.message));
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      style={styles.topContainer}
      elevation={4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.imageContainer}>
        <View style={styles.image}>
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <TouchableOpacity style={styles.imagePick} onPress={pickImage}>
          <FontAwesome5 name="plus" size={30} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
      <InputField
        field={name}
        setField={setName}
        placeholder="Full Name"
        icon={"account"}
      />
      <InputField editable={false} field={user.email} icon={"email"} />
      <FormButton text={"SAVE"} onPress={handleSave} />
      <FormButton text={"VERIFY EMAIL"} onPress={confirmEmail} />
      <FormButton text={"LOG OUT"} onPress={handleLogOut} />
    </ScrollView>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    marginBottom: 90,
    marginHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
  },
  imageContainer: {
    height: 350,
    alignContent: "center",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  image: {
    width: "75%",
    height: "75%",
    borderRadius: 999,
    borderColor: COLORS.BLACK,
    borderWidth: 5,
    justifyContent: "center",
    alignContent: "center",
    overflow: "hidden",
    top: 30,
  },
  imagePick: {
    width: 50,
    height: 50,
    borderRadius: 250,
    zIndex: 1,
    backgroundColor: COLORS.RED,
    bottom: 40,
    left: 90,
    justifyContent: "center",
    alignItems: "center",
  },
});
