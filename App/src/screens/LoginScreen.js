import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withDelay,
  runOnJS,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import React, { useEffect, useState } from "react";
import Svg, { Image, Ellipse, ClipPath } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { ref, getDownloadURL } from "firebase/storage";

import { COLORS } from "../constants";
import { PasswordField, InputField } from "../components/FormFields";
import { auth, storage } from "../firebase";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const imagePositionX = useSharedValue(1);
  const imagePositionY = useSharedValue(1);
  const formButtonScale = useSharedValue(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setisLoggingIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTimeout(() => {
          navigation.replace("Navigator");
          runOnJS(setisLoggingIn)(false);
          imagePositionX.value = 1;
          resetFields();
        }, 2500);
      }
    });
    return unsubscribe;
  }, []);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const interpolationX = isLoggingIn
      ? interpolate(imagePositionX.value, [0, 1], [-width, 0])
      : 0;
    const interpolationY = interpolate(
      imagePositionY.value,
      [0, 1],
      [-height / 8, 0]
    ); //verschuivingswaarden
    return {
      transform: [
        { translateX: withTiming(interpolationX, { duration: 2500 }) },
        { translateY: withTiming(interpolationY, { duration: 1000 }) },
      ],
    };
  });

  const buttonsAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePositionY.value, [0, 1], [250, 0]);
    return {
      opacity: withTiming(imagePositionY.value, { duration: 500 }),
      transform: [
        { translateY: withTiming(interpolation, { duration: 1000 }) },
      ],
    };
  });

  const closeButtonContainerStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePositionY.value, [0, 1], [180, 360]);
    return {
      opacity: withTiming(imagePositionY.value === 1 ? 0 : 1, {
        duration: 800,
      }),
      transform: [
        { rotate: withTiming(interpolation + "deg", { duration: 1000 }) },
      ],
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity:
        imagePositionY.value === 0
          ? withDelay(400, withTiming(1, { duration: 800 }))
          : withTiming(0, { duration: 300 }),
    };
  });

  const formButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: formButtonScale.value }],
    };
  });

  const resetFields = () => {
    runOnJS(setEmail)("");
    runOnJS(setPassword)("");
    runOnJS(setRepeatedPassword)("");
  };

  const handleSignUp = async () => {
    if (password !== repeatedPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      imagePositionX.value = 0;

      const user = userCredential.user;
      const imageRef = ref(storage, "default/profilePicture.png");
      // Set profile image in profile
      getDownloadURL(imageRef).then((url) => {
        updateProfile(user, {
          photoURL: url,
        });
      });
      confirmEmail(user);
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          alert("This email is already in use.");
          break;
        case "auth/invalid-email":
          alert("Invalid email address.");
          break;
        case "auth/weak-password":
          alert("Password should be at least 6 characters.");
          break;
        default:
          alert("An error occurred. Please try again later.");
          break;
      }
    }
  };

  const handleSingIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        imagePositionX.value = 0;
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/invalid-email":
            alert("Please enter a valid email address.");
            break;
          case "auth/user-not-found":
            alert(
              "The email address you entered does not belong to an existing account."
            );
            break;
          case "auth/wrong-password":
            alert("The password you entered is incorrect.");
            break;
          case "auth/too-many-requests":
            alert(
              "To many failed login attempts. Your account has been temporarily disabled. Try again later."
            );
            break;
          default:
            alert("An error occurred. Please try again later.");
            break;
        }
      });
  };

  const loginAnimation = () => {
    imagePositionY.value = 0;
    if (isRegistering) {
      runOnJS(setIsRegistering)(false);
    }
  };

  const registerAnimation = () => {
    imagePositionY.value = 0;
    if (!isRegistering) {
      runOnJS(setIsRegistering)(true);
    }
  };

  const confirmEmail = (user) => {
    sendEmailVerification(user).catch((error) => {
      alert(error);
    });
  };

  return (
    <Animated.View style={[styles.container]}>
      <Animated.View style={[StyleSheet.absoluteFill, imageAnimatedStyle]}>
        <Svg height={height + 100} width={width}>
          <ClipPath id="clipPathId">
            <Ellipse cx={width / 2} rx={height} ry={height + 100} />
          </ClipPath>
          <Image
            href={require("../assets/auto.jpg")}
            width={width}
            height={height - 100}
            //preserveAspectRatio={"xMidYMid slice"} //allign midpoints en hele afbeelding zichtbaar
            clipPath="url(#clipPathId)"
          />
        </Svg>
        <Animated.View
          style={[styles.closeButtonContainer, closeButtonContainerStyle]}
        >
          <TouchableOpacity
            style={{ width: "100%", height: "100%" }}
            onPress={() => {
              imagePositionY.value = 1;
              imagePositionX.value = 1;
              resetFields();
            }}
          >
            <Text style={styles.buttonX}>X</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      <View style={styles.bottomContainer}>
        <Animated.View style={buttonsAnimatedStyle}>
          <Pressable style={styles.button} onPress={loginAnimation}>
            <Text style={styles.buttonText}>LOG IN</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={buttonsAnimatedStyle}>
          <Pressable style={styles.button} onPress={registerAnimation}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.formInputContainer, formAnimatedStyle]}>
          <InputField
            field={email}
            setField={setEmail}
            placeholder={"Email"}
            icon={"email"}
            keyboardType={"email-address"}
          />
          <PasswordField
            password={password}
            setPassword={setPassword}
            styles={styles}
          />
          {isRegistering && (
            <PasswordField
              password={repeatedPassword}
              setPassword={setRepeatedPassword}
              styles={styles}
            />
          )}
          <Animated.View style={[styles.formButton, formButtonAnimatedStyle]}>
            <TouchableWithoutFeedback
              onPress={() => {
                formButtonScale.value = withSequence(
                  withSpring(1.5),
                  withSpring(1)
                );
                runOnJS(setisLoggingIn)(true);
                isRegistering ? handleSignUp() : handleSingIn();
                Keyboard.dismiss();
              }}
              accessible={false}
            >
              <Text style={styles.buttonText}>
                {isRegistering ? "REGISTER" : "LOG IN"}
              </Text>
            </TouchableWithoutFeedback>
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: COLORS.WHITE,
  },
  button: {
    backgroundColor: COLORS.RED,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 35,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
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
  bottomContainer: {
    justifyContent: "center",
    height: height / 2.25,
    zIndex: 1,
    backgroundColor: COLORS.WHITE,
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
  formInputContainer: {
    marginBottom: 70,
    ...StyleSheet.absoluteFill, //knoppen onderaan
    zIndex: -1, //klikbare knoppen
    justifyContent: "center",
    backgroundColor: COLORS.WHITE,
  },
  closeButtonContainer: {
    height: 40,
    width: 40,
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
    borderRadius: 20,
    top: -400,
    borderColor: COLORS.WHITE,
  },
  buttonX: {
    color: COLORS.WHITE,
    top: 10,
    textAlign: "center",
  },
});
