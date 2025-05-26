import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function uploadFiles(files: File[]) {
    try {
        const response = await utapi.uploadFiles(files);
        const results = Array.isArray(response) ? response : [response];
        return results
            .map((res) => res.data?.ufsUrl)
            .filter((url): url is string => url !== undefined);
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}

export async function deleteFiles(fileKeys: string[]) {
    try {
        await utapi.deleteFiles(fileKeys);
    } catch (error) {
        console.error("Delete failed:", error);
        throw error;
    }
}