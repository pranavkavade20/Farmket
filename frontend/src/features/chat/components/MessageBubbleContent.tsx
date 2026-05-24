import React from 'react';
import { FileText, MapPin, Mic, Video, Image } from 'lucide-react';
import type { ChatMessage } from '@/features/chat';

interface Props { msg: ChatMessage; isMe: boolean; }

export const MessageBubbleContent: React.FC<Props> = ({ msg, isMe }) => {
  if (msg.is_deleted || msg.deleted_for_everyone) {
    return <p className="italic opacity-50 text-sm">🚫 Message deleted</p>;
  }

  switch (msg.message_type) {
    case 'image':
      return msg.file_url ? (
        <div>
          <img
            src={msg.file_url}
            alt="image"
            className="rounded-xl max-w-[240px] max-h-[280px] object-cover cursor-pointer"
            onClick={() => window.open(msg.file_url!, '_blank')}
          />
          {msg.content && <p className="mt-1 text-sm">{msg.content}</p>}
        </div>
      ) : null;

    case 'video':
      return msg.file_url ? (
        <video controls className="rounded-xl max-w-[240px]">
          <source src={msg.file_url} />
        </video>
      ) : null;

    case 'audio':
      return msg.file_url ? (
        <div className="flex items-center gap-2 min-w-[180px]">
          <Mic className="h-4 w-4 flex-shrink-0 text-green-400" />
          <audio controls className="flex-1 h-8" style={{ maxWidth: 200 }}>
            <source src={msg.file_url} />
          </audio>
        </div>
      ) : null;

    case 'document':
      return msg.file_url ? (
        <a
          href={msg.file_url}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium underline ${isMe ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}
        >
          <FileText className="h-5 w-5 flex-shrink-0" />
          <span className="truncate max-w-[160px]">{msg.file_name ?? 'Document'}</span>
        </a>
      ) : null;

    case 'location':
      return (
        <a
          href={`https://maps.google.com/?q=${msg.latitude},${msg.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm underline"
        >
          <MapPin className="h-4 w-4 text-red-400" />
          <span>{msg.location_name || `${msg.latitude}, ${msg.longitude}`}</span>
        </a>
      );

    default:
      return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>;
  }
};

export function lastMsgPreview(msg: ChatMessage | null): string {
  if (!msg) return 'No messages yet';
  if (msg.is_deleted) return '🚫 Message deleted';
  switch (msg.message_type) {
    case 'image': return '📷 Photo';
    case 'video': return '🎥 Video';
    case 'audio': return '🎙️ Voice message';
    case 'document': return `📄 ${msg.file_name ?? 'Document'}`;
    case 'location': return '📍 Location';
    default: return msg.content;
  }
}
