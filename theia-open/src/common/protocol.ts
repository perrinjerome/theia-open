
export const OpenEditorBrowserService = Symbol('OpenEditorBrowserService');
export const OPEN_EDITOR_BACKEND_PATH = '/services/openEditor';

export interface OpenEditorBrowserService {
    openFile(uri: string): Promise<void>;
    closeFile(uri: string): Promise<void>;
    isFileOpen(uri: string): Promise<boolean>;
}

export const OpenEditorBackendService = Symbol('OpenEditorBackendService');

export interface OpenEditorBackendService {
    openFile(uri: string): Promise<void | string>;
    closeFile(uri: string): Promise<void>;
    isFileOpen(uri: string): Promise<boolean>;
};
