export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

class CloudSyncClass {
  private getUsername(): string {
    const session = localStorage.getItem('voca_user_session');
    if (session) {
      try {
        return JSON.parse(session).username || 'anonymous';
      } catch {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  public async saveChatMessage(role: 'user' | 'assistant', content: string) {
    const user = this.getUsername();
    const key = `voca_chat_history_${user}`;
    const saved = localStorage.getItem(key);
    const messages: ChatMessage[] = saved ? JSON.parse(saved) : [];

    messages.push({
      role,
      content: content.substring(0, 2000),
      ts: Date.now(),
    });

    if (messages.length > 100) messages.splice(0, messages.length - 100);
    localStorage.setItem(key, JSON.stringify(messages));
  }

  public async getChatHistory(limit = 50): Promise<ChatMessage[]> {
    const user = this.getUsername();
    const key = `voca_chat_history_${user}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    try {
      const messages: ChatMessage[] = JSON.parse(saved);
      return messages.slice(-limit);
    } catch {
      return [];
    }
  }

  public async clearChatHistory() {
    const user = this.getUsername();
    const key = `voca_chat_history_${user}`;
    localStorage.removeItem(key);
  }

  public isConfigured() {
    return true;
  }

  public lastSyncTime() {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
}

export const CloudSync = new CloudSyncClass();
