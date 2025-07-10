import AsyncStorage from "@react-native-async-storage/async-storage";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Asset } from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { UPLOAD_PRESET, UPLOAD_URL } from "../config/cloudinary";

interface UploadProgress {
  [key: string]: number;
}

interface UploadError {
  [key: string]: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

const STORAGE_KEY = "cloudinary_uploaded_photos";

export const usePhotoSync = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadErrors, setUploadErrors] = useState<UploadError>({});
  const [syncedPhotos, setSyncedPhotos] = useState<string[]>([]);
  const [cloudinaryUrls, setCloudinaryUrls] = useState<{
    [key: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load previously uploaded photos from AsyncStorage
  useEffect(() => {
    const loadSyncedPhotos = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const { photos, urls } = JSON.parse(storedData);
          setSyncedPhotos(photos);
          setCloudinaryUrls(urls);
        }
      } catch (error) {
        console.error("Error loading synced photos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSyncedPhotos();
  }, []);

  // Save synced photos to AsyncStorage
  const saveSyncedPhotos = async (
    photos: string[],
    urls: { [key: string]: string }
  ) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ photos, urls }));
    } catch (error) {
      console.error("Error saving synced photos:", error);
    }
  };

  const clearError = (photoId: string) => {
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[photoId];
      return newErrors;
    });
  };

  const isPhotoUploaded = (photoId: string) => {
    return syncedPhotos.includes(photoId) && cloudinaryUrls[photoId];
  };

  const uploadPhoto = useCallback(
    async (photo: Asset) => {
      try {
        // Clear any previous errors
        clearError(photo.id);

        // Skip if already synced
        if (isPhotoUploaded(photo.id)) {
          console.log(`Photo ${photo.id} already uploaded, skipping...`);
          return;
        }

        // Optimize the image before upload
        const manipResult = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 2000 } }], // Resize if larger than 2000px
          {
            format: SaveFormat.JPEG,
            compress: 0.8, // Slightly compress to reduce upload size
          }
        );

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", {
          uri: manipResult.uri,
          type: "image/jpeg",
          name: `${photo.id}.jpg`,
        } as any);
        formData.append("upload_preset", UPLOAD_PRESET);

        // Create XMLHttpRequest for upload with progress
        const xhr = new XMLHttpRequest();
        xhr.open("POST", UPLOAD_URL);

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [photo.id]: progress,
            }));
          }
        };

        // Handle the upload response
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response: CloudinaryResponse = JSON.parse(xhr.responseText);
            const newSyncedPhotos = [...syncedPhotos, photo.id];
            const newCloudinaryUrls = {
              ...cloudinaryUrls,
              [photo.id]: response.secure_url,
            };

            setSyncedPhotos(newSyncedPhotos);
            setCloudinaryUrls(newCloudinaryUrls);

            // Save to AsyncStorage
            saveSyncedPhotos(newSyncedPhotos, newCloudinaryUrls);

            // Remove progress after completion
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[photo.id];
              return newProgress;
            });
          } else {
            throw new Error(`Upload failed with status ${xhr.status}`);
          }
        };

        // Handle upload errors
        xhr.onerror = () => {
          const errorMessage = Platform.select({
            ios: "Upload failed. Please check your internet connection.",
            android: "Upload failed. Please check your internet connection.",
            default: "Upload failed. Please try again.",
          });
          setUploadErrors((prev) => ({
            ...prev,
            [photo.id]: errorMessage,
          }));
          // Remove progress on error
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[photo.id];
            return newProgress;
          });
        };

        // Start the upload
        xhr.send(formData);
      } catch (error) {
        console.error("Error preparing photo for upload:", error);
        setUploadErrors((prev) => ({
          ...prev,
          [photo.id]: "Failed to prepare photo for upload",
        }));
      }
    },
    [syncedPhotos, cloudinaryUrls]
  );

  const syncPhotos = useCallback(
    async (photos: Asset[]) => {
      // Upload photos in parallel with a limit of 3 concurrent uploads
      const batchSize = 3;
      for (let i = 0; i < photos.length; i += batchSize) {
        const batch = photos.slice(i, i + batchSize);
        await Promise.all(batch.map((photo) => uploadPhoto(photo)));
      }
    },
    [uploadPhoto]
  );

  return {
    uploadProgress,
    uploadErrors,
    syncedPhotos,
    cloudinaryUrls,
    syncPhotos,
    uploadPhoto,
    clearError,
    isPhotoUploaded,
    isLoading,
  };
};
