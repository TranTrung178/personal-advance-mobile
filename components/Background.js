import React from "react";
import {
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";

import { theme } from "../core/theme";

export default function Background({ children }) {
  return (
    <ImageBackground
      source={{
        uri: "https://simplylizlove.com/wp-content/uploads/2020/06/h4-port-img-1-1.jpg",
      }}
      style={styles.background}
      
    >
      <KeyboardAvoidingView  behavior="padding">
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    // justifyContent: "center", // Căn giữa nội dung bên trong ảnh nền
    // alignItems: "center",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
