export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'LINK';
export type ChatSpeaker = 'ME' | 'YOU';

export interface MediaItem {
  type: MediaType;
  url: string;
  caption?: string;
}

export interface ChatItem {
  speaker: ChatSpeaker;
  message: string;
}

export interface TimelineItem {
  id?: string;
  userId: string;
  title: string;
  description: string;
  takeaway?: string;
  media?: MediaItem[];
  chats?: ChatItem[];
  eventDate?: string;
  special: boolean;
  active?: boolean;
}
