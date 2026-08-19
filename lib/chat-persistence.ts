import {
  ensureConversation,
  listConversations,
  listMessages,
  saveMessage,
  updateConversationTitle,
} from "./mah-buddy-data";

export async function persistUserMessage(conversationId: string | null, content: string, title?: string) {
  const conversation = conversationId
    ? { id: conversationId }
    : await ensureConversation(title || content.slice(0, 38) || "New chat");
  if (!conversation) return null;
  await saveMessage(conversation.id, "user", content);
  if (title) await updateConversationTitle(conversation.id, title);
  return conversation.id;
}

export async function persistAssistantMessage(conversationId: string | null, content: string) {
  if (!conversationId) return null;
  return saveMessage(conversationId, "assistant", content);
}

export async function restoreChat(conversationId: string) {
  return listMessages(conversationId);
}

export async function restoreHistory() {
  return listConversations();
}
