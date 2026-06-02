/**
 * Centralized environment configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
