import React, { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import styled from "styled-components/native";
import { Camera, CameraType, FlashMode } from "expo-camera";
import axios from "axios";
import DeviceInfo from "react-native-device-info";
import * as Location from "expo-location"; //location 기능은 사용 안한다.
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { ZoomSlider } from "./component/zoomSlider";
import { CameraSwitchButton } from "./component/cameraSwitch";
import { FlashChangeButton } from "./component/flashButton";
import { LocationButton } from "./component/locationButton"; //location 버튼 원래 기능: 누르면 현재 디바이스의 좌표 위치가 전송되어 서버에 저장된다. 하지만 해당 기능 사용 안함.
import { RestartButton } from "./component/restartButton";
import { ZoomUpdateButton } from "./component/zoomUpdateButton";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import RNExitApp from "react-native-exit-app";

//앱 시작 시, 자동 촬영 로직 적용 시:
// 아래 주석에 "//앱 시작 후 자동 촬영 시작 로직" 아래 코드 주석 해제
// 앱 이름 wateraiCamera -> wateraiCameraAuto 변경

//원래 카메라앱에서 위치 정보(location)는 수집했으나, 서버에서 수집을 할 필요가 없기에 location 관련 내용을 component/Abandoned.js로 옮김.
//또한 리부팅 후 자동 촬영이 이뤄져야한다면, 20초 후에 촬영 시작 가능하도록 useEffect안에 앱이 부팅 시 촬영 가능하도록 함수를 넣어야 함.

const App = () => {
  const camera = useRef();
  const [cameraReady, setCameraReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [zoom, setZoom] = useState(0);
  const [receiveDuration, setReceiveDuration] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [exeEvent, setExeEvent] = useState(null);
  const [inter, setInter] = useState(null);
  //location 기능 사용 안함.
  // const [checkedLocation, setCheckedLocation] = useState();
  // const [XYlocation, setLocation] = useState(null);
  const [number, setNumber] = useState(60);
  const [verified, setVerified] = useState(false);
  const [cameraAuthority, setCameraAuthority] = useState(false);
  const [micAuthority, setMicAuthority] = useState(false);
  const [geoAuthority, setGeoAuthority] = useState(false);
  const [videoQuality, setVideoQuality] = useState("1080p");
  const [shutDownTime, setShutDownTime] = useState(currentHourTime);

  const onCameraReady = () => setCameraReady(true);
  const deviceUniqueId = DeviceInfo.getUniqueIdSync();

  /** 권한 요청 함수 */
  const getPermissions = async () => {
    const { granted } = await Camera.requestCameraPermissionsAsync();
    setOk(granted);
  };

  // const newDate = new Date(Date.now());
  // const theDate = newDate.toISOString();
  // console.log(theDate);

  const currentDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  const currentHourTime = currentDateTime.substring(11, 13); //현재 시간값 Hour

  console.log("shutDownTime:", shutDownTime);
  console.log("currentHourTime:", currentHourTime);

  /** 카메라 권한 요청 */
  useEffect(() => {
    getPermissions();
  }, [cameraAuthority]);

  /** 카메라 마이크 권한 요청, 영상 촬영 시 마이크 권한 요청은 필수. */
  useEffect(() => {
    Camera.requestMicrophonePermissionsAsync();
  }, [micAuthority]);

  /** 카메라가 준비되어 있다면 cameraExecuter(카메라 세팅)을 실행*/
  useEffect(() => {
    if (!!exeEvent && camera.current && cameraReady) {
      cameraExecuter();
    }
  }, [exeEvent]);

  //앱 시작 후 자동 촬영 시작 로직
  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  useEffect(() => {
    wait(10000).then(() => {
      setIsRecording(true);
      takeVideo();
      activateKeepAwake();
    });
  }, []);

  /**
   * 촬영에 어떤 내용을 보낼 것인지 설정.
   */
  const cameraExecuter = async () => {
    const video = await camera.current.recordAsync({
      maxDuration: receiveDuration, //촬영 최대 지속 시간: receiveDuration을 default값으로 1로 설정해놨음. 즉 1초 촬영.
      // quality: Camera.Constants.VideoQuality[videoQuality], //not determined
      mute: true, //무음 기능 제공, 영상에 소리는 안 담겨져 있음.
    });
    let formData = new FormData();
    if (currentHourTime === shutDownTime) {
      RNExitApp.exitApp();
    }
    //formData에 넣어서 보내는 내용.
    formData.append("file", {
      name: "myVideo.mp4",
      uri: video?.uri,
      type: "video/mp4",
    });
    formData.append("deviceUniqueId", deviceUniqueId); //deviceUniqueId도 추출해서 보내야 어떤 디바이스에서 들어왔는지 알 수 있다.
    formData.append("zoom", Math.round(zoom * 100)); //현재 어떤 zoom값으로 촬영 중인지 값을 전송.0~1이어서 서버로 보낼 때는 *100해서 전송.
    axios
      .post(
        "http://112.175.114.29:4002/jjnet/uploadVideoExeExtract", //이 주소로 위에서 담은 formData를 보낸다.
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log("res:", res?.data);
        if (res?.data?.ok) {
          if (res?.data?.data?.zoom !== zoom) {
            setZoom(res?.data?.data?.zoom * 0.01); //현재 zoom값을 서버로 보내는데, 서버의 응답을 받을 시(서버가 zoom값을 db에서 읽어서 쏜다), 그 값이 클라이언트랑 만약에 다르면, 서버에서 보내온 값으로 카메라zoom값 설정.
          }
          if (res?.data?.data?.duration !== receiveDuration) {
            //위zoom과 마찬가지로 duration을 서버에서 쏜 값으로 설정.
            setReceiveDuration(res?.data?.data?.duration);
          }
          if (res?.data?.data?.shutDownTime !== shutDownTime) {
            setShutDownTime(res?.data?.data?.shutDownTime);
          }
        } else {
          setZoom(0); //만약에 서버에서 zoom, duration값을 안 보냈을 시, 각각 0과1로 세팅.
          setReceiveDuration(1);
          setShutDownTime(18);
        }
        return;
      })
      .catch((err) => console.log(err));
  };

  /**
   * 자동 촬영 로직(촬영 버튼으로 간접적 활성화, takeVideo는 아래 RecordingFunc안에 포함되어 있음.)
   */
  const takeVideo = async () => {
    await cameraExecuter(); //비동기처리로 cameraExecuter 함수를 실행함으로써 어떤 내용을 보낼지 설정하며
    const ii = setInterval(() => {
      setExeEvent(new Date()); //exeEvent를 현재 시간 기준으로 세팅, exeEvent=현재 촬영 날짜
    }, Number(number) * 1000); //default값으로 number를 60으로 정해놨기에 60*1000밀리세컨드= 60초. 즉 60초에 한 번 실행한다는 뜻.
    setInter(ii);
  };

  /**
   * recording버튼으로 직접 실행하는 함수.
   */
  const RecordingFunc = () => {
    if (isRecording === false) {
      setIsRecording(true); //isRecording의 boolean상태에 따라서 true시 버튼 모양을 빨간색으로 체인지.
      takeVideo(); //실행 시킴으로서 60에 한 번, 1회 1초짜리 영상의 자동 촬영 로직 구축
      activateKeepAwake(); //카메라 실행 중에는 화면이 꺼지지 않게 설정. 화면이 꺼지면 카메라가 촬영이 안됨.
    } else {
      //촬영 중지
      setIsRecording(false);
      clearInterval(inter); //자동 촬영 함수 로직 실행중지
      setExeEvent(null); //현재 촬영 날짜 값 비우기
      deactivateKeepAwake(); //화면이 꺼짐 가능하게 원상 복귀.
    }
  };

  return (
    <>
      {verified === false ? (
        /** 만약에 verified === false다, 즉 권한이 아직 부여가 안됐으니, 보여주는 화면은 권한을 요청하는 화면, 권한을 전부 승인 시, 다음 카메라 화면으로 넘어감. */
        <View>
          {
            (setCameraAuthority(true),
            setMicAuthority(true),
            setGeoAuthority(true))
          }
          {cameraAuthority === true &&
          micAuthority === true &&
          geoAuthority === true
            ? setVerified(true)
            : null}
        </View>
      ) : (
        /** 권한 승인 시 넘어오는 화면 */
        <Container>
          {/* 카메라 라이브러리 expo-camera, document에서 필요한 props를 사용하면 된다.*/}
          <Camera
            type={cameraType}
            style={{ flex: 1 }}
            zoom={zoom}
            flashMode={flashMode}
            ref={camera}
            onCameraReady={onCameraReady}
            ratio={"16:9"} //비율을 지정해줘야 안드로이드 디바이스에서 보이는 화면이 안 찌그러져 보인다.
          />

          <LeftButtonRow>
            {/* component/flashButton.js */}
            <FlashChangeButton
              flashMode={flashMode}
              setFlashMode={setFlashMode}
            />
            {/* component/cameraSwitch.js */}
            <CameraSwitchButton
              cameraType={cameraType}
              setCameraType={setCameraType}
            />
            {/* component/restartButton.js */}
            <RestartButton />
            {/* 촬영 버튼 */}
            <MainRecording
              onPress={() => {
                RecordingFunc();
              }}
              style={{ borderColor: isRecording ? "red" : "black" }}
            >
              {isRecording ? (
                <StatusText>{`${number}`}</StatusText>
              ) : (
                <StatusText_2>RC</StatusText_2>
              )}
            </MainRecording>
          </LeftButtonRow>
          {/* 줌 슬라이더 */}
          <ZoomSliderContainer>
            <ZoomSlider setZoom={setZoom} />
          </ZoomSliderContainer>
          {/* 줌 업데이트 버튼 */}
          <RightButtonRow>
            <ZoomUpdateButton zoom={zoom} deviceUniqueId={deviceUniqueId} />
            {/* <FullHdButton
              onPress={() => {
                setVideoQuality("1080p");
                Alert.alert("현재 설정 화질: 1080p");
              }}
            >
              <MaterialIcons size={27} color="black" name="hd" />
            </FullHdButton> */}
            {/* <UltraHdButton
              onPress={() => {
                RNExitApp.exitApp();
              }}
            >
              <Ionicons name="exit-outline" size={25} color="black" />
            </UltraHdButton> */}
          </RightButtonRow>
        </Container>
      )}
    </>
  );
};

export default App;

//styled-component css
const Container = styled.View`
  flex: 1;
`;
const LeftButtonRow = styled.View`
  position: absolute;
  padding-left: 15px;
  padding-top: 15px;
`;
const RightButtonRow = styled.View`
  flex: 1;
  position: absolute;
  right: 15px;
  top: 15px;
`;
const ZoomSliderContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  position: absolute;
  width: 100%;
  padding-right: 15px;
  padding-top: 15px;
`;
const MainRecording = styled.TouchableOpacity`
  margin-bottom: 15px;
  width: 50px;
  height: 50px;
  border-width: 4px;
  border-radius: 50px;
  background-color: white;
  justify-content: center;
  align-items: center;
`;

const StatusText = styled.Text`
  color: red;
  font-size: 18px;
  font-weight: 800;
  width: 100%;
  text-align: center;
`;
const StatusText_2 = styled.Text`
  color: black;
  font-size: 18px;
  font-weight: 800;
  width: 100%;
  text-align: center;
`;
const FullHdButton = styled.TouchableOpacity`
  margin-bottom: 15px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  border-width: 3px;
`;
const UltraHdButton = styled.TouchableOpacity`
  margin-bottom: 15px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  border-width: 3px;
`;

/** 용도를 알 수 없는 인수인계 시점 전에 이미 주석 처리된 함수. */
// useEffect(() => {
//   if (isRecording === false) {
//     setTimeout(() => {
//       RecordingFunc();
//     }, 20000);
//   } else if (isRecording === true) {
//     null;
//   }
// }, []);
