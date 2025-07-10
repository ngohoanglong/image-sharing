import { usePhotoSync } from "@/hooks/usePhotoSync";
import { Image } from "expo-image";
import { Asset } from "expo-media-library";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

interface PhotoGridProps {
  photos: Asset[];
  onPhotoPress: (photo: Asset) => void;
}

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const SPACING = 1;
const PHOTO_SIZE = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;

export function PhotoGrid({ photos, onPhotoPress }: PhotoGridProps) {
  const { uploadProgress, uploadErrors, isPhotoUploaded } = usePhotoSync();

  const renderPhoto = (photo: Asset) => {
    const progress = uploadProgress[photo.id];
    const error = uploadErrors[photo.id];
    const isUploaded = isPhotoUploaded(photo.id);

    return (
      <TouchableOpacity
        key={photo.id}
        style={styles.photoContainer}
        onPress={() => onPhotoPress(photo)}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.photo}
          contentFit="cover"
        />

        {/* Upload Status Overlay */}
        {(progress !== undefined || error || isUploaded) && (
          <View style={styles.statusOverlay}>
            {progress !== undefined && !error && (
              <>
                <ActivityIndicator color="#ffffff" />
                <ThemedText style={styles.progressText}>
                  {Math.round(progress)}%
                </ThemedText>
              </>
            )}
            {error && (
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={24}
                color="#ff3b30"
              />
            )}
            {isUploaded && !error && progress === undefined && (
              <IconSymbol
                name="checkmark.circle.fill"
                size={24}
                color="#34c759"
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return <View style={styles.container}>{photos.map(renderPhoto)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING / 2,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: SPACING / 2,
    backgroundColor: "#00000020",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 4,
  },
});
