import React from "react";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RNRestart from "react-native-restart";

/**
 * RestartButton 문제가 있을 시 재시작 버튼
 * @returns restart function
 */
export const RestartButton = () => {
  const restart = () => RNRestart.Restart();
  return (
    <RestartApp
      onPress={() => {
        restart();
      }}
    >
      <MaterialCommunityIcons name="restart" size={20} color="black" />
    </RestartApp>
  );
};

const RestartApp = styled.TouchableOpacity`
  margin-bottom: 15px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  border-width: 3px;
  /* width: 40px;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center; */
`;
