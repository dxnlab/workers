//#region src/worker.ts
var e = /* @__PURE__ */ function(e) {
	return e.Error = "error", e.LanguageChange = "languagechange", e.Online = "online", e.Offline = "offline", e.RejectionHandled = "rejectionhandled", e.SecurityPolicyViolation = "securitypolicyviolation", e.UnhandledRejection = "unhandledrejection", e;
}({});
function t(e, t, n) {
	return Object.entries(t).reduce((e, [t, n]) => (e.addEventListener(t, n.bind(e)), e), new Worker(e, n));
}
function n(e) {
	return e || globalThis.self;
}
var r = Symbol("self");
function i(e, t) {
	let r = n(t);
	return Object.entries(e).forEach(([e, t]) => {
		r.addEventListener(e, t);
	}), r;
}
function a(e, t) {
	let i = n();
	return e = Object.defineProperty(e, r, { value: i }), i;
}
function o(e) {
	return function(t) {
		return function(n, i) {
			((t ?? this)?.constructor?.[r] ?? globalThis.self).addEventListener(e, n);
		};
	};
}
//#endregion
export { e as WorkerEvent, i as createWorker, o as on, t as registerWorker, a as worker };
