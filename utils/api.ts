export const API_BASE_URL = "https://nontypically-estuarine-jace.ngrok-free.dev/api";

export interface Note {
  id: string;
  message: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch(`${API_BASE_URL}/notes`);
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
}

export interface ChatMessage {
  message: string;
  sender: string;
  replyId?: string;
}

export async function sendChatMessage(data: ChatMessage): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }
}
