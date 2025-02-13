import { Alert, Linking } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useCameraPermissions as useExpoCameraPermissions } from "expo-camera";
import { isWeb } from "~/platform/detection";

const openPermissionAlert = (perm: string) => {
  Alert.alert(
    "Permission needed",
    `Bluesky does not have permission to access your ${perm}.`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ],
  );
};

export function usePhotoLibraryPermission() {
  const [res, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ["photo"],
  });
  const requestPhotoAccessIfNeeded = async () => {
    // On the, we use <input type="file"> to produce a filepicker
    // This does not need any permission granting.
    if (isWeb) {
      return true;
    }

    if (res?.granted) {
      return true;
    } else if (!res || res.status === "undetermined" || res?.canAskAgain) {
      const { canAskAgain, granted, status } = await requestPermission();

      if (!canAskAgain && status === "undetermined") {
        openPermissionAlert("photo library");
      }

      return granted;
    } else {
      openPermissionAlert("photo library");
      return false;
    }
  };
  return { requestPhotoAccessIfNeeded };
}
export function useCameraPermission() {
  const [res, requestPermission] = useExpoCameraPermissions();

  const requestCameraAccessIfNeeded = async () => {
    if (res?.granted) {
      return true;
    } else if (!res || res?.status === "undetermined" || res?.canAskAgain) {
      const updatedRes = await requestPermission();
      return updatedRes?.granted;
    } else {
      openPermissionAlert("camera");
      return false;
    }
  };

  return { requestCameraAccessIfNeeded };
}
