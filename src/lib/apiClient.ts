import { toast } from "sonner";

export async function handleAPIResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = "Something went wrong"; // Default error message

        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            errorMessage = response.statusText || errorMessage;
        }

        toast.error(errorMessage);
    }

    return response.json();
}