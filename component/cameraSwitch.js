import React from "react";
import { CameraType } from "expo-camera";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

/**
 * CameraSwitchButton 카메라 앞뒤 전환
 * @param {prop} cameraType - front, back
 * @param {prop} setCameraType - setCameraType
 * @returns cameraType(front or back)
 */
export const CameraSwitchButton = ({ cameraType, setCameraType }) => {
  const onCameraSwitch = () => {
    if (cameraType === CameraType.front) {
      setCameraType(CameraType.back);
    } else {
      setCameraType(CameraType.front);
    }
  };
  return (
    <TouchableReverseCamera onPress={onCameraSwitch}>
      <Ionicons size={20} color="black" name="camera-reverse" />
    </TouchableReverseCamera>
  );
};

const TouchableReverseCamera = styled.TouchableOpacity`
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
