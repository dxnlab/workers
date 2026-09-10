import { on as e, worker as t } from "./worker.js";
//#region src/deco.ts
var n, r;
function i(e, t, n, r, i, o) {
	var l, u, d, f, p, m, h, g = Symbol.metadata || Symbol.for("Symbol.metadata"), _ = Object.defineProperty, v = Object.create, y = [v(null), v(null)], b = t.length;
	function x(t, n, r) {
		return function(i, a) {
			n && (a = i, i = e);
			for (var o = 0; o < t.length; o++) a = t[o].apply(i, r ? [a] : []);
			return r ? a : i;
		};
	}
	function S(e, t, n, r) {
		if (typeof e != "function" && (r || e !== void 0)) throw TypeError(t + " must " + (n || "be") + " a function" + (r ? "" : " or undefined"));
		return e;
	}
	function C(e, t, n, r, i, a, o, c, d, f, p) {
		function m(e) {
			if (!p(e)) throw TypeError("Attempted to access private element on non-instance");
		}
		var h = [].concat(t[0]), g = t[3], v = !o, b = i === 1, C = i === 3, w = i === 4, T = i === 2;
		function E(t, n, r) {
			return function(i, a) {
				return n && (a = i, i = e), r && r(i), D[t].call(i, a);
			};
		}
		if (!v) {
			var D = {}, O = [], k = C ? "get" : w || b ? "set" : "value";
			if (d ? (f || b ? D = {
				get: s(function() {
					return g(this);
				}, r, "get"),
				set: function(e) {
					t[4](this, e);
				}
			} : D[k] = g, f || s(D[k], r, T ? "" : k)) : f || (D = Object.getOwnPropertyDescriptor(e, r)), !f && !d) {
				if ((u = y[+c][r]) && (u ^ i) !== 7) throw Error("Decorating two elements with the same name (" + D[k].name + ") is not supported yet");
				y[+c][r] = i < 3 ? 1 : i;
			}
		}
		for (var A = e, j = h.length - 1; j >= 0; j -= n ? 2 : 1) {
			var M = S(h[j], "A decorator", "be", !0), N = n ? h[j - 1] : void 0, P = {}, F = {
				kind: [
					"field",
					"accessor",
					"method",
					"getter",
					"setter",
					"class"
				][i],
				name: r,
				metadata: l,
				addInitializer: function(e, t) {
					if (e.v) throw TypeError("attempted to call addInitializer after decoration was finished");
					S(t, "An initializer", "be", !0), a.push(t);
				}.bind(null, P)
			};
			if (v) u = M.call(N, A, F), P.v = 1, S(u, "class decorators", "return") && (A = u);
			else if (F.static = c, F.private = d, u = F.access = { has: d ? p.bind() : function(e) {
				return r in e;
			} }, w || (u.get = d ? T ? function(e) {
				return m(e), D.value;
			} : E("get", 0, m) : function(e) {
				return e[r];
			}), T || C || (u.set = d ? E("set", 0, m) : function(e, t) {
				e[r] = t;
			}), A = M.call(N, b ? {
				get: D.get,
				set: D.set
			} : D[k], F), P.v = 1, b) {
				if (typeof A == "object" && A) (u = S(A.get, "accessor.get")) && (D.get = u), (u = S(A.set, "accessor.set")) && (D.set = u), (u = S(A.init, "accessor.init")) && O.unshift(u);
				else if (A !== void 0) throw TypeError("accessor decorators must return an object with get, set, or init properties or undefined");
			} else S(A, (f ? "field" : "method") + " decorators", "return") && (f ? O.unshift(A) : D[k] = A);
		}
		return i < 2 && o.push(x(O, c, 1), x(a, c, 0)), f || v || (d ? b ? o.splice(-1, 0, E("get", c), E("set", c)) : o.push(T ? D[k] : S.call.bind(D[k])) : _(e, r, D)), A;
	}
	function w(e) {
		return _(e, g, {
			configurable: !0,
			enumerable: !0,
			value: l
		});
	}
	return o !== void 0 && (l = o[g]), l = v(l ?? null), p = [], m = function(e) {
		e && p.push(x(e));
	}, h = function(t, r) {
		for (var o = 0; o < n.length; o++) {
			var s = n[o], l = s[1], u = 7 & l;
			if ((8 & l) == t && !u == r) {
				var m = s[2], h = !!s[3], g = 16 & l;
				C(t ? e : e.prototype, s, g, h ? "#" + m : a(m), u, u < 2 ? [] : t ? f ||= [] : d ||= [], p, !!t, h, r, t && h ? function(t) {
					return c(t) === e;
				} : i);
			}
		}
	}, h(8, 0), h(0, 0), h(8, 1), h(0, 1), m(d), m(f), u = p, b || w(e), {
		e: u,
		get c() {
			var n = [];
			return b && [w(e = C(e, [t], r, e.name, 5, n)), x(n, 1)];
		}
	};
}
function a(e) {
	var t = o(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function o(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function s(e, t, n) {
	typeof t == "symbol" && (t = (t = t.description) ? "[" + t + "]" : "");
	try {
		Object.defineProperty(e, "name", {
			configurable: !0,
			value: n ? n + " " + t : t
		});
	} catch {}
	return e;
}
function c(e) {
	if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (e === null ? "null" : typeof e));
	return e;
}
var l;
(class {
	static {
		({e: [n], c: [l, r]} = i(this, [t], [
			[
				e("message"),
				2,
				"handleMessage"
			],
			[
				e("error"),
				2,
				"handleError"
			],
			[
				e("messageerror"),
				2,
				"handleMessageError"
			],
			[
				e("online"),
				2,
				"handleOnline"
			],
			[
				e("offline"),
				2,
				"handleOffline"
			]
		]));
	}
	constructor() {
		n(this);
	}
	handleMessage(e) {
		let t = e.data;
		this.postMessage(t);
	}
	handleError(e) {
		console.error("Worker error:", e.error);
	}
	handleMessageError(e) {
		console.error("Worker message error:", e.data);
	}
	handleOnline(e) {
		console.log("Worker is online:", e);
	}
	handleOffline(e) {
		console.log("Worker is offline:", e);
	}
	static {
		r();
	}
});
//#endregion
export { l as default };
