import React from "react";
import styled from "styled-components/native";
import { Entypo } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Alert } from "react-native";

/**
 * LocationButton 위치 지정 버튼이지만 사용 안함.
 * @param {prop} setLocation - default location
 * @param {prop} setCheckedLocation - when device moves, the new location when settled
 * @returns location
 */
export const LocationButton = ({ setLocation, setCheckedLocation }) => {
  const resendLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied"); //setErrorMsg를 왜 사용하는지?
    }

    let XYlocation = await Location.getCurrentPositionAsync({});
    setLocation(XYlocation);

    let AreaLocation = await Location.reverseGeocodeAsync(
      {
        latitude: XYlocation?.coords?.latitude,
        longitude: XYlocation?.coords?.longitude,
      },
      { useGoogleMaps: false }
    );
    if (
      !!AreaLocation?.[0]?.region &&
      !!AreaLocation?.[0]?.district &&
      !!AreaLocation?.[0]?.street &&
      !!XYlocation?.coords?.latitude &&
      !!XYlocation?.coords?.longitude
    ) {
      setCheckedLocation({
        AdmAr_Do: AreaLocation?.[0]?.region,
        AdmAr_Si: AreaLocation?.[0]?.district,
        AdmAr_Ku: AreaLocation?.[0]?.street,
        latitude: XYlocation?.coords?.latitude,
        longitude: XYlocation?.coords?.longitude,
      });
    }
  };
  return (
    <LocationReset
      onPress={() => {
        resendLocation(Alert.alert("RESET LOCATION SUCCESS"));
      }}
    >
      <Entypo name="location" size={40} color="black" />
    </LocationReset>
  );
};

const LocationReset = styled.TouchableOpacity`
  width: 40px;
  height: 99%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;
