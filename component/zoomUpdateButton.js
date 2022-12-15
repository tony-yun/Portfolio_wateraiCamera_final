import React from "react";
import { Alert, Button } from "react-native";
import axios from "axios";
import styled from "styled-components/native";

/**
 * ZoomUpdateButton 디바이스에서 줌 값을 DB로 전송하는 버튼
 * @param {number} zoom - zoom value
 * @param {string} deviceUniqueId - the UniqueId of the android device
 * @returns zoom value
 */
export const ZoomUpdateButton = ({ zoom, deviceUniqueId }) => {
  const updateCameraZoom = async () => {
    const res = await axios.post(
      "http://112.175.114.29:4002/jjnet/updateCameraZoom",
      { zoom: Math.round(zoom * 100), deviceUniqueId: deviceUniqueId }
    );
    Alert.alert(res?.data);
  };
  return (
    <ZoomButton onPress={updateCameraZoom}>
      <StatusText>{`${Math.round(zoom * 100)}`}</StatusText>
    </ZoomButton>
  );
};

const ZoomButton = styled.TouchableOpacity`
  margin-bottom: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  border-width: 4px;
`;
const StatusText = styled.Text`
  color: black;
  font-size: 18px;
  font-weight: 800;
  width: 100%;
  text-align: center;
`;
