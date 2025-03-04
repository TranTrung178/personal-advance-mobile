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
        uri: "https://static.wixstatic.com/media/c837a6_4b1be1c274b5400983078d325c960840~mv2.jpg/v1/fill/w_954,h_1305,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/06.jpg",
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
    justifyContent: "center", // Căn giữa nội dung bên trong ảnh nền
    alignItems: "center",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    // padding: 20,
    width: "100%",
    // maxWidth: 340,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
