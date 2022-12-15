import React from "react";
import Slider from "@react-native-community/slider";
import { View } from "react-native";

/**
 * ZoomSlider 줌 슬라이더로 줌 값 조정
 * @param {prop} setZoom - setZoom value
 * @returns zoom value
 */
export const ZoomSlider = ({ setZoom }) => {
  const onZoomValueChange = (e) => {
    setZoom(e);
  };
  return (
    <View style={{ top: 15, marginRight: 70 }}>
      <Slider
        style={{
          width: 200,
        }}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#0984e3"
        maximumTrackTintColor="red"
        onValueChange={onZoomValueChange}
      />
    </View>
  );
};
