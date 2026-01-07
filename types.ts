
export enum AppMode {
  CREATE = 'create',
  EDIT = 'edit'
}

export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic';
export type EditFunction = 'add-remove' | 'retouch' | 'style' | 'compose';

export interface AppState {
  mode: AppMode;
  activeCreateFunction: CreateFunction;
  activeEditFunction: EditFunction;
  prompt: string;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  uploadedImage: string | null;
  uploadedImage2: string | null;
  showModal: boolean;
}
