"use strict";
(() => {
  // .wrangler/tmp/bundle-giOxe0/checked-fetch.js
  var urls = /* @__PURE__ */ new Set();
  function checkURL(request, init) {
    const url = request instanceof URL ? request : new URL(
      (typeof request === "string" ? new Request(request, init) : request).url
    );
    if (url.port && url.port !== "443" && url.protocol === "https:") {
      if (!urls.has(url.toString())) {
        urls.add(url.toString());
        console.warn(
          `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
        );
      }
    }
  }
  globalThis.fetch = new Proxy(globalThis.fetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });

  // node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }

  // node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class extends Event {
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof __Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  var __Facade_FetchEvent__ = class extends __Facade_ExtendableEvent__ {
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  var __Facade_ScheduledEvent__ = class extends __Facade_ExtendableEvent__ {
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof __Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    };
    const __facade_sw_fetch__ = function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    };
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var drainBody = async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {
          }
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  };
  var middleware_ensure_req_body_drained_default = drainBody;

  // node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  var jsonError = async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  };
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-giOxe0/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);

  // node_modules/hono/dist/utils/html.js
  var HtmlEscapedCallbackPhase = {
    Stringify: 1,
    BeforeStream: 2,
    Stream: 3
  };
  var raw = (value, callbacks) => {
    const escapedString = new String(value);
    escapedString.isEscaped = true;
    escapedString.callbacks = callbacks;
    return escapedString;
  };
  var escapeRe = /[&<>'"]/;
  var stringBufferToString = async (buffer) => {
    let str = "";
    const callbacks = [];
    for (let i = buffer.length - 1; ; i--) {
      str += buffer[i];
      i--;
      if (i < 0) {
        break;
      }
      let r = await buffer[i];
      if (typeof r === "object") {
        callbacks.push(...r.callbacks || []);
      }
      const isEscaped = r.isEscaped;
      r = await (typeof r === "object" ? r.toString() : r);
      if (typeof r === "object") {
        callbacks.push(...r.callbacks || []);
      }
      if (r.isEscaped ?? isEscaped) {
        str += r;
      } else {
        const buf = [str];
        escapeToBuffer(r, buf);
        str = buf[0];
      }
    }
    return raw(str, callbacks);
  };
  var escapeToBuffer = (str, buffer) => {
    const match = str.search(escapeRe);
    if (match === -1) {
      buffer[0] += str;
      return;
    }
    let escape;
    let index;
    let lastIndex = 0;
    for (index = match; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34:
          escape = "&quot;";
          break;
        case 39:
          escape = "&#39;";
          break;
        case 38:
          escape = "&amp;";
          break;
        case 60:
          escape = "&lt;";
          break;
        case 62:
          escape = "&gt;";
          break;
        default:
          continue;
      }
      buffer[0] += str.substring(lastIndex, index) + escape;
      lastIndex = index + 1;
    }
    buffer[0] += str.substring(lastIndex, index);
  };
  var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
    const callbacks = str.callbacks;
    if (!callbacks?.length) {
      return Promise.resolve(str);
    }
    if (buffer) {
      buffer[0] += str;
    } else {
      buffer = [str];
    }
    const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
      (res) => Promise.all(
        res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
      ).then(() => buffer[0])
    );
    if (preserveCallbacks) {
      return raw(await resStr, callbacks);
    } else {
      return resStr;
    }
  };

  // node_modules/hono/dist/context.js
  var TEXT_PLAIN = "text/plain; charset=UTF-8";
  var setHeaders = (headers, map = {}) => {
    Object.entries(map).forEach(([key, value]) => headers.set(key, value));
    return headers;
  };
  var Context = class {
    req;
    env = {};
    _var = {};
    finalized = false;
    error = void 0;
    #status = 200;
    #executionCtx;
    #headers = void 0;
    #preparedHeaders = void 0;
    #res;
    #isFresh = true;
    layout = void 0;
    renderer = (content) => this.html(content);
    notFoundHandler = () => new Response();
    constructor(req, options) {
      this.req = req;
      if (options) {
        this.#executionCtx = options.executionCtx;
        this.env = options.env;
        if (options.notFoundHandler) {
          this.notFoundHandler = options.notFoundHandler;
        }
      }
    }
    get event() {
      if (this.#executionCtx && "respondWith" in this.#executionCtx) {
        return this.#executionCtx;
      } else {
        throw Error("This context has no FetchEvent");
      }
    }
    get executionCtx() {
      if (this.#executionCtx) {
        return this.#executionCtx;
      } else {
        throw Error("This context has no ExecutionContext");
      }
    }
    get res() {
      this.#isFresh = false;
      return this.#res ||= new Response("404 Not Found", { status: 404 });
    }
    set res(_res) {
      this.#isFresh = false;
      if (this.#res && _res) {
        this.#res.headers.delete("content-type");
        for (const [k, v] of this.#res.headers.entries()) {
          if (k === "set-cookie") {
            const cookies = this.#res.headers.getSetCookie();
            _res.headers.delete("set-cookie");
            for (const cookie of cookies) {
              _res.headers.append("set-cookie", cookie);
            }
          } else {
            _res.headers.set(k, v);
          }
        }
      }
      this.#res = _res;
      this.finalized = true;
    }
    render = (...args) => this.renderer(...args);
    setLayout = (layout) => this.layout = layout;
    getLayout = () => this.layout;
    setRenderer = (renderer) => {
      this.renderer = renderer;
    };
    header = (name, value, options) => {
      if (value === void 0) {
        if (this.#headers) {
          this.#headers.delete(name);
        } else if (this.#preparedHeaders) {
          delete this.#preparedHeaders[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options?.append) {
        if (!this.#headers) {
          this.#isFresh = false;
          this.#headers = new Headers(this.#preparedHeaders);
          this.#preparedHeaders = {};
        }
        this.#headers.append(name, value);
      } else {
        if (this.#headers) {
          this.#headers.set(name, value);
        } else {
          this.#preparedHeaders ??= {};
          this.#preparedHeaders[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options?.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    status = (status) => {
      this.#isFresh = false;
      this.#status = status;
    };
    set = (key, value) => {
      this._var ??= {};
      this._var[key] = value;
    };
    get = (key) => {
      return this._var ? this._var[key] : void 0;
    };
    get var() {
      return { ...this._var };
    }
    newResponse = (data, arg, headers) => {
      if (this.#isFresh && !headers && !arg && this.#status === 200) {
        return new Response(data, {
          headers: this.#preparedHeaders
        });
      }
      if (arg && typeof arg !== "number") {
        const header = new Headers(arg.headers);
        if (this.#headers) {
          this.#headers.forEach((v, k) => {
            header.set(k, v);
          });
        }
        const headers2 = setHeaders(header, this.#preparedHeaders);
        return new Response(data, {
          headers: headers2,
          status: arg.status ?? this.#status
        });
      }
      const status = typeof arg === "number" ? arg : this.#status;
      this.#preparedHeaders ??= {};
      this.#headers ??= new Headers();
      setHeaders(this.#headers, this.#preparedHeaders);
      if (this.#res) {
        this.#res.headers.forEach((v, k) => {
          if (k === "set-cookie") {
            this.#headers?.append(k, v);
          } else {
            this.#headers?.set(k, v);
          }
        });
        setHeaders(this.#headers, this.#preparedHeaders);
      }
      headers ??= {};
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          this.#headers.set(k, v);
        } else {
          this.#headers.delete(k);
          for (const v2 of v) {
            this.#headers.append(k, v2);
          }
        }
      }
      return new Response(data, {
        status,
        headers: this.#headers
      });
    };
    body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    text = (text, arg, headers) => {
      if (!this.#preparedHeaders) {
        if (this.#isFresh && !headers && !arg) {
          return new Response(text);
        }
        this.#preparedHeaders = {};
      }
      this.#preparedHeaders["content-type"] = TEXT_PLAIN;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      this.#preparedHeaders ??= {};
      this.#preparedHeaders["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    html = (html, arg, headers) => {
      this.#preparedHeaders ??= {};
      this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {})).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status = 302) => {
      this.#headers ??= new Headers();
      this.#headers.set("Location", location);
      return this.newResponse(null, status);
    };
    notFound = () => {
      return this.notFoundHandler(this);
    };
  };

  // node_modules/hono/dist/compose.js
  var compose = (middleware, onError, onNotFound) => {
    return (context, next) => {
      let index = -1;
      return dispatch(0);
      async function dispatch(i) {
        if (i <= index) {
          throw new Error("next() called multiple times");
        }
        index = i;
        let res;
        let isError = false;
        let handler;
        if (middleware[i]) {
          handler = middleware[i][0][0];
          if (context instanceof Context) {
            context.req.routeIndex = i;
          }
        } else {
          handler = i === middleware.length && next || void 0;
        }
        if (!handler) {
          if (context instanceof Context && context.finalized === false && onNotFound) {
            res = await onNotFound(context);
          }
        } else {
          try {
            res = await handler(context, () => {
              return dispatch(i + 1);
            });
          } catch (err) {
            if (err instanceof Error && context instanceof Context && onError) {
              context.error = err;
              res = await onError(err, context);
              isError = true;
            } else {
              throw err;
            }
          }
        }
        if (res && (context.finalized === false || isError)) {
          context.res = res;
        }
        return context;
      }
    };
  };

  // node_modules/hono/dist/http-exception.js
  var HTTPException = class extends Error {
    res;
    status;
    constructor(status = 500, options) {
      super(options?.message, { cause: options?.cause });
      this.res = options?.res;
      this.status = status;
    }
    getResponse() {
      if (this.res) {
        return this.res;
      }
      return new Response(this.message, {
        status: this.status
      });
    }
  };

  // node_modules/hono/dist/utils/body.js
  var parseBody = async (request, options = { all: false }) => {
    const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
    const contentType = headers.get("Content-Type");
    if (isFormDataContent(contentType)) {
      return parseFormData(request, options);
    }
    return {};
  };
  function isFormDataContent(contentType) {
    if (contentType === null) {
      return false;
    }
    return contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded");
  }
  async function parseFormData(request, options) {
    const formData = await request.formData();
    if (formData) {
      return convertFormDataToBodyData(formData, options);
    }
    return {};
  }
  function convertFormDataToBodyData(formData, options) {
    const form = {};
    formData.forEach((value, key) => {
      const shouldParseAllValues = options.all || key.endsWith("[]");
      if (!shouldParseAllValues) {
        form[key] = value;
      } else {
        handleParsingAllValues(form, key, value);
      }
    });
    return form;
  }
  var handleParsingAllValues = (form, key, value) => {
    if (form[key] && isArrayField(form[key])) {
      appendToExistingArray(form[key], value);
    } else if (form[key]) {
      convertToNewArray(form, key, value);
    } else {
      form[key] = value;
    }
  };
  function isArrayField(field) {
    return Array.isArray(field);
  }
  var appendToExistingArray = (arr, value) => {
    arr.push(value);
  };
  var convertToNewArray = (form, key, value) => {
    form[key] = [form[key], value];
  };

  // node_modules/hono/dist/utils/url.js
  var splitPath = (path) => {
    const paths = path.split("/");
    if (paths[0] === "") {
      paths.shift();
    }
    return paths;
  };
  var splitRoutingPath = (routePath) => {
    const { groups, path } = extractGroupsFromPath(routePath);
    const paths = splitPath(path);
    return replaceGroupMarks(paths, groups);
  };
  var extractGroupsFromPath = (path) => {
    const groups = [];
    path = path.replace(/\{[^}]+\}/g, (match, index) => {
      const mark = `@${index}`;
      groups.push([mark, match]);
      return mark;
    });
    return { groups, path };
  };
  var replaceGroupMarks = (paths, groups) => {
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = paths.length - 1; j >= 0; j--) {
        if (paths[j].includes(mark)) {
          paths[j] = paths[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    return paths;
  };
  var patternCache = {};
  var getPattern = (label) => {
    if (label === "*") {
      return "*";
    }
    const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (match) {
      if (!patternCache[label]) {
        if (match[2]) {
          patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
        } else {
          patternCache[label] = [label, match[1], true];
        }
      }
      return patternCache[label];
    }
    return null;
  };
  var getPath = (request) => {
    const url = request.url;
    const queryIndex = url.indexOf("?", 8);
    return url.slice(url.indexOf("/", 8), queryIndex === -1 ? void 0 : queryIndex);
  };
  var getQueryStrings = (url) => {
    const queryIndex = url.indexOf("?", 8);
    return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
  };
  var getPathNoStrict = (request) => {
    const result = getPath(request);
    return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
  };
  var mergePath = (...paths) => {
    let p = "";
    let endsWithSlash = false;
    for (let path of paths) {
      if (p[p.length - 1] === "/") {
        p = p.slice(0, -1);
        endsWithSlash = true;
      }
      if (path[0] !== "/") {
        path = `/${path}`;
      }
      if (path === "/" && endsWithSlash) {
        p = `${p}/`;
      } else if (path !== "/") {
        p = `${p}${path}`;
      }
      if (path === "/" && p === "") {
        p = "/";
      }
    }
    return p;
  };
  var checkOptionalParameter = (path) => {
    if (!path.match(/\:.+\?$/)) {
      return null;
    }
    const segments = path.split("/");
    const results = [];
    let basePath = "";
    segments.forEach((segment) => {
      if (segment !== "" && !/\:/.test(segment)) {
        basePath += "/" + segment;
      } else if (/\:/.test(segment)) {
        if (/\?/.test(segment)) {
          if (results.length === 0 && basePath === "") {
            results.push("/");
          } else {
            results.push(basePath);
          }
          const optionalSegment = segment.replace("?", "");
          basePath += "/" + optionalSegment;
          results.push(basePath);
        } else {
          basePath += "/" + segment;
        }
      }
    });
    return results.filter((v, i, a) => a.indexOf(v) === i);
  };
  var _decodeURI = (value) => {
    if (!/[%+]/.test(value)) {
      return value;
    }
    if (value.indexOf("+") !== -1) {
      value = value.replace(/\+/g, " ");
    }
    return /%/.test(value) ? decodeURIComponent_(value) : value;
  };
  var _getQueryParam = (url, key, multiple) => {
    let encoded;
    if (!multiple && key && !/[%+]/.test(key)) {
      let keyIndex2 = url.indexOf(`?${key}`, 8);
      if (keyIndex2 === -1) {
        keyIndex2 = url.indexOf(`&${key}`, 8);
      }
      while (keyIndex2 !== -1) {
        const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
        if (trailingKeyCode === 61) {
          const valueIndex = keyIndex2 + key.length + 2;
          const endIndex = url.indexOf("&", valueIndex);
          return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
        } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
          return "";
        }
        keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
      }
      encoded = /[%+]/.test(url);
      if (!encoded) {
        return void 0;
      }
    }
    const results = {};
    encoded ??= /[%+]/.test(url);
    let keyIndex = url.indexOf("?", 8);
    while (keyIndex !== -1) {
      const nextKeyIndex = url.indexOf("&", keyIndex + 1);
      let valueIndex = url.indexOf("=", keyIndex);
      if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
        valueIndex = -1;
      }
      let name = url.slice(
        keyIndex + 1,
        valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
      );
      if (encoded) {
        name = _decodeURI(name);
      }
      keyIndex = nextKeyIndex;
      if (name === "") {
        continue;
      }
      let value;
      if (valueIndex === -1) {
        value = "";
      } else {
        value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
        if (encoded) {
          value = _decodeURI(value);
        }
      }
      if (multiple) {
        if (!(results[name] && Array.isArray(results[name]))) {
          results[name] = [];
        }
        ;
        results[name].push(value);
      } else {
        results[name] ??= value;
      }
    }
    return key ? results[key] : results;
  };
  var getQueryParam = _getQueryParam;
  var getQueryParams = (url, key) => {
    return _getQueryParam(url, key, true);
  };
  var decodeURIComponent_ = decodeURIComponent;

  // node_modules/hono/dist/request.js
  var HonoRequest = class {
    raw;
    #validatedData;
    #matchResult;
    routeIndex = 0;
    path;
    bodyCache = {};
    constructor(request, path = "/", matchResult = [[]]) {
      this.raw = request;
      this.path = path;
      this.#matchResult = matchResult;
      this.#validatedData = {};
    }
    param(key) {
      return key ? this.getDecodedParam(key) : this.getAllDecodedParams();
    }
    getDecodedParam(key) {
      const paramKey = this.#matchResult[0][this.routeIndex][1][key];
      const param = this.getParamValue(paramKey);
      return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : void 0;
    }
    getAllDecodedParams() {
      const decoded = {};
      const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
      for (const key of keys) {
        const value = this.getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
        if (value && typeof value === "string") {
          decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
        }
      }
      return decoded;
    }
    getParamValue(paramKey) {
      return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
    }
    query(key) {
      return getQueryParam(this.url, key);
    }
    queries(key) {
      return getQueryParams(this.url, key);
    }
    header(name) {
      if (name) {
        return this.raw.headers.get(name.toLowerCase()) ?? void 0;
      }
      const headerData = {};
      this.raw.headers.forEach((value, key) => {
        headerData[key] = value;
      });
      return headerData;
    }
    async parseBody(options) {
      if (this.bodyCache.parsedBody) {
        return this.bodyCache.parsedBody;
      }
      const parsedBody = await parseBody(this, options);
      this.bodyCache.parsedBody = parsedBody;
      return parsedBody;
    }
    cachedBody = (key) => {
      const { bodyCache, raw: raw2 } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody) {
        return cachedBody;
      }
      if (!bodyCache[key]) {
        for (const keyOfBodyCache of Object.keys(bodyCache)) {
          if (keyOfBodyCache === "parsedBody") {
            continue;
          }
          return (async () => {
            let body = await bodyCache[keyOfBodyCache];
            if (keyOfBodyCache === "json") {
              body = JSON.stringify(body);
            }
            return await new Response(body)[key]();
          })();
        }
      }
      return bodyCache[key] = raw2[key]();
    };
    json() {
      return this.cachedBody("json");
    }
    text() {
      return this.cachedBody("text");
    }
    arrayBuffer() {
      return this.cachedBody("arrayBuffer");
    }
    blob() {
      return this.cachedBody("blob");
    }
    formData() {
      return this.cachedBody("formData");
    }
    addValidatedData(target, data) {
      this.#validatedData[target] = data;
    }
    valid(target) {
      return this.#validatedData[target];
    }
    get url() {
      return this.raw.url;
    }
    get method() {
      return this.raw.method;
    }
    get matchedRoutes() {
      return this.#matchResult[0].map(([[, route]]) => route);
    }
    get routePath() {
      return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
    }
  };

  // node_modules/hono/dist/router.js
  var METHOD_NAME_ALL = "ALL";
  var METHOD_NAME_ALL_LOWERCASE = "all";
  var METHODS = ["get", "post", "put", "delete", "options", "patch"];
  var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
  var UnsupportedPathError = class extends Error {
  };

  // node_modules/hono/dist/hono-base.js
  var COMPOSED_HANDLER = Symbol("composedHandler");
  function defineDynamicClass() {
    return class {
    };
  }
  var notFoundHandler = (c) => {
    return c.text("404 Not Found", 404);
  };
  var errorHandler = (err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    console.error(err);
    return c.text("Internal Server Error", 500);
  };
  var Hono = class extends defineDynamicClass() {
    router;
    getPath;
    _basePath = "/";
    #path = "/";
    routes = [];
    constructor(options = {}) {
      super();
      const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
      allMethods.forEach((method) => {
        this[method] = (args1, ...args) => {
          if (typeof args1 === "string") {
            this.#path = args1;
          } else {
            this.addRoute(method, this.#path, args1);
          }
          args.forEach((handler) => {
            if (typeof handler !== "string") {
              this.addRoute(method, this.#path, handler);
            }
          });
          return this;
        };
      });
      this.on = (method, path, ...handlers) => {
        if (!method) {
          return this;
        }
        for (const p of [path].flat()) {
          this.#path = p;
          for (const m of [method].flat()) {
            handlers.map((handler) => {
              this.addRoute(m.toUpperCase(), this.#path, handler);
            });
          }
        }
        return this;
      };
      this.use = (arg1, ...handlers) => {
        if (typeof arg1 === "string") {
          this.#path = arg1;
        } else {
          this.#path = "*";
          handlers.unshift(arg1);
        }
        handlers.forEach((handler) => {
          this.addRoute(METHOD_NAME_ALL, this.#path, handler);
        });
        return this;
      };
      const strict = options.strict ?? true;
      delete options.strict;
      Object.assign(this, options);
      this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
    }
    clone() {
      const clone = new Hono({
        router: this.router,
        getPath: this.getPath
      });
      clone.routes = this.routes;
      return clone;
    }
    notFoundHandler = notFoundHandler;
    errorHandler = errorHandler;
    route(path, app2) {
      const subApp = this.basePath(path);
      if (!app2) {
        return subApp;
      }
      app2.routes.map((r) => {
        let handler;
        if (app2.errorHandler === errorHandler) {
          handler = r.handler;
        } else {
          handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
          handler[COMPOSED_HANDLER] = r.handler;
        }
        subApp.addRoute(r.method, r.path, handler);
      });
      return this;
    }
    basePath(path) {
      const subApp = this.clone();
      subApp._basePath = mergePath(this._basePath, path);
      return subApp;
    }
    onError = (handler) => {
      this.errorHandler = handler;
      return this;
    };
    notFound = (handler) => {
      this.notFoundHandler = handler;
      return this;
    };
    mount(path, applicationHandler, optionHandler) {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      const handler = async (c, next) => {
        let executionContext = void 0;
        try {
          executionContext = c.executionCtx;
        } catch {
        }
        const options = optionHandler ? optionHandler(c) : [c.env, executionContext];
        const optionsArray = Array.isArray(options) ? options : [options];
        const queryStrings = getQueryStrings(c.req.url);
        const res = await applicationHandler(
          new Request(
            new URL((c.req.path.slice(pathPrefixLength) || "/") + queryStrings, c.req.url),
            c.req.raw
          ),
          ...optionsArray
        );
        if (res) {
          return res;
        }
        await next();
      };
      this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
      return this;
    }
    addRoute(method, path, handler) {
      method = method.toUpperCase();
      path = mergePath(this._basePath, path);
      const r = { path, method, handler };
      this.router.add(method, path, [handler, r]);
      this.routes.push(r);
    }
    matchRoute(method, path) {
      return this.router.match(method, path);
    }
    handleError(err, c) {
      if (err instanceof Error) {
        return this.errorHandler(err, c);
      }
      throw err;
    }
    dispatch(request, executionCtx, env, method) {
      if (method === "HEAD") {
        return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
      }
      const path = this.getPath(request, { env });
      const matchResult = this.matchRoute(method, path);
      const c = new Context(new HonoRequest(request, path, matchResult), {
        env,
        executionCtx,
        notFoundHandler: this.notFoundHandler
      });
      if (matchResult[0].length === 1) {
        let res;
        try {
          res = matchResult[0][0][0][0](c, async () => {
            c.res = await this.notFoundHandler(c);
          });
        } catch (err) {
          return this.handleError(err, c);
        }
        return res instanceof Promise ? res.then(
          (resolved) => resolved || (c.finalized ? c.res : this.notFoundHandler(c))
        ).catch((err) => this.handleError(err, c)) : res;
      }
      const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
      return (async () => {
        try {
          const context = await composed(c);
          if (!context.finalized) {
            throw new Error(
              "Context is not finalized. You may forget returning Response object or `await next()`"
            );
          }
          return context.res;
        } catch (err) {
          return this.handleError(err, c);
        }
      })();
    }
    fetch = (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    };
    request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== void 0) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
      });
    };
  };

  // node_modules/hono/dist/router/reg-exp-router/node.js
  var LABEL_REG_EXP_STR = "[^/]+";
  var ONLY_WILDCARD_REG_EXP_STR = ".*";
  var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
  var PATH_ERROR = Symbol();
  var regExpMetaChars = new Set(".\\+*[^]$()");
  function compareKey(a, b) {
    if (a.length === 1) {
      return b.length === 1 ? a < b ? -1 : 1 : -1;
    }
    if (b.length === 1) {
      return 1;
    }
    if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
      return 1;
    } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
      return -1;
    }
    if (a === LABEL_REG_EXP_STR) {
      return 1;
    } else if (b === LABEL_REG_EXP_STR) {
      return -1;
    }
    return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
  }
  var Node = class {
    index;
    varIndex;
    children = /* @__PURE__ */ Object.create(null);
    insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
      if (tokens.length === 0) {
        if (this.index !== void 0) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        this.index = index;
        return;
      }
      const [token, ...restTokens] = tokens;
      const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let node;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        node = this.children[regexpStr];
        if (!node) {
          if (Object.keys(this.children).some(
            (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
          )) {
            throw PATH_ERROR;
          }
          if (pathErrorCheckOnly) {
            return;
          }
          node = this.children[regexpStr] = new Node();
          if (name !== "") {
            node.varIndex = context.varIndex++;
          }
        }
        if (!pathErrorCheckOnly && name !== "") {
          paramMap.push([name, node.varIndex]);
        }
      } else {
        node = this.children[token];
        if (!node) {
          if (Object.keys(this.children).some(
            (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
          )) {
            throw PATH_ERROR;
          }
          if (pathErrorCheckOnly) {
            return;
          }
          node = this.children[token] = new Node();
        }
      }
      node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
    }
    buildRegExpStr() {
      const childKeys = Object.keys(this.children).sort(compareKey);
      const strList = childKeys.map((k) => {
        const c = this.children[k];
        return (typeof c.varIndex === "number" ? `(${k})@${c.varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
      });
      if (typeof this.index === "number") {
        strList.unshift(`#${this.index}`);
      }
      if (strList.length === 0) {
        return "";
      }
      if (strList.length === 1) {
        return strList[0];
      }
      return "(?:" + strList.join("|") + ")";
    }
  };

  // node_modules/hono/dist/router/reg-exp-router/trie.js
  var Trie = class {
    context = { varIndex: 0 };
    root = new Node();
    insert(path, index, pathErrorCheckOnly) {
      const paramAssoc = [];
      const groups = [];
      for (let i = 0; ; ) {
        let replaced = false;
        path = path.replace(/\{[^}]+\}/g, (m) => {
          const mark = `@\\${i}`;
          groups[i] = [mark, m];
          i++;
          replaced = true;
          return mark;
        });
        if (!replaced) {
          break;
        }
      }
      const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = tokens.length - 1; j >= 0; j--) {
          if (tokens[j].indexOf(mark) !== -1) {
            tokens[j] = tokens[j].replace(mark, groups[i][1]);
            break;
          }
        }
      }
      this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
      return paramAssoc;
    }
    buildRegExp() {
      let regexp = this.root.buildRegExpStr();
      if (regexp === "") {
        return [/^$/, [], []];
      }
      let captureIndex = 0;
      const indexReplacementMap = [];
      const paramReplacementMap = [];
      regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
        if (typeof handlerIndex !== "undefined") {
          indexReplacementMap[++captureIndex] = Number(handlerIndex);
          return "$()";
        }
        if (typeof paramIndex !== "undefined") {
          paramReplacementMap[Number(paramIndex)] = ++captureIndex;
          return "";
        }
        return "";
      });
      return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
    }
  };

  // node_modules/hono/dist/router/reg-exp-router/router.js
  var emptyParam = [];
  var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
  var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
  function buildWildcardRegExp(path) {
    return wildcardRegExpCache[path] ??= new RegExp(
      path === "*" ? "" : `^${path.replace(
        /\/\*$|([.\\+*[^\]$()])/g,
        (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
      )}$`
    );
  }
  function clearWildcardRegExpCache() {
    wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
  }
  function buildMatcherFromPreprocessedRoutes(routes) {
    const trie = new Trie();
    const handlerData = [];
    if (routes.length === 0) {
      return nullMatcher;
    }
    const routesWithStaticPathFlag = routes.map(
      (route) => [!/\*|\/:/.test(route[0]), ...route]
    ).sort(
      ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
    );
    const staticMap = /* @__PURE__ */ Object.create(null);
    for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
      const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
      if (pathErrorCheckOnly) {
        staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
      } else {
        j++;
      }
      let paramAssoc;
      try {
        paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
      } catch (e) {
        throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
      }
      if (pathErrorCheckOnly) {
        continue;
      }
      handlerData[j] = handlers.map(([h, paramCount]) => {
        const paramIndexMap = /* @__PURE__ */ Object.create(null);
        paramCount -= 1;
        for (; paramCount >= 0; paramCount--) {
          const [key, value] = paramAssoc[paramCount];
          paramIndexMap[key] = value;
        }
        return [h, paramIndexMap];
      });
    }
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (let i = 0, len = handlerData.length; i < len; i++) {
      for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
        const map = handlerData[i][j]?.[1];
        if (!map) {
          continue;
        }
        const keys = Object.keys(map);
        for (let k = 0, len3 = keys.length; k < len3; k++) {
          map[keys[k]] = paramReplacementMap[map[keys[k]]];
        }
      }
    }
    const handlerMap = [];
    for (const i in indexReplacementMap) {
      handlerMap[i] = handlerData[indexReplacementMap[i]];
    }
    return [regexp, handlerMap, staticMap];
  }
  function findMiddleware(middleware, path) {
    if (!middleware) {
      return void 0;
    }
    for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
      if (buildWildcardRegExp(k).test(path)) {
        return [...middleware[k]];
      }
    }
    return void 0;
  }
  var RegExpRouter = class {
    name = "RegExpRouter";
    middleware;
    routes;
    constructor() {
      this.middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
      this.routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    }
    add(method, path, handler) {
      const { middleware, routes } = this;
      if (!middleware || !routes) {
        throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
      }
      if (!middleware[method]) {
        ;
        [middleware, routes].forEach((handlerMap) => {
          handlerMap[method] = /* @__PURE__ */ Object.create(null);
          Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
            handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          });
        });
      }
      if (path === "/*") {
        path = "*";
      }
      const paramCount = (path.match(/\/:/g) || []).length;
      if (/\*$/.test(path)) {
        const re = buildWildcardRegExp(path);
        if (method === METHOD_NAME_ALL) {
          Object.keys(middleware).forEach((m) => {
            middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
          });
        } else {
          middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
        Object.keys(middleware).forEach((m) => {
          if (method === METHOD_NAME_ALL || method === m) {
            Object.keys(middleware[m]).forEach((p) => {
              re.test(p) && middleware[m][p].push([handler, paramCount]);
            });
          }
        });
        Object.keys(routes).forEach((m) => {
          if (method === METHOD_NAME_ALL || method === m) {
            Object.keys(routes[m]).forEach(
              (p) => re.test(p) && routes[m][p].push([handler, paramCount])
            );
          }
        });
        return;
      }
      const paths = checkOptionalParameter(path) || [path];
      for (let i = 0, len = paths.length; i < len; i++) {
        const path2 = paths[i];
        Object.keys(routes).forEach((m) => {
          if (method === METHOD_NAME_ALL || method === m) {
            routes[m][path2] ||= [
              ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
            ];
            routes[m][path2].push([handler, paramCount - len + i + 1]);
          }
        });
      }
    }
    match(method, path) {
      clearWildcardRegExpCache();
      const matchers = this.buildAllMatchers();
      this.match = (method2, path2) => {
        const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
        const staticMatch = matcher[2][path2];
        if (staticMatch) {
          return staticMatch;
        }
        const match = path2.match(matcher[0]);
        if (!match) {
          return [[], emptyParam];
        }
        const index = match.indexOf("", 1);
        return [matcher[1][index], match];
      };
      return this.match(method, path);
    }
    buildAllMatchers() {
      const matchers = /* @__PURE__ */ Object.create(null);
      [...Object.keys(this.routes), ...Object.keys(this.middleware)].forEach((method) => {
        matchers[method] ||= this.buildMatcher(method);
      });
      this.middleware = this.routes = void 0;
      return matchers;
    }
    buildMatcher(method) {
      const routes = [];
      let hasOwnRoute = method === METHOD_NAME_ALL;
      [this.middleware, this.routes].forEach((r) => {
        const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
        if (ownRoute.length !== 0) {
          hasOwnRoute ||= true;
          routes.push(...ownRoute);
        } else if (method !== METHOD_NAME_ALL) {
          routes.push(
            ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
          );
        }
      });
      if (!hasOwnRoute) {
        return null;
      } else {
        return buildMatcherFromPreprocessedRoutes(routes);
      }
    }
  };

  // node_modules/hono/dist/router/smart-router/router.js
  var SmartRouter = class {
    name = "SmartRouter";
    routers = [];
    routes = [];
    constructor(init) {
      Object.assign(this, init);
    }
    add(method, path, handler) {
      if (!this.routes) {
        throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
      }
      this.routes.push([method, path, handler]);
    }
    match(method, path) {
      if (!this.routes) {
        throw new Error("Fatal error");
      }
      const { routers, routes } = this;
      const len = routers.length;
      let i = 0;
      let res;
      for (; i < len; i++) {
        const router = routers[i];
        try {
          routes.forEach((args) => {
            router.add(...args);
          });
          res = router.match(method, path);
        } catch (e) {
          if (e instanceof UnsupportedPathError) {
            continue;
          }
          throw e;
        }
        this.match = router.match.bind(router);
        this.routers = [router];
        this.routes = void 0;
        break;
      }
      if (i === len) {
        throw new Error("Fatal error");
      }
      this.name = `SmartRouter + ${this.activeRouter.name}`;
      return res;
    }
    get activeRouter() {
      if (this.routes || this.routers.length !== 1) {
        throw new Error("No active router has been determined yet.");
      }
      return this.routers[0];
    }
  };

  // node_modules/hono/dist/router/trie-router/node.js
  var Node2 = class {
    methods;
    children;
    patterns;
    order = 0;
    name;
    params = /* @__PURE__ */ Object.create(null);
    constructor(method, handler, children) {
      this.children = children || /* @__PURE__ */ Object.create(null);
      this.methods = [];
      this.name = "";
      if (method && handler) {
        const m = /* @__PURE__ */ Object.create(null);
        m[method] = { handler, possibleKeys: [], score: 0, name: this.name };
        this.methods = [m];
      }
      this.patterns = [];
    }
    insert(method, path, handler) {
      this.name = `${method} ${path}`;
      this.order = ++this.order;
      let curNode = this;
      const parts = splitRoutingPath(path);
      const possibleKeys = [];
      for (let i = 0, len = parts.length; i < len; i++) {
        const p = parts[i];
        if (Object.keys(curNode.children).includes(p)) {
          curNode = curNode.children[p];
          const pattern2 = getPattern(p);
          if (pattern2) {
            possibleKeys.push(pattern2[1]);
          }
          continue;
        }
        curNode.children[p] = new Node2();
        const pattern = getPattern(p);
        if (pattern) {
          curNode.patterns.push(pattern);
          possibleKeys.push(pattern[1]);
        }
        curNode = curNode.children[p];
      }
      if (!curNode.methods.length) {
        curNode.methods = [];
      }
      const m = /* @__PURE__ */ Object.create(null);
      const handlerSet = {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        name: this.name,
        score: this.order
      };
      m[method] = handlerSet;
      curNode.methods.push(m);
      return curNode;
    }
    gHSets(node, method, nodeParams, params) {
      const handlerSets = [];
      for (let i = 0, len = node.methods.length; i < len; i++) {
        const m = node.methods[i];
        const handlerSet = m[method] || m[METHOD_NAME_ALL];
        const processedSet = /* @__PURE__ */ Object.create(null);
        if (handlerSet !== void 0) {
          handlerSet.params = /* @__PURE__ */ Object.create(null);
          handlerSet.possibleKeys.forEach((key) => {
            const processed = processedSet[handlerSet.name];
            handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
            processedSet[handlerSet.name] = true;
          });
          handlerSets.push(handlerSet);
        }
      }
      return handlerSets;
    }
    search(method, path) {
      const handlerSets = [];
      this.params = /* @__PURE__ */ Object.create(null);
      const curNode = this;
      let curNodes = [curNode];
      const parts = splitPath(path);
      for (let i = 0, len = parts.length; i < len; i++) {
        const part = parts[i];
        const isLast = i === len - 1;
        const tempNodes = [];
        for (let j = 0, len2 = curNodes.length; j < len2; j++) {
          const node = curNodes[j];
          const nextNode = node.children[part];
          if (nextNode) {
            nextNode.params = node.params;
            if (isLast === true) {
              if (nextNode.children["*"]) {
                handlerSets.push(
                  ...this.gHSets(nextNode.children["*"], method, node.params, /* @__PURE__ */ Object.create(null))
                );
              }
              handlerSets.push(...this.gHSets(nextNode, method, node.params, /* @__PURE__ */ Object.create(null)));
            } else {
              tempNodes.push(nextNode);
            }
          }
          for (let k = 0, len3 = node.patterns.length; k < len3; k++) {
            const pattern = node.patterns[k];
            const params = { ...node.params };
            if (pattern === "*") {
              const astNode = node.children["*"];
              if (astNode) {
                handlerSets.push(...this.gHSets(astNode, method, node.params, /* @__PURE__ */ Object.create(null)));
                tempNodes.push(astNode);
              }
              continue;
            }
            if (part === "") {
              continue;
            }
            const [key, name, matcher] = pattern;
            const child = node.children[key];
            const restPathString = parts.slice(i).join("/");
            if (matcher instanceof RegExp && matcher.test(restPathString)) {
              params[name] = restPathString;
              handlerSets.push(...this.gHSets(child, method, node.params, params));
              continue;
            }
            if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
              if (typeof key === "string") {
                params[name] = part;
                if (isLast === true) {
                  handlerSets.push(...this.gHSets(child, method, params, node.params));
                  if (child.children["*"]) {
                    handlerSets.push(...this.gHSets(child.children["*"], method, params, node.params));
                  }
                } else {
                  child.params = params;
                  tempNodes.push(child);
                }
              }
            }
          }
        }
        curNodes = tempNodes;
      }
      const results = handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
      return [results.map(({ handler, params }) => [handler, params])];
    }
  };

  // node_modules/hono/dist/router/trie-router/router.js
  var TrieRouter = class {
    name = "TrieRouter";
    node;
    constructor() {
      this.node = new Node2();
    }
    add(method, path, handler) {
      const results = checkOptionalParameter(path);
      if (results) {
        for (const p of results) {
          this.node.insert(method, p, handler);
        }
        return;
      }
      this.node.insert(method, path, handler);
    }
    match(method, path) {
      return this.node.search(method, path);
    }
  };

  // node_modules/hono/dist/hono.js
  var Hono2 = class extends Hono {
    constructor(options = {}) {
      super(options);
      this.router = options.router ?? new SmartRouter({
        routers: [new RegExpRouter(), new TrieRouter()]
      });
    }
  };

  // node_modules/hono/dist/jsx/constants.js
  var DOM_RENDERER = Symbol("RENDERER");
  var DOM_ERROR_HANDLER = Symbol("ERROR_HANDLER");
  var DOM_STASH = Symbol("STASH");
  var DOM_INTERNAL_TAG = Symbol("INTERNAL");

  // node_modules/hono/dist/jsx/utils.js
  var normalizeIntrinsicElementProps = (props) => {
    if (props && "className" in props) {
      props["class"] = props["className"];
      delete props["className"];
    }
  };
  var styleObjectForEach = (style, fn) => {
    for (const [k, v] of Object.entries(style)) {
      fn(
        k[0] === "-" ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
        v == null ? null : typeof v === "number" ? v + "px" : v
      );
    }
  };

  // node_modules/hono/dist/jsx/dom/jsx-dev-runtime.js
  var JSXNodeCompatPrototype = {
    type: {
      get() {
        return this.tag;
      }
    },
    ref: {
      get() {
        return this.props?.ref;
      }
    }
  };
  var jsxDEV = (tag, props, key) => {
    if (typeof tag === "string") {
      normalizeIntrinsicElementProps(props);
    }
    return Object.defineProperties(
      {
        tag,
        props,
        key
      },
      JSXNodeCompatPrototype
    );
  };
  var Fragment = (props) => jsxDEV("", props, void 0);

  // node_modules/hono/dist/jsx/dom/utils.js
  var setInternalTagFlag = (fn) => {
    ;
    fn[DOM_INTERNAL_TAG] = true;
    return fn;
  };

  // node_modules/hono/dist/jsx/dom/context.js
  var createContextProviderFunction = (values) => setInternalTagFlag(({ value, children }) => {
    if (!children) {
      return void 0;
    }
    const props = {
      children: [
        {
          tag: setInternalTagFlag(() => {
            values.push(value);
          }),
          props: {}
        }
      ]
    };
    if (Array.isArray(children)) {
      props.children.push(...children.flat());
    } else {
      props.children.push(children);
    }
    props.children.push({
      tag: setInternalTagFlag(() => {
        values.pop();
      }),
      props: {}
    });
    const res = Fragment(props);
    res[DOM_ERROR_HANDLER] = (err) => {
      values.pop();
      throw err;
    };
    return res;
  });
  var createContext = (defaultValue) => {
    const values = [defaultValue];
    const context = {
      values,
      Provider: createContextProviderFunction(values)
    };
    globalContexts.push(context);
    return context;
  };

  // node_modules/hono/dist/jsx/context.js
  var globalContexts = [];
  var createContext2 = (defaultValue) => {
    const values = [defaultValue];
    const context = {
      values,
      Provider(props) {
        values.push(props.value);
        let string;
        try {
          string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
        } finally {
          values.pop();
        }
        if (string instanceof Promise) {
          return string.then(
            (resString) => raw(resString, resString.callbacks)
          );
        } else {
          return raw(string);
        }
      }
    };
    context.Provider[DOM_RENDERER] = createContextProviderFunction(values);
    globalContexts.push(context);
    return context;
  };
  var useContext = (context) => {
    return context.values.at(-1);
  };

  // node_modules/hono/dist/jsx/base.js
  var emptyTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ];
  var booleanAttributes = [
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ];
  var childrenToStringToBuffer = (children, buffer) => {
    for (let i = 0, len = children.length; i < len; i++) {
      const child = children[i];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (child instanceof JSXNode) {
        child.toStringToBuffer(buffer);
      } else if (typeof child === "number" || child.isEscaped) {
        ;
        buffer[0] += child;
      } else if (child instanceof Promise) {
        buffer.unshift("", child);
      } else {
        childrenToStringToBuffer(child, buffer);
      }
    }
  };
  var JSXNode = class {
    tag;
    props;
    key;
    children;
    isEscaped = true;
    localContexts;
    constructor(tag, props, children) {
      this.tag = tag;
      this.props = props;
      this.children = children;
    }
    get type() {
      return this.tag;
    }
    get ref() {
      return this.props.ref || null;
    }
    toString() {
      const buffer = [""];
      this.localContexts?.forEach(([context, value]) => {
        context.values.push(value);
      });
      try {
        this.toStringToBuffer(buffer);
      } finally {
        this.localContexts?.forEach(([context]) => {
          context.values.pop();
        });
      }
      return buffer.length === 1 ? buffer[0] : stringBufferToString(buffer);
    }
    toStringToBuffer(buffer) {
      const tag = this.tag;
      const props = this.props;
      let { children } = this;
      buffer[0] += `<${tag}`;
      const propsKeys = Object.keys(props || {});
      for (let i = 0, len = propsKeys.length; i < len; i++) {
        const key = propsKeys[i];
        const v = props[key];
        if (key === "children") {
        } else if (key === "style" && typeof v === "object") {
          let styleStr = "";
          styleObjectForEach(v, (property, value) => {
            if (value != null) {
              styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
            }
          });
          buffer[0] += ' style="';
          escapeToBuffer(styleStr, buffer);
          buffer[0] += '"';
        } else if (typeof v === "string") {
          buffer[0] += ` ${key}="`;
          escapeToBuffer(v, buffer);
          buffer[0] += '"';
        } else if (v === null || v === void 0) {
        } else if (typeof v === "number" || v.isEscaped) {
          buffer[0] += ` ${key}="${v}"`;
        } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
          if (v) {
            buffer[0] += ` ${key}=""`;
          }
        } else if (key === "dangerouslySetInnerHTML") {
          if (children.length > 0) {
            throw "Can only set one of `children` or `props.dangerouslySetInnerHTML`.";
          }
          children = [raw(v.__html)];
        } else if (v instanceof Promise) {
          buffer[0] += ` ${key}="`;
          buffer.unshift('"', v);
        } else if (typeof v === "function") {
          if (!key.startsWith("on")) {
            throw `Invalid prop '${key}' of type 'function' supplied to '${tag}'.`;
          }
        } else {
          buffer[0] += ` ${key}="`;
          escapeToBuffer(v.toString(), buffer);
          buffer[0] += '"';
        }
      }
      if (emptyTags.includes(tag) && children.length === 0) {
        buffer[0] += "/>";
        return;
      }
      buffer[0] += ">";
      childrenToStringToBuffer(children, buffer);
      buffer[0] += `</${tag}>`;
    }
  };
  var JSXFunctionNode = class extends JSXNode {
    toStringToBuffer(buffer) {
      const { children } = this;
      const res = this.tag.call(null, {
        ...this.props,
        children: children.length <= 1 ? children[0] : children
      });
      if (res instanceof Promise) {
        if (globalContexts.length === 0) {
          buffer.unshift("", res);
        } else {
          const currentContexts = globalContexts.map((c) => [c, c.values.at(-1)]);
          buffer.unshift(
            "",
            res.then((childRes) => {
              if (childRes instanceof JSXNode) {
                childRes.localContexts = currentContexts;
              }
              return childRes;
            })
          );
        }
      } else if (res instanceof JSXNode) {
        res.toStringToBuffer(buffer);
      } else if (typeof res === "number" || res.isEscaped) {
        buffer[0] += res;
      } else {
        escapeToBuffer(res, buffer);
      }
    }
  };
  var JSXFragmentNode = class extends JSXNode {
    toStringToBuffer(buffer) {
      childrenToStringToBuffer(this.children, buffer);
    }
  };
  var jsx = (tag, props, ...children) => {
    props ??= {};
    if (children.length) {
      props.children = children.length === 1 ? children[0] : children;
    }
    const key = props.key;
    delete props["key"];
    const node = jsxFn(tag, props, children);
    node.key = key;
    return node;
  };
  var jsxFn = (tag, props, children) => {
    if (typeof tag === "function") {
      return new JSXFunctionNode(tag, props, children);
    } else {
      normalizeIntrinsicElementProps(props);
      return new JSXNode(tag, props, children);
    }
  };
  var shallowEqual = (a, b) => {
    if (a === b) {
      return true;
    }
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (let i = 0, len = aKeys.length; i < len; i++) {
      if (aKeys[i] === "children" && bKeys[i] === "children" && !a.children?.length && !b.children?.length) {
        continue;
      } else if (a[aKeys[i]] !== b[aKeys[i]]) {
        return false;
      }
    }
    return true;
  };
  var memo = (component, propsAreEqual = shallowEqual) => {
    let computed = void 0;
    let prevProps = void 0;
    return (props) => {
      if (prevProps && !propsAreEqual(prevProps, props)) {
        computed = void 0;
      }
      prevProps = props;
      return computed ||= component(props);
    };
  };
  var Fragment2 = ({
    children
  }) => {
    return new JSXFragmentNode(
      "",
      {
        children
      },
      Array.isArray(children) ? children : children ? [children] : []
    );
  };
  var isValidElement = (element) => {
    return !!(element && typeof element === "object" && "tag" in element && "props" in element);
  };
  var cloneElement = (element, props, ...children) => {
    return jsx(
      element.tag,
      { ...element.props, ...props },
      ...children
    );
  };

  // node_modules/hono/dist/jsx/children.js
  var toArray = (children) => Array.isArray(children) ? children : [children];
  var Children = {
    map: (children, fn) => toArray(children).map(fn),
    forEach: (children, fn) => {
      toArray(children).forEach(fn);
    },
    count: (children) => toArray(children).length,
    only: (_children) => {
      const children = toArray(_children);
      if (children.length !== 1) {
        throw new Error("Children.only() expects only one child");
      }
      return children[0];
    },
    toArray
  };

  // node_modules/hono/dist/jsx/dom/components.js
  var ErrorBoundary = ({ children, fallback, fallbackRender, onError }) => {
    const res = Fragment({ children });
    res[DOM_ERROR_HANDLER] = (err) => {
      if (err instanceof Promise) {
        throw err;
      }
      onError?.(err);
      return fallbackRender?.(err) || fallback;
    };
    return res;
  };
  var Suspense = ({
    children,
    fallback
  }) => {
    const res = Fragment({ children });
    res[DOM_ERROR_HANDLER] = (err, retry) => {
      if (!(err instanceof Promise)) {
        throw err;
      }
      err.finally(retry);
      return fallback;
    };
    return res;
  };

  // node_modules/hono/dist/jsx/components.js
  var errorBoundaryCounter = 0;
  var childrenToString = async (children) => {
    try {
      return children.flat().map((c) => c == null || typeof c === "boolean" ? "" : c.toString());
    } catch (e) {
      if (e instanceof Promise) {
        await e;
        return childrenToString(children);
      } else {
        throw e;
      }
    }
  };
  var ErrorBoundary2 = async ({ children, fallback, fallbackRender, onError }) => {
    if (!children) {
      return raw("");
    }
    if (!Array.isArray(children)) {
      children = [children];
    }
    let fallbackStr;
    const fallbackRes = (error) => {
      onError?.(error);
      return (fallbackStr || fallbackRender?.(error) || "").toString();
    };
    let resArray = [];
    try {
      resArray = children.map(
        (c) => c == null || typeof c === "boolean" ? "" : c.toString()
      );
    } catch (e) {
      fallbackStr = await fallback?.toString();
      if (e instanceof Promise) {
        resArray = [
          e.then(() => childrenToString(children)).catch((e2) => fallbackRes(e2))
        ];
      } else {
        resArray = [fallbackRes(e)];
      }
    }
    if (resArray.some((res) => res instanceof Promise)) {
      fallbackStr ||= await fallback?.toString();
      const index = errorBoundaryCounter++;
      const replaceRe = RegExp(`(<template id="E:${index}"></template>.*?)(.*?)(<!--E:${index}-->)`);
      const caught = false;
      const catchCallback = ({ error, buffer }) => {
        if (caught) {
          return "";
        }
        const fallbackResString = fallbackRes(error);
        if (buffer) {
          buffer[0] = buffer[0].replace(replaceRe, fallbackResString);
        }
        return buffer ? "" : `<template data-hono-target="E:${index}">${fallbackResString}</template><script>
((d,c,n) => {
c=d.currentScript.previousSibling
d=d.getElementById('E:${index}')
if(!d)return
do{n=d.nextSibling;n.remove()}while(n.nodeType!=8||n.nodeValue!='E:${index}')
d.replaceWith(c.content)
})(document)
<\/script>`;
      };
      return raw(`<template id="E:${index}"></template><!--E:${index}-->`, [
        ({ phase, buffer, context }) => {
          if (phase === HtmlEscapedCallbackPhase.BeforeStream) {
            return;
          }
          return Promise.all(resArray).then(async (htmlArray) => {
            htmlArray = htmlArray.flat();
            const content = htmlArray.join("");
            let html = buffer ? "" : `<template data-hono-target="E:${index}">${content}</template><script>
((d,c) => {
c=d.currentScript.previousSibling
d=d.getElementById('E:${index}')
if(!d)return
d.parentElement.insertBefore(c.content,d.nextSibling)
})(document)
<\/script>`;
            if (htmlArray.every((html2) => !html2.callbacks?.length)) {
              if (buffer) {
                buffer[0] = buffer[0].replace(replaceRe, content);
              }
              return html;
            }
            if (buffer) {
              buffer[0] = buffer[0].replace(
                replaceRe,
                (_all, pre, _, post) => `${pre}${content}${post}`
              );
            }
            const callbacks = htmlArray.map((html2) => html2.callbacks || []).flat();
            if (phase === HtmlEscapedCallbackPhase.Stream) {
              html = await resolveCallback(
                html,
                HtmlEscapedCallbackPhase.BeforeStream,
                true,
                context
              );
            }
            let resolvedCount = 0;
            const promises = callbacks.map(
              (c) => (...args) => c(...args)?.then((content2) => {
                resolvedCount++;
                if (buffer) {
                  if (resolvedCount === callbacks.length) {
                    buffer[0] = buffer[0].replace(replaceRe, (_all, _pre, content3) => content3);
                  }
                  buffer[0] += content2;
                  return raw("", content2.callbacks);
                }
                return raw(
                  content2 + (resolvedCount !== callbacks.length ? "" : `<script>
((d,c,n) => {
d=d.getElementById('E:${index}')
if(!d)return
n=d.nextSibling
while(n.nodeType!=8||n.nodeValue!='E:${index}'){n=n.nextSibling}
n.remove()
d.remove()
})(document)
<\/script>`),
                  content2.callbacks
                );
              }).catch((error) => catchCallback({ error, buffer }))
            );
            return raw(html, promises);
          }).catch((error) => catchCallback({ error, buffer }));
        }
      ]);
    } else {
      return raw(resArray.join(""));
    }
  };
  ErrorBoundary2[DOM_RENDERER] = ErrorBoundary;

  // node_modules/hono/dist/jsx/dom/render.js
  var HONO_PORTAL_ELEMENT = "_hp";
  var eventAliasMap = {
    Change: "Input",
    DoubleClick: "DblClick"
  };
  var nameSpaceMap = {
    svg: "http://www.w3.org/2000/svg",
    math: "http://www.w3.org/1998/Math/MathML"
  };
  var skipProps = /* @__PURE__ */ new Set(["children"]);
  var buildDataStack = [];
  var nameSpaceContext = void 0;
  var isNodeString = (node) => "t" in node;
  var getEventSpec = (key) => {
    const match = key.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);
    if (match) {
      const [, eventName, capture] = match;
      return [(eventAliasMap[eventName] || eventName).toLowerCase(), !!capture];
    }
    return void 0;
  };
  var applyProps = (container, attributes, oldAttributes) => {
    attributes ||= {};
    for (const [key, value] of Object.entries(attributes)) {
      if (!skipProps.has(key) && (!oldAttributes || oldAttributes[key] !== value)) {
        const eventSpec = getEventSpec(key);
        if (eventSpec) {
          if (oldAttributes) {
            container.removeEventListener(eventSpec[0], oldAttributes[key], eventSpec[1]);
          }
          if (value != null) {
            if (typeof value !== "function") {
              throw new Error(`Event handler for "${key}" is not a function`);
            }
            container.addEventListener(eventSpec[0], value, eventSpec[1]);
          }
        } else if (key === "dangerouslySetInnerHTML" && value) {
          container.innerHTML = value.__html;
        } else if (key === "ref") {
          if (typeof value === "function") {
            value(container);
          } else if (value && "current" in value) {
            value.current = container;
          }
        } else if (key === "style") {
          const style = container.style;
          if (typeof value === "string") {
            style.cssText = value;
          } else {
            style.cssText = "";
            if (value != null) {
              styleObjectForEach(value, style.setProperty.bind(style));
            }
          }
        } else {
          const nodeName = container.nodeName;
          if (key === "value") {
            if (nodeName === "INPUT" || nodeName === "TEXTAREA" || nodeName === "SELECT") {
              ;
              container.value = value === null || value === void 0 || value === false ? null : value;
              if (nodeName === "TEXTAREA") {
                container.textContent = value;
                continue;
              } else if (nodeName === "SELECT") {
                if (container.selectedIndex === -1) {
                  ;
                  container.selectedIndex = 0;
                }
                continue;
              }
            }
          } else if (key === "checked" && nodeName === "INPUT" || key === "selected" && nodeName === "OPTION") {
            ;
            container[key] = value;
          }
          if (value === null || value === void 0 || value === false) {
            container.removeAttribute(key);
          } else if (value === true) {
            container.setAttribute(key, "");
          } else if (typeof value === "string" || typeof value === "number") {
            container.setAttribute(key, value);
          } else {
            container.setAttribute(key, value.toString());
          }
        }
      }
    }
    if (oldAttributes) {
      for (const [key, value] of Object.entries(oldAttributes)) {
        if (!skipProps.has(key) && !(key in attributes)) {
          const eventSpec = getEventSpec(key);
          if (eventSpec) {
            container.removeEventListener(eventSpec[0], value, eventSpec[1]);
          } else if (key === "ref") {
            if (typeof value === "function") {
              value(null);
            } else {
              value.current = null;
            }
          } else {
            container.removeAttribute(key);
          }
        }
      }
    }
  };
  var invokeTag = (context, node) => {
    if (node.s) {
      const res = node.s;
      node.s = void 0;
      return res;
    }
    node[DOM_STASH][0] = 0;
    buildDataStack.push([context, node]);
    const func = node.tag[DOM_RENDERER] || node.tag;
    try {
      return [
        func.call(null, {
          ...func.defaultProps || {},
          ...node.props
        })
      ];
    } finally {
      buildDataStack.pop();
    }
  };
  var getNextChildren = (node, container, nextChildren, childrenToRemove, callbacks) => {
    childrenToRemove.push(...node.vR);
    if (typeof node.tag === "function") {
      node[DOM_STASH][1][STASH_EFFECT]?.forEach((data) => callbacks.push(data));
    }
    node.vC.forEach((child) => {
      if (isNodeString(child)) {
        nextChildren.push(child);
      } else {
        if (typeof child.tag === "function" || child.tag === "") {
          child.c = container;
          getNextChildren(child, container, nextChildren, childrenToRemove, callbacks);
        } else {
          nextChildren.push(child);
          childrenToRemove.push(...child.vR);
        }
      }
    });
  };
  var findInsertBefore = (node) => {
    if (!node) {
      return null;
    } else if (node.e) {
      return node.e;
    }
    if (node.vC) {
      for (let i = 0, len = node.vC.length; i < len; i++) {
        const e = findInsertBefore(node.vC[i]);
        if (e) {
          return e;
        }
      }
    }
    return findInsertBefore(node.nN);
  };
  var removeNode = (node) => {
    if (!isNodeString(node)) {
      node[DOM_STASH]?.[1][STASH_EFFECT]?.forEach((data) => data[2]?.());
      if (node.e && node.props?.ref) {
        if (typeof node.props.ref === "function") {
          node.props.ref(null);
        } else {
          node.props.ref.current = null;
        }
      }
      node.vC?.forEach(removeNode);
    }
    if (node.tag !== HONO_PORTAL_ELEMENT) {
      node.e?.remove();
    }
    if (typeof node.tag === "function") {
      updateMap.delete(node);
      fallbackUpdateFnArrayMap.delete(node);
    }
  };
  var apply = (node, container) => {
    node.c = container;
    applyNodeObject(node, container);
  };
  var applyNode = (node, container) => {
    if (isNodeString(node)) {
      container.textContent = node.t;
    } else {
      applyNodeObject(node, container);
    }
  };
  var findChildNodeIndex = (childNodes, child) => {
    if (!child) {
      return;
    }
    for (let i = 0, len = childNodes.length; i < len; i++) {
      if (childNodes[i] === child) {
        return i;
      }
    }
    return;
  };
  var applyNodeObject = (node, container) => {
    const next = [];
    const remove = [];
    const callbacks = [];
    getNextChildren(node, container, next, remove, callbacks);
    const childNodes = container.childNodes;
    let offset = findChildNodeIndex(childNodes, findInsertBefore(node.nN)) ?? findChildNodeIndex(childNodes, next.find((n) => n.e)?.e) ?? childNodes.length;
    for (let i = 0, len = next.length; i < len; i++, offset++) {
      const child = next[i];
      let el;
      if (isNodeString(child)) {
        if (child.e && child.d) {
          child.e.textContent = child.t;
        }
        child.d = false;
        el = child.e ||= document.createTextNode(child.t);
      } else {
        el = child.e ||= child.n ? document.createElementNS(child.n, child.tag) : document.createElement(child.tag);
        applyProps(el, child.props, child.pP);
        applyNode(child, el);
      }
      if (childNodes[offset] !== el && childNodes[offset - 1] !== child.e && child.tag !== HONO_PORTAL_ELEMENT) {
        container.insertBefore(el, childNodes[offset] || null);
      }
    }
    remove.forEach(removeNode);
    callbacks.forEach(([, cb]) => cb?.());
    requestAnimationFrame(() => {
      callbacks.forEach(([, , , cb]) => cb?.());
    });
  };
  var fallbackUpdateFnArrayMap = /* @__PURE__ */ new WeakMap();
  var build = (context, node, topLevelErrorHandlerNode, children) => {
    let errorHandler2;
    children ||= typeof node.tag == "function" ? invokeTag(context, node) : toArray(node.props.children);
    if (children[0]?.tag === "") {
      errorHandler2 = children[0][DOM_ERROR_HANDLER];
      topLevelErrorHandlerNode ||= node;
    }
    const oldVChildren = node.vC ? [...node.vC] : [];
    const vChildren = [];
    const vChildrenToRemove = [];
    let prevNode;
    try {
      children.flat().forEach((c) => {
        let child = buildNode(c);
        if (child) {
          if (prevNode) {
            prevNode.nN = child;
          }
          prevNode = child;
          if (typeof child.tag === "function" && !child.tag[DOM_INTERNAL_TAG] && globalContexts.length > 0) {
            child[DOM_STASH][2] = globalContexts.map((c2) => [c2, c2.values.at(-1)]);
          }
          let oldChild;
          const i = oldVChildren.findIndex((c2) => c2.key === child.key);
          if (i !== -1) {
            oldChild = oldVChildren[i];
            oldVChildren.splice(i, 1);
          }
          if (oldChild) {
            if (isNodeString(child)) {
              if (!isNodeString(oldChild)) {
                vChildrenToRemove.push(oldChild);
              } else {
                if (oldChild.t !== child.t) {
                  oldChild.t = child.t;
                  oldChild.d = true;
                }
                child = oldChild;
              }
            } else if (oldChild.tag !== child.tag) {
              vChildrenToRemove.push(oldChild);
            } else {
              oldChild.pP = oldChild.props;
              oldChild.props = child.props;
              if (typeof child.tag === "function") {
                oldChild[DOM_STASH][2] = child[DOM_STASH][2] || [];
              }
              child = oldChild;
            }
          } else if (!isNodeString(child) && nameSpaceContext) {
            const ns = useContext(nameSpaceContext);
            if (ns) {
              child.n = ns;
            }
          }
          if (!isNodeString(child)) {
            build(context, child, topLevelErrorHandlerNode);
          }
          vChildren.push(child);
        }
      });
      node.vC = vChildren;
      vChildrenToRemove.push(...oldVChildren);
      node.vR = vChildrenToRemove;
    } catch (e) {
      if (errorHandler2) {
        const fallbackUpdateFn = () => update([0, false, context[2]], topLevelErrorHandlerNode);
        const fallbackUpdateFnArray = fallbackUpdateFnArrayMap.get(topLevelErrorHandlerNode) || [];
        fallbackUpdateFnArray.push(fallbackUpdateFn);
        fallbackUpdateFnArrayMap.set(topLevelErrorHandlerNode, fallbackUpdateFnArray);
        const fallback = errorHandler2(e, () => {
          const fnArray = fallbackUpdateFnArrayMap.get(topLevelErrorHandlerNode);
          if (fnArray) {
            const i = fnArray.indexOf(fallbackUpdateFn);
            if (i !== -1) {
              fnArray.splice(i, 1);
              return fallbackUpdateFn();
            }
          }
        });
        if (fallback) {
          if (context[0] === 1) {
            context[1] = true;
          } else {
            build(context, node, topLevelErrorHandlerNode, [fallback]);
          }
          return;
        }
      }
      throw e;
    }
  };
  var buildNode = (node) => {
    if (node === void 0 || node === null || typeof node === "boolean") {
      return void 0;
    } else if (typeof node === "string" || typeof node === "number") {
      return { t: node.toString(), d: true };
    } else {
      if (typeof node.tag === "function") {
        if (node[DOM_STASH]) {
          node = { ...node };
        }
        ;
        node[DOM_STASH] = [0, []];
      } else {
        const ns = nameSpaceMap[node.tag];
        if (ns) {
          ;
          node.n = ns;
          nameSpaceContext ||= createContext("");
          node.props.children = [
            {
              tag: nameSpaceContext.Provider,
              props: {
                value: ns,
                children: node.props.children
              }
            }
          ];
        }
      }
      return node;
    }
  };
  var updateSync = (context, node) => {
    node[DOM_STASH][2]?.forEach(([c, v]) => {
      c.values.push(v);
    });
    build(context, node, void 0);
    node[DOM_STASH][2]?.forEach(([c]) => {
      c.values.pop();
    });
    if (context[0] !== 1 || !context[1]) {
      apply(node, node.c);
    }
  };
  var updateMap = /* @__PURE__ */ new WeakMap();
  var currentUpdateSets = [];
  var update = async (context, node) => {
    const existing = updateMap.get(node);
    if (existing) {
      existing[0](void 0);
    }
    let resolve;
    const promise = new Promise((r) => resolve = r);
    updateMap.set(node, [
      resolve,
      () => {
        if (context[2]) {
          context[2](context, node, (context2) => {
            updateSync(context2, node);
          }).then(() => resolve(node));
        } else {
          updateSync(context, node);
          resolve(node);
        }
      }
    ]);
    if (currentUpdateSets.length) {
      ;
      currentUpdateSets.at(-1).add(node);
    } else {
      await Promise.resolve();
      const latest = updateMap.get(node);
      if (latest) {
        updateMap.delete(node);
        latest[1]();
      }
    }
    return promise;
  };

  // node_modules/hono/dist/jsx/hooks/index.js
  var STASH_SATE = 0;
  var STASH_EFFECT = 1;
  var STASH_CALLBACK = 2;
  var STASH_USE = 3;
  var STASH_MEMO = 4;
  var STASH_REF = 5;
  var resolvedPromiseValueMap = /* @__PURE__ */ new WeakMap();
  var isDepsChanged = (prevDeps, deps) => !prevDeps || !deps || prevDeps.length !== deps.length || deps.some((dep, i) => dep !== prevDeps[i]);
  var viewTransitionState = void 0;
  var documentStartViewTransition = (cb) => {
    if (document?.startViewTransition) {
      return document.startViewTransition(cb);
    } else {
      cb();
      return { finished: Promise.resolve() };
    }
  };
  var updateHook = void 0;
  var viewTransitionHook = (context, node, cb) => {
    const state = [true, false];
    let lastVC = node.vC;
    return documentStartViewTransition(() => {
      if (lastVC === node.vC) {
        viewTransitionState = state;
        cb(context);
        viewTransitionState = void 0;
        lastVC = node.vC;
      }
    }).finished.then(() => {
      if (state[1] && lastVC === node.vC) {
        state[0] = false;
        viewTransitionState = state;
        cb(context);
        viewTransitionState = void 0;
      }
    });
  };
  var startViewTransition = (callback) => {
    updateHook = viewTransitionHook;
    try {
      callback();
    } finally {
      updateHook = void 0;
    }
  };
  var useViewTransition = () => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return [false, () => {
      }];
    }
    if (viewTransitionState) {
      viewTransitionState[1] = true;
    }
    return [!!viewTransitionState?.[0], startViewTransition];
  };
  var pendingStack = [];
  var runCallback = (type, callback) => {
    pendingStack.push(type);
    try {
      callback();
    } finally {
      pendingStack.pop();
    }
  };
  var startTransition = (callback) => {
    runCallback(1, callback);
  };
  var startTransitionHook = (callback) => {
    runCallback(2, callback);
  };
  var useTransition = () => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return [false, () => {
      }];
    }
    const [context] = buildData;
    return [context[0] === 2, startTransitionHook];
  };
  var useDeferredValue = (value) => {
    const buildData = buildDataStack.at(-1);
    if (buildData) {
      buildData[0][0] = 1;
    }
    return value;
  };
  var setShadow = (node) => {
    if (node.vC) {
      node.s = node.vC;
      node.vC = void 0;
    }
    ;
    node.s?.forEach(setShadow);
  };
  var useState = (initialState) => {
    const resolveInitialState = () => typeof initialState === "function" ? initialState() : initialState;
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return [resolveInitialState(), () => {
      }];
    }
    const [, node] = buildData;
    const stateArray = node[DOM_STASH][1][STASH_SATE] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    return stateArray[hookIndex] ||= [
      resolveInitialState(),
      (newState) => {
        const localUpdateHook = updateHook;
        const stateData = stateArray[hookIndex];
        if (typeof newState === "function") {
          newState = newState(stateData[0]);
        }
        if (!Object.is(newState, stateData[0])) {
          stateData[0] = newState;
          if (pendingStack.length) {
            const pendingType = pendingStack.at(-1);
            update([pendingType, false, localUpdateHook], node).then((node2) => {
              if (!node2 || pendingType !== 2) {
                return;
              }
              const lastVC = node2.vC;
              const addUpdateTask = () => {
                setTimeout(() => {
                  if (lastVC !== node2.vC) {
                    return;
                  }
                  const shadowNode = Object.assign({}, node2);
                  shadowNode.vC = void 0;
                  build([], shadowNode, void 0);
                  setShadow(shadowNode);
                  node2.s = shadowNode.s;
                  update([0, false, localUpdateHook], node2);
                });
              };
              if (localUpdateHook) {
                requestAnimationFrame(addUpdateTask);
              } else {
                addUpdateTask();
              }
            });
          } else {
            update([0, false, localUpdateHook], node);
          }
        }
      }
    ];
  };
  var useReducer = (reducer, initialArg, init) => {
    const [state, setState] = useState(() => init ? init(initialArg) : initialArg);
    return [
      state,
      (action) => {
        setState((state2) => reducer(state2, action));
      }
    ];
  };
  var useEffectCommon = (index, effect, deps) => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return;
    }
    const [, node] = buildData;
    const effectDepsArray = node[DOM_STASH][1][STASH_EFFECT] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    const [prevDeps, , prevCleanup] = effectDepsArray[hookIndex] ||= [];
    if (isDepsChanged(prevDeps, deps)) {
      if (prevCleanup) {
        prevCleanup();
      }
      const runner = () => {
        data[index] = void 0;
        data[2] = effect();
      };
      const data = [deps, void 0, void 0, void 0];
      data[index] = runner;
      effectDepsArray[hookIndex] = data;
    }
  };
  var useEffect = (effect, deps) => useEffectCommon(3, effect, deps);
  var useLayoutEffect = (effect, deps) => useEffectCommon(1, effect, deps);
  var useCallback = (callback, deps) => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return callback;
    }
    const [, node] = buildData;
    const callbackArray = node[DOM_STASH][1][STASH_CALLBACK] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    const prevDeps = callbackArray[hookIndex];
    if (isDepsChanged(prevDeps?.[1], deps)) {
      callbackArray[hookIndex] = [callback, deps];
    } else {
      callback = callbackArray[hookIndex][0];
    }
    return callback;
  };
  var useRef = (initialValue) => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return { current: initialValue };
    }
    const [, node] = buildData;
    const refArray = node[DOM_STASH][1][STASH_REF] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    return refArray[hookIndex] ||= { current: initialValue };
  };
  var use = (promise) => {
    const cachedRes = resolvedPromiseValueMap.get(promise);
    if (cachedRes) {
      if (cachedRes.length === 2) {
        throw cachedRes[1];
      }
      return cachedRes[0];
    }
    promise.then(
      (res2) => resolvedPromiseValueMap.set(promise, [res2]),
      (e) => resolvedPromiseValueMap.set(promise, [void 0, e])
    );
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      throw promise;
    }
    const [, node] = buildData;
    const promiseArray = node[DOM_STASH][1][STASH_USE] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    promise.then(
      (res2) => {
        promiseArray[hookIndex] = [res2];
      },
      (e) => {
        promiseArray[hookIndex] = [void 0, e];
      }
    );
    const res = promiseArray[hookIndex];
    if (res) {
      if (res.length === 2) {
        throw res[1];
      }
      return res[0];
    }
    throw promise;
  };
  var useMemo = (factory, deps) => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return factory();
    }
    const [, node] = buildData;
    const memoArray = node[DOM_STASH][1][STASH_MEMO] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    const prevDeps = memoArray[hookIndex];
    if (isDepsChanged(prevDeps?.[1], deps)) {
      memoArray[hookIndex] = [factory(), deps];
    }
    return memoArray[hookIndex][0];
  };
  var idCounter = 0;
  var useId = () => useMemo(() => `:r${(idCounter++).toString(32)}:`, []);
  var useDebugValue = (_value, _formatter) => {
  };
  var createRef = () => {
    return { current: null };
  };
  var forwardRef = (Component) => {
    return (props) => {
      const { ref, ...rest } = props;
      return Component(rest, ref);
    };
  };
  var useImperativeHandle = (ref, createHandle, deps) => {
    useEffect(() => {
      ref.current = createHandle();
      return () => {
        ref.current = null;
      };
    }, deps);
  };
  var useSyncExternalStoreGetServerSnapshotNotified = false;
  var useSyncExternalStore = (subscribe, getSnapshot, getServerSnapshot) => {
    const [state, setState] = useState(getSnapshot());
    useEffect(
      () => subscribe(() => {
        setState(getSnapshot());
      }),
      []
    );
    if (getServerSnapshot && !useSyncExternalStoreGetServerSnapshotNotified) {
      useSyncExternalStoreGetServerSnapshotNotified = true;
      console.info("`getServerSnapshot` is not supported yet.");
    }
    return state;
  };

  // node_modules/hono/dist/jsx/streaming.js
  var suspenseCounter = 0;
  var Suspense2 = async ({
    children,
    fallback
  }) => {
    if (!children) {
      return fallback.toString();
    }
    if (!Array.isArray(children)) {
      children = [children];
    }
    let resArray = [];
    const stackNode = { [DOM_STASH]: [0, []] };
    const popNodeStack = (value) => {
      buildDataStack.pop();
      return value;
    };
    try {
      stackNode[DOM_STASH][0] = 0;
      buildDataStack.push([[], stackNode]);
      resArray = children.map(
        (c) => c == null || typeof c === "boolean" ? "" : c.toString()
      );
    } catch (e) {
      if (e instanceof Promise) {
        resArray = [
          e.then(() => {
            stackNode[DOM_STASH][0] = 0;
            buildDataStack.push([[], stackNode]);
            return childrenToString(children).then(popNodeStack);
          })
        ];
      } else {
        throw e;
      }
    } finally {
      popNodeStack();
    }
    if (resArray.some((res) => res instanceof Promise)) {
      const index = suspenseCounter++;
      const fallbackStr = await fallback.toString();
      return raw(`<template id="H:${index}"></template>${fallbackStr}<!--/$-->`, [
        ...fallbackStr.callbacks || [],
        ({ phase, buffer, context }) => {
          if (phase === HtmlEscapedCallbackPhase.BeforeStream) {
            return;
          }
          return Promise.all(resArray).then(async (htmlArray) => {
            htmlArray = htmlArray.flat();
            const content = htmlArray.join("");
            if (buffer) {
              buffer[0] = buffer[0].replace(
                new RegExp(`<template id="H:${index}"></template>.*?<!--/\\$-->`),
                content
              );
            }
            let html = buffer ? "" : `<template data-hono-target="H:${index}">${content}</template><script>
((d,c,n) => {
c=d.currentScript.previousSibling
d=d.getElementById('H:${index}')
if(!d)return
do{n=d.nextSibling;n.remove()}while(n.nodeType!=8||n.nodeValue!='/$')
d.replaceWith(c.content)
})(document)
<\/script>`;
            const callbacks = htmlArray.map((html2) => html2.callbacks || []).flat();
            if (!callbacks.length) {
              return html;
            }
            if (phase === HtmlEscapedCallbackPhase.Stream) {
              html = await resolveCallback(html, HtmlEscapedCallbackPhase.BeforeStream, true, context);
            }
            return raw(html, callbacks);
          });
        }
      ]);
    } else {
      return raw(resArray.join(""));
    }
  };
  Suspense2[DOM_RENDERER] = Suspense;
  var textEncoder = new TextEncoder();

  // node_modules/hono/dist/jsx/index.js
  var jsx_default = {
    memo,
    Fragment: Fragment2,
    isValidElement,
    createElement: jsx,
    cloneElement,
    ErrorBoundary: ErrorBoundary2,
    createContext: createContext2,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    useReducer,
    useId,
    useDebugValue,
    use,
    startTransition,
    useTransition,
    useDeferredValue,
    startViewTransition,
    useViewTransition,
    useMemo,
    useLayoutEffect,
    createRef,
    forwardRef,
    useImperativeHandle,
    useSyncExternalStore,
    Suspense: Suspense2,
    Children
  };

  // src/index.ts
  var app = new Hono2();
  console.log(jsx_default.env.DATABASE_URL);
})();
//# sourceMappingURL=index.js.map
