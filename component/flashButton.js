import React from "react";
import { FlashMode } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styled from "styled-components/native";

/**
 * FlashChangeButton 플래시 켜키
 * @param {prop} flashMode - torch, off
 * @param {prop} setFlashMode - setFlashMode
 * @returns setFlashMode(torch or off)
 */
export const FlashChangeButton = ({ flashMode, setFlashMode }) => {
  const onFlashChange = () => {
    if (flashMode === FlashMode.off) {
      setFlashMode(FlashMode.torch);
    } else if (flashMode === FlashMode.torch) {
      setFlashMode(FlashMode.off);
    }
  };
  return (
    <TouchableFlashLight onPress={onFlashChange}>
      <MaterialCommunityIcons
        size={20}
        color="black"
        name={
          flashMode === FlashMode.off
            ? "flashlight-off"
            : flashMode === FlashMode.torch
            ? "flashlight"
            : ""
        }
      />
    </TouchableFlashLight>
  );
};

const TouchableFlashLight = styled.TouchableOpacity`
  margin-bottom: 15px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  border-width: 3px;
  /* height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center; */
`;
