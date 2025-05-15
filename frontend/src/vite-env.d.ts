declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
        immediate?: boolean
        onNeedRefresh?: () => void
        onOfflineReady?: () => void
        onRegisteredSW?: (url: string) => void
        onRegisterError?: (error: any) => void
    }

    export function registerSW(options?: RegisterSWOptions): void
}
