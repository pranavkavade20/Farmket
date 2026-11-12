/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { FileText, MapPin, Mic, Ban, ExternalLink, Download } from 'lucide-react';
import type { ChatMessage } from '@/features/chat';
import { resolveMedia } from '../services/chatService';

interface Props {
  msg: ChatMessage;
  isMe: boolean;
}

export const MessageBubbleContent: React.FC<Props> = ({ msg, isMe }) => {
  if (msg.is_deleted || msg.deleted_for_everyone) {
    return (
      <div className="flex items-center gap-1.5 py-0.5 text-xs italic opacity-70 select-none">
        <Ban className="h-3.5 w-3.5 flex-shrink-0" />
        <span>This message was deleted</span>
      </div>
    );
  }

  const mediaUrl = resolveMedia(msg.file_url);

  switch (msg.message_type) {
    case 'image':
      return mediaUrl ? (
        <div className="space-y-1.5 overflow-hidden">
          <div className="relative group/img overflow-hidden rounded-xl bg-surface-elevated/40 border border-border-subtle/40">
            <img
              src={mediaUrl}
              alt="Shared produce or document"
              loading="lazy"
              className="rounded-xl max-w-[260px] sm:max-w-[320px] max-h-[300px] object-cover transition-transform duration-300 group-hover/img:scale-102 cursor-pointer"
              onClick={() => window.open(mediaUrl, '_blank', 'noopener,noreferrer')}
            />
            <button
              type="button"
              onClick={() => window.open(mediaUrl, '_blank', 'noopener,noreferrer')}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-xs hover:bg-black/80"
              title="Open full image"
              aria-label="Open full image"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          {msg.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-0.5">
              {msg.content}
            </p>
          )}
        </div>
      ) : null;

    case 'video':
      return mediaUrl ? (
        <div className="space-y-1.5">
          <div className="rounded-xl overflow-hidden bg-black/80 border border-border-subtle max-w-[280px] sm:max-w-[320px]">
            <video controls preload="metadata" className="w-full max-h-[260px] object-cover">
              <source src={mediaUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
          {msg.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-0.5">
              {msg.content}
            </p>
          )}
        </div>
      ) : null;

    case 'audio':
      return mediaUrl ? (
        <div className="flex items-center gap-2.5 min-w-[200px] max-w-[280px] py-1">
          <div className={`p-2 rounded-full ${isMe ? 'bg-white/20 text-on-brand' : 'bg-brand/10 text-brand'}`}>
            <Mic className="h-4 w-4 flex-shrink-0" />
          </div>
          <audio controls className="w-full h-8 flex-1" style={{ maxWidth: 220 }}>
            <source src={mediaUrl} />
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null;

    case 'document':
      return mediaUrl ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={msg.file_name ?? true}
          className={`flex items-center gap-3 rounded-xl p-2.5 text-sm transition-all border ${
            isMe
              ? 'bg-white/10 hover:bg-white/20 border-white/20 text-on-brand'
              : 'bg-surface-elevated hover:bg-surface border-border-subtle text-foreground'
          }`}
        >
          <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-brand/10 text-brand'}`}>
            <FileText className="h-5 w-5 flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs truncate max-w-[170px]">
              {msg.file_name || 'Document File'}
            </p>
            <span className="text-[10px] opacity-75">Click to view/download</span>
          </div>
          <Download className="h-4 w-4 opacity-70 flex-shrink-0" />
        </a>
      ) : null;

    case 'location':
      return (
        <a
          href={`https://maps.google.com/?q=${msg.latitude},${msg.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isMe
              ? 'bg-white/10 hover:bg-white/20 border-white/20 text-on-brand'
              : 'bg-surface-elevated hover:bg-surface border-border-subtle text-foreground'
          }`}
        >
          <div className="p-2 rounded-lg bg-danger/10 text-danger flex-shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold">
              {msg.location_name || 'Farm / Delivery Coordinates'}
            </p>
            <span className="text-[10px] opacity-70">
              {msg.latitude?.toFixed(4)}, {msg.longitude?.toFixed(4)} • View on Map
            </span>
          </div>
        </a>
      );

    default:
      return (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words select-text font-normal">
          {msg.content}
        </p>
      );
  }
};

export function lastMsgPreview(msg: ChatMessage | null): string {
  if (!msg) return 'No messages yet';
  if (msg.is_deleted || msg.deleted_for_everyone) return '🚫 Message deleted';
  switch (msg.message_type) {
    case 'image':
      return '📷 Photo';
    case 'video':
      return '🎥 Video';
    case 'audio':
      return '🎙️ Voice note';
    case 'document':
      return `📄 ${msg.file_name ?? 'Document'}`;
    case 'location':
      return '📍 Location';
    default:
      return msg.content;
  }
}
