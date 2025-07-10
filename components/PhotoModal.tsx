import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Asset } from "expo-media-library";
import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { usePhotoSync } from "@/hooks/usePhotoSync";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface PhotoModalProps {
  photo: Asset | null;
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export function PhotoModal({ photo, visible, onClose }: PhotoModalProps) {
  const colorScheme = useColorScheme();
  const { cloudinaryUrls } = usePhotoSync();

  if (!photo) return null;

  const cloudinaryUrl = cloudinaryUrls[photo.id];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (cloudinaryUrl) {
      try {
        await Share.share({
          url: cloudinaryUrl,
          message: "Check out this photo!",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const MetadataRow = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.metadataRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <ThemedText style={styles.metadataLabel}>{label}</ThemedText>
      <ThemedText
        style={[styles.metadataValue, onPress && styles.metadataValueLink]}
        numberOfLines={1}
      >
        {value}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 60 : 100}
        tint={colorScheme === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <IconSymbol size={28} name="xmark.circle.fill" color="#ffffff" />
        </TouchableOpacity>

        {cloudinaryUrl && (
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <IconSymbol size={28} name="square.and.arrow.up" color="#ffffff" />
          </TouchableOpacity>
        )}

        <ScrollView style={styles.scrollView} bounces={false}>
          <Image
            source={{ uri: cloudinaryUrl || photo.uri }}
            style={[styles.image, { width: screenWidth, height: screenWidth }]}
            contentFit="contain"
          />

          <ThemedView style={styles.metadataContainer}>
            <ThemedText style={styles.metadataTitle}>
              Photo Information
            </ThemedText>

            <MetadataRow
              label="Created"
              value={formatDate(photo.creationTime)}
            />
            <MetadataRow
              label="Modified"
              value={formatDate(photo.modificationTime)}
            />
            <MetadataRow
              label="Dimensions"
              value={`${photo.width} × ${photo.height}`}
            />
            <MetadataRow label="File name" value={photo.filename} />
            {cloudinaryUrl && (
              <MetadataRow
                label="Cloud URL"
                value={cloudinaryUrl}
                onPress={() => Share.share({ url: cloudinaryUrl })}
              />
            )}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    backgroundColor: "#00000020",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  shareButton: {
    position: "absolute",
    top: 50,
    right: 70,
    zIndex: 1,
    padding: 8,
  },
  metadataContainer: {
    padding: 20,
  },
  metadataTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#00000020",
  },
  metadataLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  metadataValue: {
    fontSize: 16,
    maxWidth: "60%",
    textAlign: "right",
  },
  metadataValueLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
