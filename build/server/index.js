import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, redirect, data, useRouteLoaderData, Meta, Links, ScrollRestoration, Scripts, isRouteErrorResponse, Outlet } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, createContext, useMemo, useCallback, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: request.url
        }
      ),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary2) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary2, props);
  };
}
const stylesheet = "/assets/app-CS5Taed4.css";
const defaultLangContext = {
  lang: "ar",
  t: {}
};
const LanguageContext = createContext(defaultLangContext);
const supportedLanguages = ["en", "ar"];
const DEFAULT_LANG = "en";
const themeCookieMaxAge = 5 * 365 * 24 * 60 * 60;
const createThemeSlice = (set) => {
  return {
    mode: void 0,
    setMode: (mode) => {
      set({ mode });
      if (typeof window !== "undefined") {
        document.cookie = `theme=${mode}; Max-age=${themeCookieMaxAge}; path=/`;
      }
    },
    toggle: () => set((state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        document.cookie = `theme=${newMode}; Max-age=${themeCookieMaxAge}; path=/`;
      }
      return {
        ...state,
        mode: newMode
      };
    })
  };
};
function getCookie(request, name) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return void 0;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie == null ? void 0 : cookie.split("=")[1];
}
const meta$2 = {
  home: "الصفحة الرئيسية"
};
const ar = {
  meta: meta$2
};
const meta$1 = {
  home: "Home"
};
const en = {
  meta: meta$1
};
const langs = { ar, en };
function extractLang(request) {
  if (request instanceof Request) {
    const lang = new URL(request.url).pathname.split(
      "/"
    )[1];
    if (supportedLanguages.includes(lang)) {
      const t = langs[lang];
      return { lang, t };
    }
  } else if (request == null ? void 0 : request.pathname) {
    const lang = request.pathname.split("/")[1];
    if (supportedLanguages.includes(lang)) {
      const t = langs[lang];
      return { lang, t };
    }
  }
  return {
    lang: DEFAULT_LANG,
    t: langs[DEFAULT_LANG],
    redirect: true
  };
}
const serveLayoutSSR = async ({ request }) => {
  const { lang, t, redirect: redirectToDefaultLang } = extractLang(request);
  if (redirectToDefaultLang) {
    return redirect(`/${DEFAULT_LANG}`);
  }
  const theme = getCookie(request, "theme") || "light";
  return data(
    {
      theme,
      lang,
      t
    },
    {
      headers: {
        "Set-Cookie": `theme=${theme}; Max-age=${themeCookieMaxAge}; path=/`
      }
    }
  );
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1e3,
      // 5 minutes
      retry: 1
    }
  }
});
const usePersistedStore = create()(
  persist((...a) => ({ ...createThemeSlice(...a) }), { name: "store" })
);
create((...a) => ({
  ...createThemeSlice(...a)
}));
function useAppLayout() {
  const serverData = useRouteLoaderData("root");
  const { mode: theme, setMode: setTheme } = usePersistedStore();
  const resolvedTheme = useMemo(
    () => theme || (serverData == null ? void 0 : serverData.theme) || "light",
    [theme, serverData == null ? void 0 : serverData.theme]
  );
  const resolvedLang = useMemo(
    () => (serverData == null ? void 0 : serverData.lang) || "en",
    [serverData == null ? void 0 : serverData.lang]
  );
  const dir = useMemo(
    () => resolvedLang === "ar" ? "rtl" : "ltr",
    [resolvedLang]
  );
  const initializeTheme = useCallback(() => {
    if (!theme && (serverData == null ? void 0 : serverData.theme)) {
      setTheme(serverData.theme);
    }
  }, [theme, serverData == null ? void 0 : serverData.theme, setTheme]);
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);
  return {
    resolvedTheme,
    resolvedLang,
    dir
  };
}
function AppLayout({ children }) {
  const { resolvedTheme, resolvedLang, dir } = useAppLayout();
  console.log(resolvedTheme);
  return /* @__PURE__ */ jsxs("html", { lang: resolvedLang, dir, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Theme, { appearance: resolvedTheme, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children }) }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function ErrorBoundaryFunc({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    error.status;
    message = error.status === 404 ? "404" : `Error ${error.status}`;
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }
  return /* @__PURE__ */ jsxs(
    "main",
    {
      style: {
        padding: "2rem 1rem",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh"
      },
      children: [
        /* @__PURE__ */ jsx(
          "h1",
          {
            style: {
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "#dc2626"
            },
            children: message
          }
        ),
        /* @__PURE__ */ jsx(
          "p",
          {
            style: {
              marginBottom: "1rem",
              color: "#4b5563",
              fontSize: "1.125rem"
            },
            children: details
          }
        ),
        stack
      ]
    }
  );
}
function useLang() {
  var _a;
  const url = useParams();
  const t = ((_a = useRouteLoaderData("root")) == null ? void 0 : _a.t) || {
    error: "No translation file found"
  };
  return { lang: url.lang || DEFAULT_LANG, t };
}
const links = () => [{
  rel: "stylesheet",
  href: stylesheet
}, {
  rel: "icon",
  href: "/Arrow-03.svg"
}];
const loader$1 = serveLayoutSSR;
const ErrorBoundary = withErrorBoundaryProps(ErrorBoundaryFunc);
const root = withComponentProps(function App() {
  const d = useLang();
  return /* @__PURE__ */ jsx(LanguageContext.Provider, {
    value: d,
    children: /* @__PURE__ */ jsxs(AppLayout, {
      children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster, {
        position: "bottom-right"
      })]
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: root,
  links,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function serveHomeMeta() {
  const { t } = useLang();
  return [{ title: t.meta.home }];
}
async function serveHomeSSR() {
  return {};
}
const loader = serveHomeSSR;
const meta = serveHomeMeta;
const index = withComponentProps(function page({
  loaderData
}) {
  const {
    t
  } = useLang();
  return /* @__PURE__ */ jsx("main", {
    children: /* @__PURE__ */ jsx("h2", {
      children: t.meta.home
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DWiNH4ri.js", "imports": ["/assets/chunk-BAXFHI7N-DH2xFhvJ.js", "/assets/index-DMmtcqB8.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-s1a7sOgz.js", "imports": ["/assets/chunk-BAXFHI7N-DH2xFhvJ.js", "/assets/index-DMmtcqB8.js", "/assets/useLang-C947laj4.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/index": { "id": "pages/index", "parentId": "root", "path": ":lang", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/index-eTC6gs_k.js", "imports": ["/assets/useLang-C947laj4.js", "/assets/chunk-BAXFHI7N-DH2xFhvJ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-36cacf0d.js", "version": "36cacf0d", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "pages/index": {
    id: "pages/index",
    parentId: "root",
    path: ":lang",
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
