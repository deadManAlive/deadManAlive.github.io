(function () {
	'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {string} style_sheet_id
	 * @param {string} styles
	 * @returns {void}
	 */
	function append_styles(target, style_sheet_id, styles) {
		const append_styles_to = get_root_for_style(target);
		if (!append_styles_to.getElementById(style_sheet_id)) {
			const style = element('style');
			style.id = style_sheet_id;
			style.textContent = styles;
			append_stylesheet(append_styles_to, style);
		}
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {{ [x: string]: string }} attributes
	 * @returns {void}
	 */
	function set_svg_attributes(node, attributes) {
		for (const key in attributes) {
			attr(node, key, attributes[key]);
		}
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	let wasm;

	const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

	if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
	let cachedUint8Memory0 = null;

	function getUint8Memory0() {
	    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
	        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
	    }
	    return cachedUint8Memory0;
	}

	function getStringFromWasm0(ptr, len) {
	    ptr = ptr >>> 0;
	    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
	}

	const heap = new Array(128).fill(undefined);

	heap.push(undefined, null, true, false);

	let heap_next = heap.length;

	function addHeapObject(obj) {
	    if (heap_next === heap.length) heap.push(heap.length + 1);
	    const idx = heap_next;
	    heap_next = heap[idx];

	    heap[idx] = obj;
	    return idx;
	}

	function getObject(idx) { return heap[idx]; }

	function dropObject(idx) {
	    if (idx < 132) return;
	    heap[idx] = heap_next;
	    heap_next = idx;
	}

	function takeObject(idx) {
	    const ret = getObject(idx);
	    dropObject(idx);
	    return ret;
	}

	let WASM_VECTOR_LEN = 0;

	const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

	const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
	    ? function (arg, view) {
	    return cachedTextEncoder.encodeInto(arg, view);
	}
	    : function (arg, view) {
	    const buf = cachedTextEncoder.encode(arg);
	    view.set(buf);
	    return {
	        read: arg.length,
	        written: buf.length
	    };
	});

	function passStringToWasm0(arg, malloc, realloc) {

	    if (realloc === undefined) {
	        const buf = cachedTextEncoder.encode(arg);
	        const ptr = malloc(buf.length, 1) >>> 0;
	        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
	        WASM_VECTOR_LEN = buf.length;
	        return ptr;
	    }

	    let len = arg.length;
	    let ptr = malloc(len, 1) >>> 0;

	    const mem = getUint8Memory0();

	    let offset = 0;

	    for (; offset < len; offset++) {
	        const code = arg.charCodeAt(offset);
	        if (code > 0x7F) break;
	        mem[ptr + offset] = code;
	    }

	    if (offset !== len) {
	        if (offset !== 0) {
	            arg = arg.slice(offset);
	        }
	        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
	        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
	        const ret = encodeString(arg, view);

	        offset += ret.written;
	    }

	    WASM_VECTOR_LEN = offset;
	    return ptr;
	}

	function isLikeNone(x) {
	    return x === undefined || x === null;
	}

	let cachedInt32Memory0 = null;

	function getInt32Memory0() {
	    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
	        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
	    }
	    return cachedInt32Memory0;
	}

	function debugString(val) {
	    // primitive types
	    const type = typeof val;
	    if (type == 'number' || type == 'boolean' || val == null) {
	        return  `${val}`;
	    }
	    if (type == 'string') {
	        return `"${val}"`;
	    }
	    if (type == 'symbol') {
	        const description = val.description;
	        if (description == null) {
	            return 'Symbol';
	        } else {
	            return `Symbol(${description})`;
	        }
	    }
	    if (type == 'function') {
	        const name = val.name;
	        if (typeof name == 'string' && name.length > 0) {
	            return `Function(${name})`;
	        } else {
	            return 'Function';
	        }
	    }
	    // objects
	    if (Array.isArray(val)) {
	        const length = val.length;
	        let debug = '[';
	        if (length > 0) {
	            debug += debugString(val[0]);
	        }
	        for(let i = 1; i < length; i++) {
	            debug += ', ' + debugString(val[i]);
	        }
	        debug += ']';
	        return debug;
	    }
	    // Test for built-in
	    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
	    let className;
	    if (builtInMatches.length > 1) {
	        className = builtInMatches[1];
	    } else {
	        // Failed to match the standard '[object ClassName]'
	        return toString.call(val);
	    }
	    if (className == 'Object') {
	        // we're a user defined class or Object
	        // JSON.stringify avoids problems with cycles, and is generally much
	        // easier than looping through ownProperties of `val`.
	        try {
	            return 'Object(' + JSON.stringify(val) + ')';
	        } catch (_) {
	            return 'Object';
	        }
	    }
	    // errors
	    if (val instanceof Error) {
	        return `${val.name}: ${val.message}\n${val.stack}`;
	    }
	    // TODO we could test for more things here, like `Set`s and `Map`s.
	    return className;
	}

	function makeMutClosure(arg0, arg1, dtor, f) {
	    const state = { a: arg0, b: arg1, cnt: 1, dtor };
	    const real = (...args) => {
	        // First up with a closure we increment the internal reference
	        // count. This ensures that the Rust closure environment won't
	        // be deallocated while we're invoking it.
	        state.cnt++;
	        const a = state.a;
	        state.a = 0;
	        try {
	            return f(a, state.b, ...args);
	        } finally {
	            if (--state.cnt === 0) {
	                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

	            } else {
	                state.a = a;
	            }
	        }
	    };
	    real.original = state;

	    return real;
	}
	function __wbg_adapter_30(arg0, arg1, arg2) {
	    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h00970bc1018743dc(arg0, arg1, addHeapObject(arg2));
	}

	/**
	* @returns {Promise<number>}
	*/
	function get_now_tempo() {
	    const ret = wasm.get_now_tempo();
	    return takeObject(ret);
	}

	/**
	* @returns {Promise<any>}
	*/
	function update_wrapper() {
	    const ret = wasm.update_wrapper();
	    return takeObject(ret);
	}

	function handleError(f, args) {
	    try {
	        return f.apply(this, args);
	    } catch (e) {
	        wasm.__wbindgen_exn_store(addHeapObject(e));
	    }
	}
	function __wbg_adapter_87(arg0, arg1, arg2, arg3) {
	    wasm.wasm_bindgen__convert__closures__invoke2_mut__h70ccabab3af04182(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
	}

	async function __wbg_load(module, imports) {
	    if (typeof Response === 'function' && module instanceof Response) {
	        if (typeof WebAssembly.instantiateStreaming === 'function') {
	            try {
	                return await WebAssembly.instantiateStreaming(module, imports);

	            } catch (e) {
	                if (module.headers.get('Content-Type') != 'application/wasm') {
	                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

	                } else {
	                    throw e;
	                }
	            }
	        }

	        const bytes = await module.arrayBuffer();
	        return await WebAssembly.instantiate(bytes, imports);

	    } else {
	        const instance = await WebAssembly.instantiate(module, imports);

	        if (instance instanceof WebAssembly.Instance) {
	            return { instance, module };

	        } else {
	            return instance;
	        }
	    }
	}

	function __wbg_get_imports() {
	    const imports = {};
	    imports.wbg = {};
	    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
	        const ret = getStringFromWasm0(arg0, arg1);
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
	        takeObject(arg0);
	    };
	    imports.wbg.__wbindgen_number_new = function(arg0) {
	        const ret = arg0;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
	        const obj = getObject(arg1);
	        const ret = typeof(obj) === 'string' ? obj : undefined;
	        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	        var len1 = WASM_VECTOR_LEN;
	        getInt32Memory0()[arg0 / 4 + 1] = len1;
	        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
	    };
	    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
	        const ret = getObject(arg0);
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_is_object = function(arg0) {
	        const val = getObject(arg0);
	        const ret = typeof(val) === 'object' && val !== null;
	        return ret;
	    };
	    imports.wbg.__wbg_String_4370c5505c674d30 = function(arg0, arg1) {
	        const ret = String(getObject(arg1));
	        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	        const len1 = WASM_VECTOR_LEN;
	        getInt32Memory0()[arg0 / 4 + 1] = len1;
	        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
	    };
	    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
	        const ret = new Error(getStringFromWasm0(arg0, arg1));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
	        const ret = BigInt.asUintN(64, arg0);
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_set_bd72c078edfa51ad = function(arg0, arg1, arg2) {
	        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
	    };
	    imports.wbg.__wbg_fetch_b5d6bebed1e6c2d2 = function(arg0) {
	        const ret = fetch(getObject(arg0));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_cb_drop = function(arg0) {
	        const obj = takeObject(arg0).original;
	        if (obj.cnt-- == 1) {
	            obj.a = 0;
	            return true;
	        }
	        const ret = false;
	        return ret;
	    };
	    imports.wbg.__wbg_fetch_8eaf01857a5bb21f = function(arg0, arg1) {
	        const ret = getObject(arg0).fetch(getObject(arg1));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_new_1eead62f64ca15ce = function() { return handleError(function () {
	        const ret = new Headers();
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_append_fda9e3432e3e88da = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
	        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
	    }, arguments) };
	    imports.wbg.__wbg_instanceof_Response_fc4327dbfcdf5ced = function(arg0) {
	        let result;
	        try {
	            result = getObject(arg0) instanceof Response;
	        } catch {
	            result = false;
	        }
	        const ret = result;
	        return ret;
	    };
	    imports.wbg.__wbg_url_8503de97f69da463 = function(arg0, arg1) {
	        const ret = getObject(arg1).url;
	        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	        const len1 = WASM_VECTOR_LEN;
	        getInt32Memory0()[arg0 / 4 + 1] = len1;
	        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
	    };
	    imports.wbg.__wbg_status_ac85a3142a84caa2 = function(arg0) {
	        const ret = getObject(arg0).status;
	        return ret;
	    };
	    imports.wbg.__wbg_headers_b70de86b8e989bc0 = function(arg0) {
	        const ret = getObject(arg0).headers;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_text_a667ac1770538491 = function() { return handleError(function (arg0) {
	        const ret = getObject(arg0).text();
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_signal_4bd18fb489af2d4c = function(arg0) {
	        const ret = getObject(arg0).signal;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_new_55c9955722952374 = function() { return handleError(function () {
	        const ret = new AbortController();
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_abort_654b796176d117aa = function(arg0) {
	        getObject(arg0).abort();
	    };
	    imports.wbg.__wbg_newwithstrandinit_cad5cd6038c7ff5d = function() { return handleError(function (arg0, arg1, arg2) {
	        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_new_898a68150f225f2e = function() {
	        const ret = new Array();
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_is_function = function(arg0) {
	        const ret = typeof(getObject(arg0)) === 'function';
	        return ret;
	    };
	    imports.wbg.__wbg_newnoargs_581967eacc0e2604 = function(arg0, arg1) {
	        const ret = new Function(getStringFromWasm0(arg0, arg1));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_next_526fc47e980da008 = function(arg0) {
	        const ret = getObject(arg0).next;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_next_ddb3312ca1c4e32a = function() { return handleError(function (arg0) {
	        const ret = getObject(arg0).next();
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_done_5c1f01fb660d73b5 = function(arg0) {
	        const ret = getObject(arg0).done;
	        return ret;
	    };
	    imports.wbg.__wbg_value_1695675138684bd5 = function(arg0) {
	        const ret = getObject(arg0).value;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_iterator_97f0c81209c6c35a = function() {
	        const ret = Symbol.iterator;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_get_97b561fb56f034b5 = function() { return handleError(function (arg0, arg1) {
	        const ret = Reflect.get(getObject(arg0), getObject(arg1));
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_call_cb65541d95d71282 = function() { return handleError(function (arg0, arg1) {
	        const ret = getObject(arg0).call(getObject(arg1));
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_new_b51585de1b234aff = function() {
	        const ret = new Object();
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_self_1ff1d729e9aae938 = function() { return handleError(function () {
	        const ret = self.self;
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_window_5f4faef6c12b79ec = function() { return handleError(function () {
	        const ret = window.window;
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_globalThis_1d39714405582d3c = function() { return handleError(function () {
	        const ret = globalThis.globalThis;
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_global_651f05c6a0944d1c = function() { return handleError(function () {
	        const ret = global.global;
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbindgen_is_undefined = function(arg0) {
	        const ret = getObject(arg0) === undefined;
	        return ret;
	    };
	    imports.wbg.__wbg_set_502d29070ea18557 = function(arg0, arg1, arg2) {
	        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
	    };
	    imports.wbg.__wbg_call_01734de55d61e11d = function() { return handleError(function (arg0, arg1, arg2) {
	        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbg_new_43f1b47c28813cbd = function(arg0, arg1) {
	        try {
	            var state0 = {a: arg0, b: arg1};
	            var cb0 = (arg0, arg1) => {
	                const a = state0.a;
	                state0.a = 0;
	                try {
	                    return __wbg_adapter_87(a, state0.b, arg0, arg1);
	                } finally {
	                    state0.a = a;
	                }
	            };
	            const ret = new Promise(cb0);
	            return addHeapObject(ret);
	        } finally {
	            state0.a = state0.b = 0;
	        }
	    };
	    imports.wbg.__wbg_resolve_53698b95aaf7fcf8 = function(arg0) {
	        const ret = Promise.resolve(getObject(arg0));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_then_f7e06ee3c11698eb = function(arg0, arg1) {
	        const ret = getObject(arg0).then(getObject(arg1));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_then_b2267541e2a73865 = function(arg0, arg1, arg2) {
	        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_buffer_085ec1f694018c4f = function(arg0) {
	        const ret = getObject(arg0).buffer;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa = function(arg0, arg1, arg2) {
	        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_new_8125e318e6245eed = function(arg0) {
	        const ret = new Uint8Array(getObject(arg0));
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbg_has_c5fcd020291e56b8 = function() { return handleError(function (arg0, arg1) {
	        const ret = Reflect.has(getObject(arg0), getObject(arg1));
	        return ret;
	    }, arguments) };
	    imports.wbg.__wbg_set_092e06b0f9d71865 = function() { return handleError(function (arg0, arg1, arg2) {
	        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
	        return ret;
	    }, arguments) };
	    imports.wbg.__wbg_stringify_e25465938f3f611f = function() { return handleError(function (arg0) {
	        const ret = JSON.stringify(getObject(arg0));
	        return addHeapObject(ret);
	    }, arguments) };
	    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
	        const ret = debugString(getObject(arg1));
	        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	        const len1 = WASM_VECTOR_LEN;
	        getInt32Memory0()[arg0 / 4 + 1] = len1;
	        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
	    };
	    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
	        throw new Error(getStringFromWasm0(arg0, arg1));
	    };
	    imports.wbg.__wbindgen_memory = function() {
	        const ret = wasm.memory;
	        return addHeapObject(ret);
	    };
	    imports.wbg.__wbindgen_closure_wrapper374 = function(arg0, arg1, arg2) {
	        const ret = makeMutClosure(arg0, arg1, 143, __wbg_adapter_30);
	        return addHeapObject(ret);
	    };

	    return imports;
	}

	function __wbg_finalize_init(instance, module) {
	    wasm = instance.exports;
	    __wbg_init.__wbindgen_wasm_module = module;
	    cachedInt32Memory0 = null;
	    cachedUint8Memory0 = null;


	    return wasm;
	}

	async function __wbg_init(input) {
	    if (wasm !== undefined) return wasm;

	    if (typeof input === 'undefined') {
	        input = new URL('dmb_spotify_embed_bg.wasm', (_documentCurrentScript && _documentCurrentScript.src || new URL('dist.js', document.baseURI).href));
	    }
	    const imports = __wbg_get_imports();

	    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
	        input = fetch(input);
	    }

	    const { instance, module } = await __wbg_load(await input, imports);

	    return __wbg_finalize_init(instance, module);
	}

	/* node_modules\svelte-icons-pack\Icon.svelte generated by Svelte v4.2.1 */

	function create_fragment$1(ctx) {
		let svg;

		let svg_levels = [
			{ width: /*size*/ ctx[1] },
			{ height: /*size*/ ctx[1] },
			{ "stroke-width": "0" },
			{ class: /*className*/ ctx[2] },
			/*src*/ ctx[0].a,
			/*attr*/ ctx[4],
			{ xmlns: "http://www.w3.org/2000/svg" }
		];

		let svg_data = {};

		for (let i = 0; i < svg_levels.length; i += 1) {
			svg_data = assign(svg_data, svg_levels[i]);
		}

		return {
			c() {
				svg = svg_element("svg");
				set_svg_attributes(svg, svg_data);
			},
			m(target, anchor) {
				insert(target, svg, anchor);
				svg.innerHTML = /*innerHtml*/ ctx[3];
			},
			p(ctx, [dirty]) {
				if (dirty & /*innerHtml*/ 8) svg.innerHTML = /*innerHtml*/ ctx[3];
				set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
					dirty & /*size*/ 2 && { width: /*size*/ ctx[1] },
					dirty & /*size*/ 2 && { height: /*size*/ ctx[1] },
					{ "stroke-width": "0" },
					dirty & /*className*/ 4 && { class: /*className*/ ctx[2] },
					dirty & /*src*/ 1 && /*src*/ ctx[0].a,
					dirty & /*attr*/ 16 && /*attr*/ ctx[4],
					{ xmlns: "http://www.w3.org/2000/svg" }
				]));
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(svg);
				}
			}
		};
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { src } = $$props;
		let { size = "1em" } = $$props;
		let { color = undefined } = $$props;
		let { title = undefined } = $$props;
		let { className = "" } = $$props;
		let innerHtml;
		let attr;

		$$self.$$set = $$props => {
			if ('src' in $$props) $$invalidate(0, src = $$props.src);
			if ('size' in $$props) $$invalidate(1, size = $$props.size);
			if ('color' in $$props) $$invalidate(5, color = $$props.color);
			if ('title' in $$props) $$invalidate(6, title = $$props.title);
			if ('className' in $$props) $$invalidate(2, className = $$props.className);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*color, src*/ 33) {
				{
					$$invalidate(4, attr = {});

					if (color) {
						if (src.a.stroke !== "none") {
							$$invalidate(4, attr.stroke = color, attr);
						}

						if (src.a.fill !== "none") {
							$$invalidate(4, attr.fill = color, attr);
						}
					}
				}
			}

			if ($$self.$$.dirty & /*title, src*/ 65) {
				{
					$$invalidate(3, innerHtml = (title ? `<title>${title}</title>` : "") + src.c);
				}
			}
		};

		return [src, size, className, innerHtml, attr, color, title];
	}

	class Icon extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$1, create_fragment$1, safe_not_equal, {
				src: 0,
				size: 1,
				color: 5,
				title: 6,
				className: 2
			});
		}
	}

	// BsPlay
	var BsPlay = {
	  a: {
	    fill: 'currentColor',
	    viewBox: '0 0 16 16'
	  },
	  c: '<path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"></path>'
	};

	// BsPause
	var BsPause = {
	  a: {
	    fill: 'currentColor',
	    viewBox: '0 0 16 16'
	  },
	  c: '<path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"></path>'
	};

	/* Spotify.svelte generated by Svelte v4.2.1 */

	function add_css(target) {
		append_styles(target, "svelte-am2xar", ".container.svelte-am2xar.svelte-am2xar{width:100%;height:100px;display:flex;justify-content:center !important;align-items:center;text-align:center}.nowPlayingCard.svelte-am2xar.svelte-am2xar{background-color:#fff;flex-shrink:0;border-radius:8px;border:2px solid #000;box-shadow:5px 5px 0 rgba(0, 0, 0, 0.3);align-items:center;width:60%;min-width:420px;height:80px;display:flex;justify-content:space-between;transition:all 0.5s ease}.nowPlayingCard.svelte-am2xar.svelte-am2xar:hover{box-shadow:10px 10px 0 rgba(0, 0, 0, 0.3);transform:translateX(-10px) translateY(-10px);background-color:rgba(30, 215, 96, 0.8);transition:all 0.5s ease}.nowPlayingImage.svelte-am2xar img.svelte-am2xar{border-radius:8px;border:1px solid black;box-shadow:3px 3px 0 rgba(0, 0, 0, 0.3);transition:all 0.5s ease;width:60px;height:60px;flex-shrink:0;margin:10px}.nowPlayingImage.svelte-am2xar img.svelte-am2xar:hover{box-shadow:5px 5px 0 rgba(0, 0, 0, 0.3);transform:scale(1.5) translateX(-3px) translateY(-3px);transition:all 0.5s ease}#nowPlayingDetails.svelte-am2xar.svelte-am2xar{justify-content:center;overflow:hidden;display:flex;flex-direction:column;width:54%;height:100%;display:flex;flex-direction:column;width:54%;height:100%}.nowPlayingTitle.svelte-am2xar.svelte-am2xar{flex-shrink:0;color:#000;white-space:nowrap;text-align:left;font-size:16px;width:100%}.nowPlayingArtists.svelte-am2xar.svelte-am2xar{text-align:left;flex-shrink:0;overflow:hidden;white-space:nowrap;width:100%;font-size:12px}.nowPlayingTime.svelte-am2xar.svelte-am2xar{text-align:left;font-size:12px}.nowPlayingState.svelte-am2xar.svelte-am2xar{text-align:center;width:20%;padding:10px}.playIconDiv.svelte-am2xar.svelte-am2xar{animation:svelte-am2xar-beat var(--period) infinite normal}@keyframes svelte-am2xar-beat{0%{transform:scale(1.6);color:crimson}20%{transform:scale(1.2)}90%{transform:scale(1.1)}100%{transform:scale(1)}}");
	}

	// (102:4) {:else}
	function create_else_block(ctx) {
		let a;
		let div6;
		let div0;
		let img;
		let img_src_value;
		let t0;
		let div4;
		let div1;
		let p0;
		let t1_value = trunc(/*now_playing*/ ctx[0].title, 24) + "";
		let t1;
		let t2;
		let div2;
		let p1;
		let t3_value = trunc(/*now_playing*/ ctx[0].artists.join(", "), 30) + "";
		let t3;
		let t4;
		let div3;
		let p2;
		let t5_value = `${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[0][0])}:${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[0][1])}/${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[1][0])}:${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[1][1])}` + "";
		let t5;
		let t6;
		let div5;
		let current_block_type_index;
		let if_block;
		let a_href_value;
		let current;
		const if_block_creators = [create_if_block_1, create_else_block_1];
		const if_blocks = [];

		function select_block_type_1(ctx, dirty) {
			if (/*now_playing*/ ctx[0].is_playing) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_1(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				a = element("a");
				div6 = element("div");
				div0 = element("div");
				img = element("img");
				t0 = space();
				div4 = element("div");
				div1 = element("div");
				p0 = element("p");
				t1 = text(t1_value);
				t2 = space();
				div2 = element("div");
				p1 = element("p");
				t3 = text(t3_value);
				t4 = space();
				div3 = element("div");
				p2 = element("p");
				t5 = text(t5_value);
				t6 = space();
				div5 = element("div");
				if_block.c();
				if (!src_url_equal(img.src, img_src_value = /*now_playing*/ ctx[0].album_art_url)) attr(img, "src", img_src_value);
				attr(img, "alt", "Album Art");
				attr(img, "class", "svelte-am2xar");
				attr(div0, "class", "nowPlayingImage svelte-am2xar");
				set_style(p0, "margin-bottom", "0");
				attr(div1, "class", "nowPlayingTitle svelte-am2xar");
				set_style(p1, "margin-bottom", "0");
				attr(div2, "class", "nowPlayingArtists svelte-am2xar");
				set_style(p2, "margin-bottom", "0");
				attr(div3, "class", "nowPlayingTime svelte-am2xar");
				attr(div4, "id", "nowPlayingDetails");
				attr(div4, "class", "svelte-am2xar");
				attr(div5, "class", "nowPlayingState svelte-am2xar");
				attr(div6, "class", "nowPlayingCard svelte-am2xar");
				set_style(a, "text-decoration", "none");
				set_style(a, "color", "black");
				attr(a, "href", a_href_value = /*now_playing*/ ctx[0].track_url);
			},
			m(target, anchor) {
				insert(target, a, anchor);
				append(a, div6);
				append(div6, div0);
				append(div0, img);
				append(div6, t0);
				append(div6, div4);
				append(div4, div1);
				append(div1, p0);
				append(p0, t1);
				append(div4, t2);
				append(div4, div2);
				append(div2, p1);
				append(p1, t3);
				append(div4, t4);
				append(div4, div3);
				append(div3, p2);
				append(p2, t5);
				append(div6, t6);
				append(div6, div5);
				if_blocks[current_block_type_index].m(div5, null);
				current = true;
			},
			p(ctx, dirty) {
				if (!current || dirty & /*now_playing*/ 1 && !src_url_equal(img.src, img_src_value = /*now_playing*/ ctx[0].album_art_url)) {
					attr(img, "src", img_src_value);
				}

				if ((!current || dirty & /*now_playing*/ 1) && t1_value !== (t1_value = trunc(/*now_playing*/ ctx[0].title, 24) + "")) set_data(t1, t1_value);
				if ((!current || dirty & /*now_playing*/ 1) && t3_value !== (t3_value = trunc(/*now_playing*/ ctx[0].artists.join(", "), 30) + "")) set_data(t3, t3_value);
				if ((!current || dirty & /*now_playing*/ 1) && t5_value !== (t5_value = `${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[0][0])}:${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[0][1])}/${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[1][0])}:${/*pad*/ ctx[2](/*now_playing*/ ctx[0].time[1][1])}` + "")) set_data(t5, t5_value);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div5, null);
				}

				if (!current || dirty & /*now_playing*/ 1 && a_href_value !== (a_href_value = /*now_playing*/ ctx[0].track_url)) {
					attr(a, "href", a_href_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(a);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	// (100:4) {#if now_playing == null}
	function create_if_block(ctx) {
		let p;

		return {
			c() {
				p = element("p");
				p.textContent = "¯\\_(ツ)_/¯";
			},
			m(target, anchor) {
				insert(target, p, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(p);
				}
			}
		};
	}

	// (139:20) {:else}
	function create_else_block_1(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { src: BsPause, size: "32" } });

		return {
			c() {
				create_component(icon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(icon, detaching);
			}
		};
	}

	// (135:20) {#if now_playing.is_playing}
	function create_if_block_1(ctx) {
		let div;
		let icon;
		let current;

		icon = new Icon({
				props: {
					src: BsPlay,
					className: "playIcon",
					size: "32"
				}
			});

		return {
			c() {
				div = element("div");
				create_component(icon.$$.fragment);
				attr(div, "class", "playIconDiv svelte-am2xar");
				set_style(div, "--period", /*animation_period*/ ctx[1] + "s");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(icon, div, null);
				current = true;
			},
			p(ctx, dirty) {
				if (!current || dirty & /*animation_period*/ 2) {
					set_style(div, "--period", /*animation_period*/ ctx[1] + "s");
				}
			},
			i(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				destroy_component(icon);
			}
		};
	}

	function create_fragment(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*now_playing*/ ctx[0] == null) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				div = element("div");
				if_block.c();
				attr(div, "class", "container svelte-am2xar");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	function trunc(text, length) {
		if (text.length <= length) {
			return text;
		} else {
			return text.slice(0, length) + "...";
		}
	}

	function instance($$self, $$props, $$invalidate) {
		let interval_ms = 1000;
		let now_playing;
		let not_playing = 0;
		let animation_period = 1;

		onMount(() => {
			__wbg_init();
		});

		const update = () => {
			update_wrapper().then(data => {
				if (now_playing?.track_url != data.track_url) {
					get_now_tempo().then(tempo => {
						if (tempo > 150) {
							tempo /= 2;
						} else if (tempo < 70) {
							tempo *= 2;
						}

						$$invalidate(1, animation_period = 60 / tempo);
					}).catch(console.error);
				}

				$$invalidate(0, now_playing = data);

				if (interval_ms !== 1000) {
					$$invalidate(3, interval_ms = 1000);
					not_playing = 0;
				}
			}).catch(e => {
				console.error(e);
				not_playing += 1;
				$$invalidate(0, now_playing = null);

				if (not_playing > 100) {
					$$invalidate(3, interval_ms = 60000);
				} else if (not_playing > 10) {
					$$invalidate(3, interval_ms = 10000);
				}
			});
		};

		const pad = n => {
			return n < 10 ? "0" + n : n;
		};

		let clear;

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*clear, interval_ms*/ 24) {
				{
					clearInterval(clear);
					$$invalidate(4, clear = setInterval(update, interval_ms));
				}
			}
		};

		return [now_playing, animation_period, pad, interval_ms, clear];
	}

	class Spotify extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, safe_not_equal, {}, add_css);
		}
	}

	let div = document.createElement('div');
	let script = document.currentScript;
	script.parentNode.insertBefore(div, script);

	new Spotify({
	  target: div,
	});

})();
