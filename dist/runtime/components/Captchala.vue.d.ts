type __VLS_Props = {
    /** Defaults to `captchala.appKey` from the module options / runtime config. */
    appKey?: string;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {
    verify: () => any;
    reset: () => any;
    destroy: () => any;
    bindTo: (selector: string | HTMLElement) => any;
    setLang: (lang: string) => any;
    getInstance: () => any;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
