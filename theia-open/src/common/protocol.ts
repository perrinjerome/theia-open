
export const OpenEditorBrowserService = Symbol('OpenEditorBrowserService');
export const OPEN_EDITOR_BACKEND_PATH = '/services/openEditor';

export interface OpenEditorBrowserService {
    openFile(filePath: string): Promise<void>;
    closeFile(filePath: string): Promise<void>;
    isFileOpen(filePath: string): Promise<boolean>;
}

export const OpenEditorBackendService = Symbol('OpenEditorBackendService');

export interface OpenEditorBackendService {
    openFile(filePath: string): Promise<void>;
    closeFile(filePath: string): Promise<void>;
    isFileOpen(filePath: string): Promise<boolean>;
};
