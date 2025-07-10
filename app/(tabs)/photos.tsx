import {
  Asset,
  MediaType,
  getAssetsAsync,
  requestPermissionsAsync,
} from "expo-media-library";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { PhotoGrid } from "../../components/PhotoGrid";
import { PhotoModal } from "../../components/PhotoModal";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { usePhotoSync } from "../../hooks/usePhotoSync";

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<Asset[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Asset | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { syncPhotos, isLoading } = usePhotoSync();

  const loadPhotos = useCallback(async () => {
    try {
      const { assets } = await getAssetsAsync({
        mediaType: MediaType.photo,
        sortBy: ["creationTime"],
        first: 100,
      });
      setPhotos(assets);

      // Auto sync photos when they're loaded
      if (hasPermission && !isLoading) {
        console.log("Auto syncing photos...");
        await syncPhotos(assets);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  }, [hasPermission, isLoading, syncPhotos]);

  const checkPermission = useCallback(async () => {
    const { granted } = await requestPermissionsAsync();
    setHasPermission(granted);

    if (granted) {
      await loadPhotos();
    }
  }, [loadPhotos]);

  const handleResetPermissions = useCallback(() => {
    Alert.alert(
      "Reset Permissions",
      Platform.select({
        ios: 'To reset permissions:\n\n1. Open Settings\n2. Find this app\n3. Toggle "Photos" permission\n\nWould you like to open Settings now?',
        android:
          'To reset permissions:\n\n1. Open Settings\n2. Apps\n3. Find this app\n4. Permissions\n5. Toggle "Photos" permission\n\nWould you like to open Settings now?',
        default: "Please reset permissions in your device settings.",
      }),
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]
    );
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, [loadPhotos]);

  if (!hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.message}>
            Please grant access to your photos to use this feature.
          </ThemedText>
          <Button onPress={checkPermission} title="Grant Access" />
          <ThemedText style={styles.resetText}>
            Already granted but not working?
          </ThemedText>
          <Button onPress={handleResetPermissions} title="Reset Permissions" />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PhotoGrid photos={photos} onPhotoPress={setSelectedPhoto} />
      <PhotoModal
        photo={selectedPhoto}
        visible={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
      />
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  resetText: {
    textAlign: "center",
    marginTop: 40,
    marginBottom: 10,
    fontSize: 14,
    opacity: 0.7,
  },
});
