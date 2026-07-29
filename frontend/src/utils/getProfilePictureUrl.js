import { getProfilePicture } from "../api/auth/authService";

export async function getProfilePictureUrl(profilePictureFilename) {
    if (!profilePictureFilename) return null;

    try {
        const res = await getProfilePicture(profilePictureFilename);

        const blob = new Blob([res.data], { type: "image/jpeg" });
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error("Failed to load profile picture:", err);
        return null;
    }
}
