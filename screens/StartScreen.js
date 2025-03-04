import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Background from "../components/Background";
import Header from "../components/Header";
import Paragraph from "../components/Paragraph";

export default function StartScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login"); 
    }, 1000);

    return () => clearTimeout(timer); 
  }, [navigation]);

  return (
    <Background>
      <Header>Introduce</Header>
      <Paragraph> Welcome to Furniture UTE App! </Paragraph>
      <Paragraph> I'm Trần Viết Trung, ID 21110859. </Paragraph>
      <Paragraph> I hope you have a great experience! </Paragraph>
    </Background>
  );
}
