
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

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
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.44.1 */

    function create_fragment$h(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.44.1 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.44.1 */
    const file$d = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$f(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$d, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 15361) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getOriginalBodyPadding() {
      const style = window ? window.getComputedStyle(document.body, null) : {};

      return parseInt((style && style.getPropertyValue('padding-right')) || 0, 10);
    }

    function getScrollbarWidth() {
      let scrollDiv = document.createElement('div');
      // .modal-scrollbar-measure styles // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/scss/_modal.scss#L106-L113
      scrollDiv.style.position = 'absolute';
      scrollDiv.style.top = '-9999px';
      scrollDiv.style.width = '50px';
      scrollDiv.style.height = '50px';
      scrollDiv.style.overflow = 'scroll';
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }

    function setScrollbarWidth(padding) {
      document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
    }

    function isBodyOverflowing() {
      return window ? document.body.clientWidth < window.innerWidth : false;
    }

    function conditionallyUpdateScrollbar() {
      const scrollbarWidth = getScrollbarWidth();
      // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/js/src/modal.js#L433
      const fixedContent = document.querySelectorAll(
        '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
      )[0];
      const bodyPadding = fixedContent
        ? parseInt(fixedContent.style.paddingRight || 0, 10)
        : 0;

      if (isBodyOverflowing()) {
        setScrollbarWidth(bodyPadding + scrollbarWidth);
      }
    }

    function browserEvent(target, ...args) {
      target.addEventListener(...args);

      return () => target.removeEventListener(...args);
    }

    function toClassName(value) {
      let result = '';

      if (typeof value === 'string' || typeof value === 'number') {
        result += value;
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          result = value.map(toClassName).filter(Boolean).join(' ');
        } else {
          for (let key in value) {
            if (value[key]) {
              result && (result += ' ');
              result += key;
            }
          }
        }
      }

      return result;
    }

    function classnames(...args) {
      return args.map(toClassName).filter(Boolean).join(' ');
    }

    function getTransitionDuration(element) {
      if (!element) return 0;

      // Get transition-duration of the element
      let { transitionDuration, transitionDelay } =
        window.getComputedStyle(element);

      const floatTransitionDuration = Number.parseFloat(transitionDuration);
      const floatTransitionDelay = Number.parseFloat(transitionDelay);

      // Return 0 if element or transition duration is not found
      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      }

      // If multiple durations are defined, take the first
      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0];

      return (
        (Number.parseFloat(transitionDuration) +
          Number.parseFloat(transitionDelay)) *
        1000
      );
    }

    /* node_modules/sveltestrap/src/Accordion.svelte generated by Svelte v3.44.1 */
    const file$c = "node_modules/sveltestrap/src/Accordion.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let div_levels = [{ class: /*classes*/ ctx[0] }, /*$$restProps*/ ctx[2]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$c, 29, 0, 643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["flush","stayOpen","class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $open;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Accordion', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { flush = false } = $$props;
    	let { stayOpen = false } = $$props;
    	let { class: className = '' } = $$props;
    	const open = writable();
    	validate_store(open, 'open');
    	component_subscribe($$self, open, value => $$invalidate(8, $open = value));

    	setContext('accordion', {
    		open,
    		stayOpen,
    		toggle: id => {
    			if ($open === id) open.set(); else open.set(id);
    			dispatch('toggle', { [id]: $open === id });
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('flush' in $$new_props) $$invalidate(3, flush = $$new_props.flush);
    		if ('stayOpen' in $$new_props) $$invalidate(4, stayOpen = $$new_props.stayOpen);
    		if ('class' in $$new_props) $$invalidate(5, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		createEventDispatcher,
    		setContext,
    		writable,
    		dispatch,
    		flush,
    		stayOpen,
    		className,
    		open,
    		classes,
    		$open
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('flush' in $$props) $$invalidate(3, flush = $$new_props.flush);
    		if ('stayOpen' in $$props) $$invalidate(4, stayOpen = $$new_props.stayOpen);
    		if ('className' in $$props) $$invalidate(5, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, flush*/ 40) {
    			$$invalidate(0, classes = classnames(className, 'accordion', { 'accordion-flush': flush }));
    		}
    	};

    	return [classes, open, $$restProps, flush, stayOpen, className, $$scope, slots];
    }

    class Accordion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { flush: 3, stayOpen: 4, class: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accordion",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get flush() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flush(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stayOpen() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stayOpen(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/AccordionHeader.svelte generated by Svelte v3.44.1 */
    const file$b = "node_modules/sveltestrap/src/AccordionHeader.svelte";

    function create_fragment$d(ctx) {
    	let h2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h2_levels = [{ class: "accordion-header" }, /*$$restProps*/ ctx[1]];
    	let h2_data = {};

    	for (let i = 0; i < h2_levels.length; i += 1) {
    		h2_data = assign(h2_data, h2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", /*classes*/ ctx[0]);
    			add_location(button, file$b, 9, 2, 219);
    			set_attributes(h2, h2_data);
    			add_location(h2, file$b, 8, 0, 170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, button);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1) {
    				attr_dev(button, "class", /*classes*/ ctx[0]);
    			}

    			set_attributes(h2, h2_data = get_spread_update(h2_levels, [
    				{ class: "accordion-header" },
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AccordionHeader', slots, ['default']);
    	let { class: className = '' } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classnames, className, classes });

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			$$invalidate(0, classes = classnames(className, 'accordion-button'));
    		}
    	};

    	return [classes, $$restProps, className, $$scope, slots, click_handler];
    }

    class AccordionHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccordionHeader",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<AccordionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AccordionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function backdropIn(node) {
      node.style.display = 'block';

      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t === 0) {
            node.classList.add('show');
          }
        }
      };
    }

    function backdropOut(node) {
      node.classList.remove('show');
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t === 0) {
            node.style.display = 'none';
          }
        }
      };
    }

    function collapseOut(node) {
      node.style.height = `${node.getBoundingClientRect().height}px`;
      node.classList.add('collapsing');
      node.classList.remove('collapse', 'show');
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t > 0) {
            node.style.height = '';
          } else if (t === 0) {
            node.classList.remove('collapsing');
            node.classList.add('collapse');
          }
        }
      };
    }

    function collapseIn(node) {
      node.classList.add('collapsing');
      node.classList.remove('collapse', 'show');
      node.style.height = 0;
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t < 1) {
            node.style.height = `${node.scrollHeight}px`;
          } else {
            node.classList.remove('collapsing');
            node.classList.add('collapse', 'show');
            node.style.height = '';
          }
        }
      };
    }

    function modalIn(node) {
      node.style.display = 'block';
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t > 0) {
            node.classList.add('show');
          }
        }
      };
    }

    function modalOut(node) {
      node.classList.remove('show');
      const duration = getTransitionDuration(node);

      return {
        duration,
        tick: (t) => {
          if (t === 1) {
            node.style.display = 'none';
          }
        }
      };
    }

    const defaultToggleEvents = ['touchstart', 'click'];

    var toggle = (toggler, togglerFn) => {
      let unbindEvents;

      if (
        typeof toggler === 'string' &&
        typeof window !== 'undefined' &&
        document &&
        document.createElement
      ) {
        let selection = document.querySelectorAll(toggler);
        if (!selection.length) {
          selection = document.querySelectorAll(`#${toggler}`);
        }
        if (!selection.length) {
          throw new Error(
            `The target '${toggler}' could not be identified in the dom, tip: check spelling`
          );
        }

        defaultToggleEvents.forEach((event) => {
          selection.forEach((element) => {
            element.addEventListener(event, togglerFn);
          });
        });

        unbindEvents = () => {
          defaultToggleEvents.forEach((event) => {
            selection.forEach((element) => {
              element.removeEventListener(event, togglerFn);
            });
          });
        };
      }

      return () => {
        if (typeof unbindEvents === 'function') {
          unbindEvents();
          unbindEvents = undefined;
        }
      };
    };

    /* node_modules/sveltestrap/src/Collapse.svelte generated by Svelte v3.44.1 */
    const file$a = "node_modules/sveltestrap/src/Collapse.svelte";

    // (57:0) {#if isOpen}
    function create_if_block$6(ctx) {
    	let div;
    	let div_style_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let div_levels = [
    		{
    			style: div_style_value = /*navbar*/ ctx[1] ? undefined : 'overflow: hidden;'
    		},
    		/*$$restProps*/ ctx[8],
    		{ class: /*classes*/ ctx[7] }
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$a, 57, 2, 1471);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "introstart", /*introstart_handler*/ ctx[16], false, false, false),
    					listen_dev(div, "introend", /*introend_handler*/ ctx[17], false, false, false),
    					listen_dev(div, "outrostart", /*outrostart_handler*/ ctx[18], false, false, false),
    					listen_dev(div, "outroend", /*outroend_handler*/ ctx[19], false, false, false),
    					listen_dev(
    						div,
    						"introstart",
    						function () {
    							if (is_function(/*onEntering*/ ctx[2])) /*onEntering*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"introend",
    						function () {
    							if (is_function(/*onEntered*/ ctx[3])) /*onEntered*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"outrostart",
    						function () {
    							if (is_function(/*onExiting*/ ctx[4])) /*onExiting*/ ctx[4].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"outroend",
    						function () {
    							if (is_function(/*onExited*/ ctx[5])) /*onExited*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*navbar*/ 2 && div_style_value !== (div_style_value = /*navbar*/ ctx[1] ? undefined : 'overflow: hidden;')) && { style: div_style_value },
    				dirty & /*$$restProps*/ 256 && /*$$restProps*/ ctx[8],
    				(!current || dirty & /*classes*/ 128) && { class: /*classes*/ ctx[7] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, collapseIn, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, collapseOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(57:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[20]);
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let classes;

    	const omit_props_names = [
    		"isOpen","class","navbar","onEntering","onEntered","onExiting","onExited","expand","toggler"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Collapse', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { isOpen = false } = $$props;
    	let { class: className = '' } = $$props;
    	let { navbar = false } = $$props;
    	let { onEntering = () => dispatch('opening') } = $$props;
    	let { onEntered = () => dispatch('open') } = $$props;
    	let { onExiting = () => dispatch('closing') } = $$props;
    	let { onExited = () => dispatch('close') } = $$props;
    	let { expand = false } = $$props;
    	let { toggler = null } = $$props;

    	onMount(() => toggle(toggler, e => {
    		$$invalidate(0, isOpen = !isOpen);
    		e.preventDefault();
    	}));

    	let windowWidth = 0;
    	let _wasMaximized = false;

    	// TODO wrong to hardcode these here - come from Bootstrap CSS only
    	const minWidth = {};

    	minWidth['xs'] = 0;
    	minWidth['sm'] = 576;
    	minWidth['md'] = 768;
    	minWidth['lg'] = 992;
    	minWidth['xl'] = 1200;

    	function notify() {
    		dispatch('update', isOpen);
    	}

    	function introstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function introend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outroend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function onwindowresize() {
    		$$invalidate(6, windowWidth = window.innerWidth);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('isOpen' in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('class' in $$new_props) $$invalidate(9, className = $$new_props.class);
    		if ('navbar' in $$new_props) $$invalidate(1, navbar = $$new_props.navbar);
    		if ('onEntering' in $$new_props) $$invalidate(2, onEntering = $$new_props.onEntering);
    		if ('onEntered' in $$new_props) $$invalidate(3, onEntered = $$new_props.onEntered);
    		if ('onExiting' in $$new_props) $$invalidate(4, onExiting = $$new_props.onExiting);
    		if ('onExited' in $$new_props) $$invalidate(5, onExited = $$new_props.onExited);
    		if ('expand' in $$new_props) $$invalidate(10, expand = $$new_props.expand);
    		if ('toggler' in $$new_props) $$invalidate(11, toggler = $$new_props.toggler);
    		if ('$$scope' in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		collapseIn,
    		collapseOut,
    		classnames,
    		toggle,
    		dispatch,
    		isOpen,
    		className,
    		navbar,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		expand,
    		toggler,
    		windowWidth,
    		_wasMaximized,
    		minWidth,
    		notify,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('className' in $$props) $$invalidate(9, className = $$new_props.className);
    		if ('navbar' in $$props) $$invalidate(1, navbar = $$new_props.navbar);
    		if ('onEntering' in $$props) $$invalidate(2, onEntering = $$new_props.onEntering);
    		if ('onEntered' in $$props) $$invalidate(3, onEntered = $$new_props.onEntered);
    		if ('onExiting' in $$props) $$invalidate(4, onExiting = $$new_props.onExiting);
    		if ('onExited' in $$props) $$invalidate(5, onExited = $$new_props.onExited);
    		if ('expand' in $$props) $$invalidate(10, expand = $$new_props.expand);
    		if ('toggler' in $$props) $$invalidate(11, toggler = $$new_props.toggler);
    		if ('windowWidth' in $$props) $$invalidate(6, windowWidth = $$new_props.windowWidth);
    		if ('_wasMaximized' in $$props) $$invalidate(12, _wasMaximized = $$new_props._wasMaximized);
    		if ('classes' in $$props) $$invalidate(7, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, navbar*/ 514) {
    			$$invalidate(7, classes = classnames(className, navbar && 'navbar-collapse'));
    		}

    		if ($$self.$$.dirty & /*navbar, expand, windowWidth, minWidth, isOpen, _wasMaximized*/ 13379) {
    			if (navbar && expand) {
    				if (windowWidth >= minWidth[expand] && !isOpen) {
    					$$invalidate(0, isOpen = true);
    					$$invalidate(12, _wasMaximized = true);
    					notify();
    				} else if (windowWidth < minWidth[expand] && _wasMaximized) {
    					$$invalidate(0, isOpen = false);
    					$$invalidate(12, _wasMaximized = false);
    					notify();
    				}
    			}
    		}
    	};

    	return [
    		isOpen,
    		navbar,
    		onEntering,
    		onEntered,
    		onExiting,
    		onExited,
    		windowWidth,
    		classes,
    		$$restProps,
    		className,
    		expand,
    		toggler,
    		_wasMaximized,
    		minWidth,
    		$$scope,
    		slots,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler,
    		outroend_handler,
    		onwindowresize
    	];
    }

    class Collapse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			isOpen: 0,
    			class: 9,
    			navbar: 1,
    			onEntering: 2,
    			onEntered: 3,
    			onExiting: 4,
    			onExited: 5,
    			expand: 10,
    			toggler: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapse",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navbar() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navbar(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntering() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntering(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEntered() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEntered(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExiting() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExiting(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExited() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExited(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expand() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expand(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggler() {
    		throw new Error("<Collapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggler(value) {
    		throw new Error("<Collapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/AccordionItem.svelte generated by Svelte v3.44.1 */
    const file$9 = "node_modules/sveltestrap/src/AccordionItem.svelte";
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (31:2) <AccordionHeader     on:click={() => onToggle()}     class={!accordionOpen && 'collapsed'}   >
    function create_default_slot_1$3(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[9].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[16], get_header_slot_context);

    	const block = {
    		c: function create() {
    			if (header_slot) header_slot.c();
    			t0 = space();
    			t1 = text(/*header*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			if (header_slot) {
    				header_slot.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[16], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*header*/ 1) set_data_dev(t1, /*header*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (header_slot) header_slot.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(31:2) <AccordionHeader     on:click={() => onToggle()}     class={!accordionOpen && 'collapsed'}   >",
    		ctx
    	});

    	return block;
    }

    // (38:2) <Collapse     isOpen={accordionOpen}     class="accordion-collapse"     on:introstart     on:introend     on:outrostart     on:outroend   >
    function create_default_slot$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "accordion-body");
    			add_location(div, file$9, 45, 4, 1133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(38:2) <Collapse     isOpen={accordionOpen}     class=\\\"accordion-collapse\\\"     on:introstart     on:introend     on:outrostart     on:outroend   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let accordionheader;
    	let t;
    	let collapse;
    	let current;

    	accordionheader = new AccordionHeader({
    			props: {
    				class: !/*accordionOpen*/ ctx[2] && 'collapsed',
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordionheader.$on("click", /*click_handler*/ ctx[10]);

    	collapse = new Collapse({
    			props: {
    				isOpen: /*accordionOpen*/ ctx[2],
    				class: "accordion-collapse",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapse.$on("introstart", /*introstart_handler*/ ctx[11]);
    	collapse.$on("introend", /*introend_handler*/ ctx[12]);
    	collapse.$on("outrostart", /*outrostart_handler*/ ctx[13]);
    	collapse.$on("outroend", /*outroend_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(accordionheader.$$.fragment);
    			t = space();
    			create_component(collapse.$$.fragment);
    			attr_dev(div, "class", /*classes*/ ctx[3]);
    			add_location(div, file$9, 29, 0, 783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(accordionheader, div, null);
    			append_dev(div, t);
    			mount_component(collapse, div, null);
    			/*div_binding*/ ctx[15](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const accordionheader_changes = {};
    			if (dirty & /*accordionOpen*/ 4) accordionheader_changes.class = !/*accordionOpen*/ ctx[2] && 'collapsed';

    			if (dirty & /*$$scope, header*/ 65537) {
    				accordionheader_changes.$$scope = { dirty, ctx };
    			}

    			accordionheader.$set(accordionheader_changes);
    			const collapse_changes = {};
    			if (dirty & /*accordionOpen*/ 4) collapse_changes.isOpen = /*accordionOpen*/ ctx[2];

    			if (dirty & /*$$scope*/ 65536) {
    				collapse_changes.$$scope = { dirty, ctx };
    			}

    			collapse.$set(collapse_changes);

    			if (!current || dirty & /*classes*/ 8) {
    				attr_dev(div, "class", /*classes*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordionheader.$$.fragment, local);
    			transition_in(collapse.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordionheader.$$.fragment, local);
    			transition_out(collapse.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(accordionheader);
    			destroy_component(collapse);
    			/*div_binding*/ ctx[15](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let classes;
    	let accordionOpen;
    	let $open;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AccordionItem', slots, ['header','default']);
    	let { class: className = '' } = $$props;
    	let { header = '' } = $$props;
    	let { active = false } = $$props;
    	let accordionId;
    	const dispatch = createEventDispatcher();
    	const { stayOpen, toggle, open } = getContext('accordion');
    	validate_store(open, 'open');
    	component_subscribe($$self, open, value => $$invalidate(8, $open = value));

    	onMount(() => {
    		if (active) toggle(accordionId);
    	});

    	const onToggle = () => {
    		if (stayOpen) $$invalidate(6, active = !active);
    		toggle(accordionId);
    		dispatch('toggle', !accordionOpen);
    	};

    	const writable_props = ['class', 'header', 'active'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AccordionItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onToggle();

    	function introstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function introend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outroend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			accordionId = $$value;
    			$$invalidate(1, accordionId);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(7, className = $$props.class);
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('active' in $$props) $$invalidate(6, active = $$props.active);
    		if ('$$scope' in $$props) $$invalidate(16, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		onMount,
    		classnames,
    		Collapse,
    		AccordionHeader,
    		className,
    		header,
    		active,
    		accordionId,
    		dispatch,
    		stayOpen,
    		toggle,
    		open,
    		onToggle,
    		accordionOpen,
    		classes,
    		$open
    	});

    	$$self.$inject_state = $$props => {
    		if ('className' in $$props) $$invalidate(7, className = $$props.className);
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('active' in $$props) $$invalidate(6, active = $$props.active);
    		if ('accordionId' in $$props) $$invalidate(1, accordionId = $$props.accordionId);
    		if ('accordionOpen' in $$props) $$invalidate(2, accordionOpen = $$props.accordionOpen);
    		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 128) {
    			$$invalidate(3, classes = classnames(className, 'accordion-item'));
    		}

    		if ($$self.$$.dirty & /*active, $open, accordionId*/ 322) {
    			$$invalidate(2, accordionOpen = stayOpen ? active : $open === accordionId);
    		}
    	};

    	return [
    		header,
    		accordionId,
    		accordionOpen,
    		classes,
    		open,
    		onToggle,
    		active,
    		className,
    		$open,
    		slots,
    		click_handler,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler,
    		outroend_handler,
    		div_binding,
    		$$scope
    	];
    }

    class AccordionItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { class: 7, header: 0, active: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccordionItem",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<AccordionItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AccordionItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<AccordionItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<AccordionItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<AccordionItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<AccordionItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Badge.svelte generated by Svelte v3.44.1 */
    const file$8 = "node_modules/sveltestrap/src/Badge.svelte";

    // (27:0) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let span_levels = [/*$$restProps*/ ctx[3], { class: /*classes*/ ctx[2] }];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			set_attributes(span, span_data);
    			add_location(span, file$8, 27, 2, 500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

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
    				if_block.m(span, null);
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3],
    				(!current || dirty & /*classes*/ 4) && { class: /*classes*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(27:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if href}
    function create_if_block$5(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*$$restProps*/ ctx[3],
    		{ href: /*href*/ ctx[1] },
    		{ class: /*classes*/ ctx[2] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file$8, 19, 2, 366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    				if_block.m(a, null);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3],
    				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
    				(!current || dirty & /*classes*/ 4) && { class: /*classes*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(19:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(31:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if children}
    function create_if_block_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(29:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(23:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if children}
    function create_if_block_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(21:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","children","color","href","pill"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Badge', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { children = undefined } = $$props;
    	let { color = 'secondary' } = $$props;
    	let { href = undefined } = $$props;
    	let { pill = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ('children' in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ('color' in $$new_props) $$invalidate(5, color = $$new_props.color);
    		if ('href' in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ('pill' in $$new_props) $$invalidate(6, pill = $$new_props.pill);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		children,
    		color,
    		href,
    		pill,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(4, className = $$new_props.className);
    		if ('children' in $$props) $$invalidate(0, children = $$new_props.children);
    		if ('color' in $$props) $$invalidate(5, color = $$new_props.color);
    		if ('href' in $$props) $$invalidate(1, href = $$new_props.href);
    		if ('pill' in $$props) $$invalidate(6, pill = $$new_props.pill);
    		if ('classes' in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, color, pill*/ 112) {
    			$$invalidate(2, classes = classnames(className, 'badge', `bg-${color}`, pill ? 'rounded-pill' : false));
    		}
    	};

    	return [children, href, classes, $$restProps, className, color, pill, $$scope, slots];
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 4,
    			children: 0,
    			color: 5,
    			href: 1,
    			pill: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Badge",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pill() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pill(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/InlineContainer.svelte generated by Svelte v3.44.1 */

    const file$7 = "node_modules/sveltestrap/src/InlineContainer.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$7, 3, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InlineContainer', slots, ['default']);
    	let x = 'wtf svelte?'; // eslint-disable-line
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InlineContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ x });

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) x = $$props.x;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$$scope, slots];
    }

    class InlineContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InlineContainer",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules/sveltestrap/src/ModalBackdrop.svelte generated by Svelte v3.44.1 */
    const file$6 = "node_modules/sveltestrap/src/ModalBackdrop.svelte";

    // (12:0) {#if isOpen}
    function create_if_block$4(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let div_levels = [/*$$restProps*/ ctx[3], { class: /*classes*/ ctx[2] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			toggle_class(div, "fade", /*fade*/ ctx[1]);
    			add_location(div, file$6, 12, 2, 350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3],
    				(!current || dirty & /*classes*/ 4) && { class: /*classes*/ ctx[2] }
    			]));

    			toggle_class(div, "fade", /*fade*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, backdropIn, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, backdropOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","isOpen","fade"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalBackdrop', slots, []);
    	let { class: className = '' } = $$props;
    	let { isOpen = false } = $$props;
    	let { fade = true } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ('isOpen' in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('fade' in $$new_props) $$invalidate(1, fade = $$new_props.fade);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		backdropIn,
    		backdropOut,
    		className,
    		isOpen,
    		fade,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(4, className = $$new_props.className);
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('fade' in $$props) $$invalidate(1, fade = $$new_props.fade);
    		if ('classes' in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 16) {
    			$$invalidate(2, classes = classnames(className, 'modal-backdrop'));
    		}
    	};

    	return [isOpen, fade, classes, $$restProps, className, click_handler];
    }

    class ModalBackdrop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { class: 4, isOpen: 0, fade: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalBackdrop",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalBackdrop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalBackdrop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<ModalBackdrop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<ModalBackdrop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<ModalBackdrop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<ModalBackdrop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/ModalBody.svelte generated by Svelte v3.44.1 */
    const file$5 = "node_modules/sveltestrap/src/ModalBody.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 9, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalBody', slots, ['default']);
    	let { class: className = '' } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classnames, className, classes });

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 4) {
    			$$invalidate(0, classes = classnames(className, 'modal-body'));
    		}
    	};

    	return [classes, $$restProps, className, $$scope, slots];
    }

    class ModalBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalBody",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/ModalHeader.svelte generated by Svelte v3.44.1 */
    const file$4 = "node_modules/sveltestrap/src/ModalHeader.svelte";
    const get_close_slot_changes = dirty => ({});
    const get_close_slot_context = ctx => ({});

    // (17:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(17:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if children}
    function create_if_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 4) set_data_dev(t, /*children*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(15:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if typeof toggle === 'function'}
    function create_if_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-close");
    			attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			add_location(button, file$4, 22, 6, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*toggle*/ ctx[0])) /*toggle*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*closeAriaLabel*/ 2) {
    				attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:4) {#if typeof toggle === 'function'}",
    		ctx
    	});

    	return block;
    }

    // (21:21)      
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let if_block = typeof /*toggle*/ ctx[0] === 'function' && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (typeof /*toggle*/ ctx[0] === 'function') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(21:21)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let h5;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*children*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const close_slot_template = /*#slots*/ ctx[7].close;
    	const close_slot = create_slot(close_slot_template, ctx, /*$$scope*/ ctx[6], get_close_slot_context);
    	const close_slot_or_fallback = close_slot || fallback_block(ctx);
    	let div_levels = [/*$$restProps*/ ctx[4], { class: /*classes*/ ctx[3] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			if_block.c();
    			t = space();
    			if (close_slot_or_fallback) close_slot_or_fallback.c();
    			attr_dev(h5, "class", "modal-title");
    			add_location(h5, file$4, 13, 2, 315);
    			set_attributes(div, div_data);
    			add_location(div, file$4, 12, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			if_blocks[current_block_type_index].m(h5, null);
    			append_dev(div, t);

    			if (close_slot_or_fallback) {
    				close_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(h5, null);
    			}

    			if (close_slot) {
    				if (close_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						close_slot,
    						close_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(close_slot_template, /*$$scope*/ ctx[6], dirty, get_close_slot_changes),
    						get_close_slot_context
    					);
    				}
    			} else {
    				if (close_slot_or_fallback && close_slot_or_fallback.p && (!current || dirty & /*closeAriaLabel, toggle*/ 3)) {
    					close_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 16 && /*$$restProps*/ ctx[4],
    				(!current || dirty & /*classes*/ 8) && { class: /*classes*/ ctx[3] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(close_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(close_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (close_slot_or_fallback) close_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","toggle","closeAriaLabel","children"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalHeader', slots, ['default','close']);
    	let { class: className = '' } = $$props;
    	let { toggle = undefined } = $$props;
    	let { closeAriaLabel = 'Close' } = $$props;
    	let { children = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(5, className = $$new_props.class);
    		if ('toggle' in $$new_props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ('closeAriaLabel' in $$new_props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ('children' in $$new_props) $$invalidate(2, children = $$new_props.children);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		toggle,
    		closeAriaLabel,
    		children,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(5, className = $$new_props.className);
    		if ('toggle' in $$props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ('closeAriaLabel' in $$props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ('children' in $$props) $$invalidate(2, children = $$new_props.children);
    		if ('classes' in $$props) $$invalidate(3, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 32) {
    			$$invalidate(3, classes = classnames(className, 'modal-header'));
    		}
    	};

    	return [
    		toggle,
    		closeAriaLabel,
    		children,
    		classes,
    		$$restProps,
    		className,
    		$$scope,
    		slots
    	];
    }

    class ModalHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 5,
    			toggle: 0,
    			closeAriaLabel: 1,
    			children: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalHeader",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeAriaLabel() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeAriaLabel(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<ModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<ModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Portal.svelte generated by Svelte v3.44.1 */
    const file$3 = "node_modules/sveltestrap/src/Portal.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let div_levels = [/*$$restProps*/ ctx[1]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$3, 18, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[4](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portal', slots, ['default']);
    	let ref;
    	let portal;

    	onMount(() => {
    		portal = document.createElement('div');
    		document.body.appendChild(portal);
    		portal.appendChild(ref);
    	});

    	onDestroy(() => {
    		if (typeof document !== 'undefined') {
    			document.body.removeChild(portal);
    		}
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onMount, onDestroy, ref, portal });

    	$$self.$inject_state = $$new_props => {
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ('portal' in $$props) portal = $$new_props.portal;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ref, $$restProps, $$scope, slots, div_binding];
    }

    class Portal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portal",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules/sveltestrap/src/Modal.svelte generated by Svelte v3.44.1 */

    const file$2 = "node_modules/sveltestrap/src/Modal.svelte";
    const get_external_slot_changes = dirty => ({});
    const get_external_slot_context = ctx => ({});

    // (216:0) {#if _isMounted}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*outer*/ ctx[13];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty[0] & /*wrapClassName, $$restProps, labelledBy, modalClassName, fade, staticModal, classes, _dialog, contentClassName, body, toggle, header, isOpen*/ 1071039 | dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*outer*/ ctx[13])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(216:0) {#if _isMounted}",
    		ctx
    	});

    	return block;
    }

    // (219:6) {#if isOpen}
    function create_if_block_2$1(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let current_block_type_index;
    	let if_block1;
    	let div0_class_value;
    	let div2_class_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const external_slot_template = /*#slots*/ ctx[30].external;
    	const external_slot = create_slot(external_slot_template, ctx, /*$$scope*/ ctx[34], get_external_slot_context);
    	let if_block0 = /*header*/ ctx[3] && create_if_block_4$1(ctx);
    	const if_block_creators = [create_if_block_3$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*body*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (external_slot) external_slot.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if_block1.c();
    			attr_dev(div0, "class", div0_class_value = classnames('modal-content', /*contentClassName*/ ctx[9]));
    			add_location(div0, file$2, 237, 12, 5557);
    			attr_dev(div1, "class", /*classes*/ ctx[14]);
    			attr_dev(div1, "role", "document");
    			add_location(div1, file$2, 236, 10, 5487);
    			attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[5]);

    			attr_dev(div2, "class", div2_class_value = classnames('modal', /*modalClassName*/ ctx[8], {
    				fade: /*fade*/ ctx[10],
    				'position-static': /*staticModal*/ ctx[0]
    			}));

    			attr_dev(div2, "role", "dialog");
    			add_location(div2, file$2, 219, 8, 4921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);

    			if (external_slot) {
    				external_slot.m(div2, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);
    			if_blocks[current_block_type_index].m(div0, null);
    			/*div1_binding*/ ctx[31](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "introstart", /*introstart_handler*/ ctx[32], false, false, false),
    					listen_dev(div2, "introend", /*onModalOpened*/ ctx[17], false, false, false),
    					listen_dev(div2, "outrostart", /*outrostart_handler*/ ctx[33], false, false, false),
    					listen_dev(div2, "outroend", /*onModalClosed*/ ctx[18], false, false, false),
    					listen_dev(div2, "click", /*handleBackdropClick*/ ctx[16], false, false, false),
    					listen_dev(div2, "mousedown", /*handleBackdropMouseDown*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (external_slot) {
    				if (external_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot_base(
    						external_slot,
    						external_slot_template,
    						ctx,
    						/*$$scope*/ ctx[34],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[34])
    						: get_slot_changes(external_slot_template, /*$$scope*/ ctx[34], dirty, get_external_slot_changes),
    						get_external_slot_context
    					);
    				}
    			}

    			if (/*header*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*header*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

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
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div0, null);
    			}

    			if (!current || dirty[0] & /*contentClassName*/ 512 && div0_class_value !== (div0_class_value = classnames('modal-content', /*contentClassName*/ ctx[9]))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*classes*/ 16384) {
    				attr_dev(div1, "class", /*classes*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*labelledBy*/ 32) {
    				attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*modalClassName, fade, staticModal*/ 1281 && div2_class_value !== (div2_class_value = classnames('modal', /*modalClassName*/ ctx[8], {
    				fade: /*fade*/ ctx[10],
    				'position-static': /*staticModal*/ ctx[0]
    			}))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(external_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				div2_intro = create_in_transition(div2, modalIn, {});
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(external_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, modalOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (external_slot) external_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			/*div1_binding*/ ctx[31](null);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(219:6) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (239:14) {#if header}
    function create_if_block_4$1(ctx) {
    	let modalheader;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				toggle: /*toggle*/ ctx[4],
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};
    			if (dirty[0] & /*toggle*/ 16) modalheader_changes.toggle = /*toggle*/ ctx[4];

    			if (dirty[0] & /*header*/ 8 | dirty[1] & /*$$scope*/ 8) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(239:14) {#if header}",
    		ctx
    	});

    	return block;
    }

    // (240:16) <ModalHeader {toggle}>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*header*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*header*/ 8) set_data_dev(t, /*header*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(240:16) <ModalHeader {toggle}>",
    		ctx
    	});

    	return block;
    }

    // (248:14) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[34],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[34])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[34], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(248:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:14) {#if body}
    function create_if_block_3$1(ctx) {
    	let modalbody;
    	let current;

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalbody_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(244:14) {#if body}",
    		ctx
    	});

    	return block;
    }

    // (245:16) <ModalBody>
    function create_default_slot_2$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[34],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[34])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[34], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(245:16) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (217:2) <svelte:component this={outer}>
    function create_default_slot_1$2(ctx) {
    	let div;
    	let current;
    	let if_block = /*isOpen*/ ctx[1] && create_if_block_2$1(ctx);

    	let div_levels = [
    		{ class: /*wrapClassName*/ ctx[7] },
    		{ tabindex: "-1" },
    		/*$$restProps*/ ctx[20]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			set_attributes(div, div_data);
    			add_location(div, file$2, 217, 4, 4835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*isOpen*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isOpen*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*wrapClassName*/ 128) && { class: /*wrapClassName*/ ctx[7] },
    				{ tabindex: "-1" },
    				dirty[0] & /*$$restProps*/ 1048576 && /*$$restProps*/ ctx[20]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(217:2) <svelte:component this={outer}>",
    		ctx
    	});

    	return block;
    }

    // (258:0) {#if backdrop && !staticModal}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*outer*/ ctx[13];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty[0] & /*fade, isOpen*/ 1026 | dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*outer*/ ctx[13])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(258:0) {#if backdrop && !staticModal}",
    		ctx
    	});

    	return block;
    }

    // (259:2) <svelte:component this={outer}>
    function create_default_slot$4(ctx) {
    	let modalbackdrop;
    	let current;

    	modalbackdrop = new ModalBackdrop({
    			props: {
    				fade: /*fade*/ ctx[10],
    				isOpen: /*isOpen*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalbackdrop.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalbackdrop, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalbackdrop_changes = {};
    			if (dirty[0] & /*fade*/ 1024) modalbackdrop_changes.fade = /*fade*/ ctx[10];
    			if (dirty[0] & /*isOpen*/ 2) modalbackdrop_changes.isOpen = /*isOpen*/ ctx[1];
    			modalbackdrop.$set(modalbackdrop_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalbackdrop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalbackdrop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalbackdrop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(259:2) <svelte:component this={outer}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*_isMounted*/ ctx[11] && create_if_block_1$1(ctx);
    	let if_block1 = /*backdrop*/ ctx[6] && !/*staticModal*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*_isMounted*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*_isMounted*/ 2048) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*backdrop*/ ctx[6] && !/*staticModal*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*backdrop, staticModal*/ 65) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let openCount = 0;
    const dialogBaseClass = 'modal-dialog';

    function instance$4($$self, $$props, $$invalidate) {
    	let classes;
    	let outer;

    	const omit_props_names = [
    		"class","static","isOpen","autoFocus","body","centered","container","fullscreen","header","scrollable","size","toggle","labelledBy","backdrop","wrapClassName","modalClassName","contentClassName","fade","unmountOnClose","returnFocusAfterClose"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['external','default']);
    	const dispatch = createEventDispatcher();
    	let { class: className = '' } = $$props;
    	let { static: staticModal = false } = $$props;
    	let { isOpen = false } = $$props;
    	let { autoFocus = true } = $$props;
    	let { body = false } = $$props;
    	let { centered = false } = $$props;
    	let { container = undefined } = $$props;
    	let { fullscreen = false } = $$props;
    	let { header = undefined } = $$props;
    	let { scrollable = false } = $$props;
    	let { size = '' } = $$props;
    	let { toggle = undefined } = $$props;
    	let { labelledBy = '' } = $$props;
    	let { backdrop = true } = $$props;
    	let { wrapClassName = '' } = $$props;
    	let { modalClassName = '' } = $$props;
    	let { contentClassName = '' } = $$props;
    	let { fade = true } = $$props;
    	let { unmountOnClose = true } = $$props;
    	let { returnFocusAfterClose = true } = $$props;
    	let hasOpened = false;
    	let _isMounted = false;
    	let _triggeringElement;
    	let _originalBodyPadding;
    	let _lastIsOpen = isOpen;
    	let _lastHasOpened = hasOpened;
    	let _dialog;
    	let _mouseDownElement;
    	let _removeEscListener;

    	onMount(() => {
    		if (isOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (hasOpened && autoFocus) {
    			setFocus();
    		}
    	});

    	onDestroy(() => {
    		destroy();

    		if (hasOpened) {
    			close();
    		}
    	});

    	afterUpdate(() => {
    		if (isOpen && !_lastIsOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (autoFocus && hasOpened && !_lastHasOpened) {
    			setFocus();
    		}

    		_lastIsOpen = isOpen;
    		_lastHasOpened = hasOpened;
    	});

    	function setFocus() {
    		if (_dialog && _dialog.parentNode && typeof _dialog.parentNode.focus === 'function') {
    			_dialog.parentNode.focus();
    		}
    	}

    	function init() {
    		try {
    			_triggeringElement = document.activeElement;
    		} catch(err) {
    			_triggeringElement = null;
    		}

    		if (!staticModal) {
    			_originalBodyPadding = getOriginalBodyPadding();
    			conditionallyUpdateScrollbar();

    			if (openCount === 0) {
    				document.body.className = classnames(document.body.className, 'modal-open');
    			}

    			++openCount;
    		}

    		$$invalidate(11, _isMounted = true);
    	}

    	function manageFocusAfterClose() {
    		if (_triggeringElement) {
    			if (typeof _triggeringElement.focus === 'function' && returnFocusAfterClose) {
    				_triggeringElement.focus();
    			}

    			_triggeringElement = null;
    		}
    	}

    	function destroy() {
    		manageFocusAfterClose();
    	}

    	function close() {
    		if (openCount <= 1) {
    			document.body.classList.remove('modal-open');
    		}

    		manageFocusAfterClose();
    		openCount = Math.max(0, openCount - 1);
    		setScrollbarWidth(_originalBodyPadding);
    	}

    	function handleBackdropClick(e) {
    		if (e.target === _mouseDownElement) {
    			e.stopPropagation();

    			if (!isOpen || !backdrop) {
    				return;
    			}

    			const backdropElem = _dialog ? _dialog.parentNode : null;

    			if (backdrop === true && backdropElem && e.target === backdropElem && toggle) {
    				toggle(e);
    			}
    		}
    	}

    	function onModalOpened() {
    		dispatch('open');

    		_removeEscListener = browserEvent(document, 'keydown', event => {
    			if (event.key && event.key === 'Escape') {
    				if (toggle && backdrop === true) toggle(event);
    			}
    		});
    	}

    	function onModalClosed() {
    		dispatch('close');

    		if (_removeEscListener) {
    			_removeEscListener();
    		}

    		if (unmountOnClose) {
    			destroy();
    		}

    		close();

    		if (_isMounted) {
    			hasOpened = false;
    		}

    		$$invalidate(11, _isMounted = false);
    	}

    	function handleBackdropMouseDown(e) {
    		_mouseDownElement = e.target;
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			_dialog = $$value;
    			$$invalidate(12, _dialog);
    		});
    	}

    	const introstart_handler = () => dispatch('opening');
    	const outrostart_handler = () => dispatch('closing');

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(20, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(21, className = $$new_props.class);
    		if ('static' in $$new_props) $$invalidate(0, staticModal = $$new_props.static);
    		if ('isOpen' in $$new_props) $$invalidate(1, isOpen = $$new_props.isOpen);
    		if ('autoFocus' in $$new_props) $$invalidate(22, autoFocus = $$new_props.autoFocus);
    		if ('body' in $$new_props) $$invalidate(2, body = $$new_props.body);
    		if ('centered' in $$new_props) $$invalidate(23, centered = $$new_props.centered);
    		if ('container' in $$new_props) $$invalidate(24, container = $$new_props.container);
    		if ('fullscreen' in $$new_props) $$invalidate(25, fullscreen = $$new_props.fullscreen);
    		if ('header' in $$new_props) $$invalidate(3, header = $$new_props.header);
    		if ('scrollable' in $$new_props) $$invalidate(26, scrollable = $$new_props.scrollable);
    		if ('size' in $$new_props) $$invalidate(27, size = $$new_props.size);
    		if ('toggle' in $$new_props) $$invalidate(4, toggle = $$new_props.toggle);
    		if ('labelledBy' in $$new_props) $$invalidate(5, labelledBy = $$new_props.labelledBy);
    		if ('backdrop' in $$new_props) $$invalidate(6, backdrop = $$new_props.backdrop);
    		if ('wrapClassName' in $$new_props) $$invalidate(7, wrapClassName = $$new_props.wrapClassName);
    		if ('modalClassName' in $$new_props) $$invalidate(8, modalClassName = $$new_props.modalClassName);
    		if ('contentClassName' in $$new_props) $$invalidate(9, contentClassName = $$new_props.contentClassName);
    		if ('fade' in $$new_props) $$invalidate(10, fade = $$new_props.fade);
    		if ('unmountOnClose' in $$new_props) $$invalidate(28, unmountOnClose = $$new_props.unmountOnClose);
    		if ('returnFocusAfterClose' in $$new_props) $$invalidate(29, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ('$$scope' in $$new_props) $$invalidate(34, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		openCount,
    		classnames,
    		browserEvent,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		afterUpdate,
    		modalIn,
    		modalOut,
    		InlineContainer,
    		ModalBackdrop,
    		ModalBody,
    		ModalHeader,
    		Portal,
    		conditionallyUpdateScrollbar,
    		getOriginalBodyPadding,
    		setScrollbarWidth,
    		dispatch,
    		className,
    		staticModal,
    		isOpen,
    		autoFocus,
    		body,
    		centered,
    		container,
    		fullscreen,
    		header,
    		scrollable,
    		size,
    		toggle,
    		labelledBy,
    		backdrop,
    		wrapClassName,
    		modalClassName,
    		contentClassName,
    		fade,
    		unmountOnClose,
    		returnFocusAfterClose,
    		hasOpened,
    		_isMounted,
    		_triggeringElement,
    		_originalBodyPadding,
    		_lastIsOpen,
    		_lastHasOpened,
    		_dialog,
    		_mouseDownElement,
    		_removeEscListener,
    		setFocus,
    		init,
    		manageFocusAfterClose,
    		destroy,
    		close,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		dialogBaseClass,
    		outer,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(21, className = $$new_props.className);
    		if ('staticModal' in $$props) $$invalidate(0, staticModal = $$new_props.staticModal);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$new_props.isOpen);
    		if ('autoFocus' in $$props) $$invalidate(22, autoFocus = $$new_props.autoFocus);
    		if ('body' in $$props) $$invalidate(2, body = $$new_props.body);
    		if ('centered' in $$props) $$invalidate(23, centered = $$new_props.centered);
    		if ('container' in $$props) $$invalidate(24, container = $$new_props.container);
    		if ('fullscreen' in $$props) $$invalidate(25, fullscreen = $$new_props.fullscreen);
    		if ('header' in $$props) $$invalidate(3, header = $$new_props.header);
    		if ('scrollable' in $$props) $$invalidate(26, scrollable = $$new_props.scrollable);
    		if ('size' in $$props) $$invalidate(27, size = $$new_props.size);
    		if ('toggle' in $$props) $$invalidate(4, toggle = $$new_props.toggle);
    		if ('labelledBy' in $$props) $$invalidate(5, labelledBy = $$new_props.labelledBy);
    		if ('backdrop' in $$props) $$invalidate(6, backdrop = $$new_props.backdrop);
    		if ('wrapClassName' in $$props) $$invalidate(7, wrapClassName = $$new_props.wrapClassName);
    		if ('modalClassName' in $$props) $$invalidate(8, modalClassName = $$new_props.modalClassName);
    		if ('contentClassName' in $$props) $$invalidate(9, contentClassName = $$new_props.contentClassName);
    		if ('fade' in $$props) $$invalidate(10, fade = $$new_props.fade);
    		if ('unmountOnClose' in $$props) $$invalidate(28, unmountOnClose = $$new_props.unmountOnClose);
    		if ('returnFocusAfterClose' in $$props) $$invalidate(29, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ('hasOpened' in $$props) hasOpened = $$new_props.hasOpened;
    		if ('_isMounted' in $$props) $$invalidate(11, _isMounted = $$new_props._isMounted);
    		if ('_triggeringElement' in $$props) _triggeringElement = $$new_props._triggeringElement;
    		if ('_originalBodyPadding' in $$props) _originalBodyPadding = $$new_props._originalBodyPadding;
    		if ('_lastIsOpen' in $$props) _lastIsOpen = $$new_props._lastIsOpen;
    		if ('_lastHasOpened' in $$props) _lastHasOpened = $$new_props._lastHasOpened;
    		if ('_dialog' in $$props) $$invalidate(12, _dialog = $$new_props._dialog);
    		if ('_mouseDownElement' in $$props) _mouseDownElement = $$new_props._mouseDownElement;
    		if ('_removeEscListener' in $$props) _removeEscListener = $$new_props._removeEscListener;
    		if ('outer' in $$props) $$invalidate(13, outer = $$new_props.outer);
    		if ('classes' in $$props) $$invalidate(14, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*className, size, fullscreen, centered, scrollable*/ 245366784) {
    			$$invalidate(14, classes = classnames(dialogBaseClass, className, {
    				[`modal-${size}`]: size,
    				'modal-fullscreen': fullscreen === true,
    				[`modal-fullscreen-${fullscreen}-down`]: fullscreen && typeof fullscreen === 'string',
    				[`${dialogBaseClass}-centered`]: centered,
    				[`${dialogBaseClass}-scrollable`]: scrollable
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*container, staticModal*/ 16777217) {
    			$$invalidate(13, outer = container === 'inline' || staticModal
    			? InlineContainer
    			: Portal);
    		}
    	};

    	return [
    		staticModal,
    		isOpen,
    		body,
    		header,
    		toggle,
    		labelledBy,
    		backdrop,
    		wrapClassName,
    		modalClassName,
    		contentClassName,
    		fade,
    		_isMounted,
    		_dialog,
    		outer,
    		classes,
    		dispatch,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		$$restProps,
    		className,
    		autoFocus,
    		centered,
    		container,
    		fullscreen,
    		scrollable,
    		size,
    		unmountOnClose,
    		returnFocusAfterClose,
    		slots,
    		div1_binding,
    		introstart_handler,
    		outrostart_handler,
    		$$scope
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				class: 21,
    				static: 0,
    				isOpen: 1,
    				autoFocus: 22,
    				body: 2,
    				centered: 23,
    				container: 24,
    				fullscreen: 25,
    				header: 3,
    				scrollable: 26,
    				size: 27,
    				toggle: 4,
    				labelledBy: 5,
    				backdrop: 6,
    				wrapClassName: 7,
    				modalClassName: 8,
    				contentClassName: 9,
    				fade: 10,
    				unmountOnClose: 28,
    				returnFocusAfterClose: 29
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoFocus() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoFocus(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get body() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set body(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get container() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollable() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollable(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelledBy() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelledBy(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdrop() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdrop(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentClassName() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentClassName(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unmountOnClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unmountOnClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get returnFocusAfterClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set returnFocusAfterClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var TLDs = "(AAA|AARP|ABARTH|ABB|ABBOTT|ABBVIE|ABC|ABLE|ABOGADO|ABUDHABI|AC|ACADEMY|ACCENTURE|ACCOUNTANT|ACCOUNTANTS|ACO|ACTOR|AD|ADAC|ADS|ADULT|AE|AEG|AERO|AETNA|AF|AFAMILYCOMPANY|AFL|AFRICA|AG|AGAKHAN|AGENCY|AI|AIG|AIGO|AIRBUS|AIRFORCE|AIRTEL|AKDN|AL|ALFAROMEO|ALIBABA|ALIPAY|ALLFINANZ|ALLSTATE|ALLY|ALSACE|ALSTOM|AM|AMERICANEXPRESS|AMERICANFAMILY|AMEX|AMFAM|AMICA|AMSTERDAM|ANALYTICS|ANDROID|ANQUAN|ANZ|AO|AOL|APARTMENTS|APP|APPLE|AQ|AQUARELLE|AR|ARAB|ARAMCO|ARCHI|ARMY|ARPA|ART|ARTE|AS|ASDA|ASIA|ASSOCIATES|AT|ATHLETA|ATTORNEY|AU|AUCTION|AUDI|AUDIBLE|AUDIO|AUSPOST|AUTHOR|AUTO|AUTOS|AVIANCA|AW|AWS|AX|AXA|AZ|AZURE|BA|BABY|BAIDU|BANAMEX|BANANAREPUBLIC|BAND|BANK|BAR|BARCELONA|BARCLAYCARD|BARCLAYS|BAREFOOT|BARGAINS|BASEBALL|BASKETBALL|BAUHAUS|BAYERN|BB|BBC|BBT|BBVA|BCG|BCN|BD|BE|BEATS|BEAUTY|BEER|BENTLEY|BERLIN|BEST|BESTBUY|BET|BF|BG|BH|BHARTI|BI|BIBLE|BID|BIKE|BING|BINGO|BIO|BIZ|BJ|BLACK|BLACKFRIDAY|BLOCKBUSTER|BLOG|BLOOMBERG|BLUE|BM|BMS|BMW|BN|BNPPARIBAS|BO|BOATS|BOEHRINGER|BOFA|BOM|BOND|BOO|BOOK|BOOKING|BOSCH|BOSTIK|BOSTON|BOT|BOUTIQUE|BOX|BR|BRADESCO|BRIDGESTONE|BROADWAY|BROKER|BROTHER|BRUSSELS|BS|BT|BUDAPEST|BUGATTI|BUILD|BUILDERS|BUSINESS|BUY|BUZZ|BV|BW|BY|BZ|BZH|CA|CAB|CAFE|CAL|CALL|CALVINKLEIN|CAM|CAMERA|CAMP|CANCERRESEARCH|CANON|CAPETOWN|CAPITAL|CAPITALONE|CAR|CARAVAN|CARDS|CARE|CAREER|CAREERS|CARS|CASA|CASE|CASEIH|CASH|CASINO|CAT|CATERING|CATHOLIC|CBA|CBN|CBRE|CBS|CC|CD|CEB|CENTER|CEO|CERN|CF|CFA|CFD|CG|CH|CHANEL|CHANNEL|CHARITY|CHASE|CHAT|CHEAP|CHINTAI|CHRISTMAS|CHROME|CHURCH|CI|CIPRIANI|CIRCLE|CISCO|CITADEL|CITI|CITIC|CITY|CITYEATS|CK|CL|CLAIMS|CLEANING|CLICK|CLINIC|CLINIQUE|CLOTHING|CLOUD|CLUB|CLUBMED|CM|CN|CO|COACH|CODES|COFFEE|COLLEGE|COLOGNE|COM|COMCAST|COMMBANK|COMMUNITY|COMPANY|COMPARE|COMPUTER|COMSEC|CONDOS|CONSTRUCTION|CONSULTING|CONTACT|CONTRACTORS|COOKING|COOKINGCHANNEL|COOL|COOP|CORSICA|COUNTRY|COUPON|COUPONS|COURSES|CPA|CR|CREDIT|CREDITCARD|CREDITUNION|CRICKET|CROWN|CRS|CRUISE|CRUISES|CSC|CU|CUISINELLA|CV|CW|CX|CY|CYMRU|CYOU|CZ|DABUR|DAD|DANCE|DATA|DATE|DATING|DATSUN|DAY|DCLK|DDS|DE|DEAL|DEALER|DEALS|DEGREE|DELIVERY|DELL|DELOITTE|DELTA|DEMOCRAT|DENTAL|DENTIST|DESI|DESIGN|DEV|DHL|DIAMONDS|DIET|DIGITAL|DIRECT|DIRECTORY|DISCOUNT|DISCOVER|DISH|DIY|DJ|DK|DM|DNP|DO|DOCS|DOCTOR|DOG|DOMAINS|DOT|DOWNLOAD|DRIVE|DTV|DUBAI|DUCK|DUNLOP|DUPONT|DURBAN|DVAG|DVR|DZ|EARTH|EAT|EC|ECO|EDEKA|EDU|EDUCATION|EE|EG|EMAIL|EMERCK|ENERGY|ENGINEER|ENGINEERING|ENTERPRISES|EPSON|EQUIPMENT|ER|ERICSSON|ERNI|ES|ESQ|ESTATE|ESURANCE|ET|ETISALAT|EU|EUROVISION|EUS|EVENTS|EXCHANGE|EXPERT|EXPOSED|EXPRESS|EXTRASPACE|FAGE|FAIL|FAIRWINDS|FAITH|FAMILY|FAN|FANS|FARM|FARMERS|FASHION|FAST|FEDEX|FEEDBACK|FERRARI|FERRERO|FI|FIAT|FIDELITY|FIDO|FILM|FINAL|FINANCE|FINANCIAL|FIRE|FIRESTONE|FIRMDALE|FISH|FISHING|FIT|FITNESS|FJ|FK|FLICKR|FLIGHTS|FLIR|FLORIST|FLOWERS|FLY|FM|FO|FOO|FOOD|FOODNETWORK|FOOTBALL|FORD|FOREX|FORSALE|FORUM|FOUNDATION|FOX|FR|FREE|FRESENIUS|FRL|FROGANS|FRONTDOOR|FRONTIER|FTR|FUJITSU|FUJIXEROX|FUN|FUND|FURNITURE|FUTBOL|FYI|GA|GAL|GALLERY|GALLO|GALLUP|GAME|GAMES|GAP|GARDEN|GAY|GB|GBIZ|GD|GDN|GE|GEA|GENT|GENTING|GEORGE|GF|GG|GGEE|GH|GI|GIFT|GIFTS|GIVES|GIVING|GL|GLADE|GLASS|GLE|GLOBAL|GLOBO|GM|GMAIL|GMBH|GMO|GMX|GN|GODADDY|GOLD|GOLDPOINT|GOLF|GOO|GOODYEAR|GOOG|GOOGLE|GOP|GOT|GOV|GP|GQ|GR|GRAINGER|GRAPHICS|GRATIS|GREEN|GRIPE|GROCERY|GROUP|GS|GT|GU|GUARDIAN|GUCCI|GUGE|GUIDE|GUITARS|GURU|GW|GY|HAIR|HAMBURG|HANGOUT|HAUS|HBO|HDFC|HDFCBANK|HEALTH|HEALTHCARE|HELP|HELSINKI|HERE|HERMES|HGTV|HIPHOP|HISAMITSU|HITACHI|HIV|HK|HKT|HM|HN|HOCKEY|HOLDINGS|HOLIDAY|HOMEDEPOT|HOMEGOODS|HOMES|HOMESENSE|HONDA|HORSE|HOSPITAL|HOST|HOSTING|HOT|HOTELES|HOTELS|HOTMAIL|HOUSE|HOW|HR|HSBC|HT|HU|HUGHES|HYATT|HYUNDAI|IBM|ICBC|ICE|ICU|ID|IE|IEEE|IFM|IKANO|IL|IM|IMAMAT|IMDB|IMMO|IMMOBILIEN|IN|INC|INDUSTRIES|INFINITI|INFO|ING|INK|INSTITUTE|INSURANCE|INSURE|INT|INTEL|INTERNATIONAL|INTUIT|INVESTMENTS|IO|IPIRANGA|IQ|IR|IRISH|IS|ISMAILI|IST|ISTANBUL|IT|ITAU|ITV|IVECO|JAGUAR|JAVA|JCB|JCP|JE|JEEP|JETZT|JEWELRY|JIO|JLL|JM|JMP|JNJ|JO|JOBS|JOBURG|JOT|JOY|JP|JPMORGAN|JPRS|JUEGOS|JUNIPER|KAUFEN|KDDI|KE|KERRYHOTELS|KERRYLOGISTICS|KERRYPROPERTIES|KFH|KG|KH|KI|KIA|KIM|KINDER|KINDLE|KITCHEN|KIWI|KM|KN|KOELN|KOMATSU|KOSHER|KP|KPMG|KPN|KR|KRD|KRED|KUOKGROUP|KW|KY|KYOTO|KZ|LA|LACAIXA|LAMBORGHINI|LAMER|LANCASTER|LANCIA|LAND|LANDROVER|LANXESS|LASALLE|LAT|LATINO|LATROBE|LAW|LAWYER|LB|LC|LDS|LEASE|LECLERC|LEFRAK|LEGAL|LEGO|LEXUS|LGBT|LI|LIDL|LIFE|LIFEINSURANCE|LIFESTYLE|LIGHTING|LIKE|LILLY|LIMITED|LIMO|LINCOLN|LINDE|LINK|LIPSY|LIVE|LIVING|LIXIL|LK|LLC|LLP|LOAN|LOANS|LOCKER|LOCUS|LOFT|LOL|LONDON|LOTTE|LOTTO|LOVE|LPL|LPLFINANCIAL|LR|LS|LT|LTD|LTDA|LU|LUNDBECK|LUPIN|LUXE|LUXURY|LV|LY|MA|MACYS|MADRID|MAIF|MAISON|MAKEUP|MAN|MANAGEMENT|MANGO|MAP|MARKET|MARKETING|MARKETS|MARRIOTT|MARSHALLS|MASERATI|MATTEL|MBA|MC|MCKINSEY|MD|ME|MED|MEDIA|MEET|MELBOURNE|MEME|MEMORIAL|MEN|MENU|MERCKMSD|METLIFE|MG|MH|MIAMI|MICROSOFT|MIL|MINI|MINT|MIT|MITSUBISHI|MK|ML|MLB|MLS|MM|MMA|MN|MO|MOBI|MOBILE|MODA|MOE|MOI|MOM|MONASH|MONEY|MONSTER|MORMON|MORTGAGE|MOSCOW|MOTO|MOTORCYCLES|MOV|MOVIE|MP|MQ|MR|MS|MSD|MT|MTN|MTR|MU|MUSEUM|MUTUAL|MV|MW|MX|MY|MZ|NA|NAB|NAGOYA|NAME|NATIONWIDE|NATURA|NAVY|NBA|NC|NE|NEC|NET|NETBANK|NETFLIX|NETWORK|NEUSTAR|NEW|NEWHOLLAND|NEWS|NEXT|NEXTDIRECT|NEXUS|NF|NFL|NG|NGO|NHK|NI|NICO|NIKE|NIKON|NINJA|NISSAN|NISSAY|NL|NO|NOKIA|NORTHWESTERNMUTUAL|NORTON|NOW|NOWRUZ|NOWTV|NP|NR|NRA|NRW|NTT|NU|NYC|NZ|OBI|OBSERVER|OFF|OFFICE|OKINAWA|OLAYAN|OLAYANGROUP|OLDNAVY|OLLO|OM|OMEGA|ONE|ONG|ONL|ONLINE|ONYOURSIDE|OOO|OPEN|ORACLE|ORANGE|ORG|ORGANIC|ORIGINS|OSAKA|OTSUKA|OTT|OVH|PA|PAGE|PANASONIC|PARIS|PARS|PARTNERS|PARTS|PARTY|PASSAGENS|PAY|PCCW|PE|PET|PF|PFIZER|PG|PH|PHARMACY|PHD|PHILIPS|PHONE|PHOTO|PHOTOGRAPHY|PHOTOS|PHYSIO|PICS|PICTET|PICTURES|PID|PIN|PING|PINK|PIONEER|PIZZA|PK|PL|PLACE|PLAY|PLAYSTATION|PLUMBING|PLUS|PM|PN|PNC|POHL|POKER|POLITIE|PORN|POST|PR|PRAMERICA|PRAXI|PRESS|PRIME|PRO|PROD|PRODUCTIONS|PROF|PROGRESSIVE|PROMO|PROPERTIES|PROPERTY|PROTECTION|PRU|PRUDENTIAL|PS|PT|PUB|PW|PWC|PY|QA|QPON|QUEBEC|QUEST|QVC|RACING|RADIO|RAID|RE|READ|REALESTATE|REALTOR|REALTY|RECIPES|RED|REDSTONE|REDUMBRELLA|REHAB|REISE|REISEN|REIT|RELIANCE|REN|RENT|RENTALS|REPAIR|REPORT|REPUBLICAN|REST|RESTAURANT|REVIEW|REVIEWS|REXROTH|RICH|RICHARDLI|RICOH|RIGHTATHOME|RIL|RIO|RIP|RMIT|RO|ROCHER|ROCKS|RODEO|ROGERS|ROOM|RS|RSVP|RU|RUGBY|RUHR|RUN|RW|RWE|RYUKYU|SA|SAARLAND|SAFE|SAFETY|SAKURA|SALE|SALON|SAMSCLUB|SAMSUNG|SANDVIK|SANDVIKCOROMANT|SANOFI|SAP|SARL|SAS|SAVE|SAXO|SB|SBI|SBS|SC|SCA|SCB|SCHAEFFLER|SCHMIDT|SCHOLARSHIPS|SCHOOL|SCHULE|SCHWARZ|SCIENCE|SCJOHNSON|SCOR|SCOT|SD|SE|SEARCH|SEAT|SECURE|SECURITY|SEEK|SELECT|SENER|SERVICES|SES|SEVEN|SEW|SEX|SEXY|SFR|SG|SH|SHANGRILA|SHARP|SHAW|SHELL|SHIA|SHIKSHA|SHOES|SHOP|SHOPPING|SHOUJI|SHOW|SHOWTIME|SHRIRAM|SI|SILK|SINA|SINGLES|SITE|SJ|SK|SKI|SKIN|SKY|SKYPE|SL|SLING|SM|SMART|SMILE|SN|SNCF|SO|SOCCER|SOCIAL|SOFTBANK|SOFTWARE|SOHU|SOLAR|SOLUTIONS|SONG|SONY|SOY|SPACE|SPORT|SPOT|SPREADBETTING|SR|SRL|SS|ST|STADA|STAPLES|STAR|STATEBANK|STATEFARM|STC|STCGROUP|STOCKHOLM|STORAGE|STORE|STREAM|STUDIO|STUDY|STYLE|SU|SUCKS|SUPPLIES|SUPPLY|SUPPORT|SURF|SURGERY|SUZUKI|SV|SWATCH|SWIFTCOVER|SWISS|SX|SY|SYDNEY|SYMANTEC|SYSTEMS|SZ|TAB|TAIPEI|TALK|TAOBAO|TARGET|TATAMOTORS|TATAR|TATTOO|TAX|TAXI|TC|TCI|TD|TDK|TEAM|TECH|TECHNOLOGY|TEL|TEMASEK|TENNIS|TEVA|TF|TG|TH|THD|THEATER|THEATRE|TIAA|TICKETS|TIENDA|TIFFANY|TIPS|TIRES|TIROL|TJ|TJMAXX|TJX|TK|TKMAXX|TL|TM|TMALL|TN|TO|TODAY|TOKYO|TOOLS|TOP|TORAY|TOSHIBA|TOTAL|TOURS|TOWN|TOYOTA|TOYS|TR|TRADE|TRADING|TRAINING|TRAVEL|TRAVELCHANNEL|TRAVELERS|TRAVELERSINSURANCE|TRUST|TRV|TT|TUBE|TUI|TUNES|TUSHU|TV|TVS|TW|TZ|UA|UBANK|UBS|UG|UK|UNICOM|UNIVERSITY|UNO|UOL|UPS|US|UY|UZ|VA|VACATIONS|VANA|VANGUARD|VC|VE|VEGAS|VENTURES|VERISIGN|VERSICHERUNG|VET|VG|VI|VIAJES|VIDEO|VIG|VIKING|VILLAS|VIN|VIP|VIRGIN|VISA|VISION|VIVA|VIVO|VLAANDEREN|VN|VODKA|VOLKSWAGEN|VOLVO|VOTE|VOTING|VOTO|VOYAGE|VU|VUELOS|WALES|WALMART|WALTER|WANG|WANGGOU|WATCH|WATCHES|WEATHER|WEATHERCHANNEL|WEBCAM|WEBER|WEBSITE|WED|WEDDING|WEIBO|WEIR|WF|WHOSWHO|WIEN|WIKI|WILLIAMHILL|WIN|WINDOWS|WINE|WINNERS|WME|WOLTERSKLUWER|WOODSIDE|WORK|WORKS|WORLD|WOW|WS|WTC|WTF|XBOX|XEROX|XFINITY|XIHUAN|XIN|XN--11B4C3D|XN--1CK2E1B|XN--1QQW23A|XN--2SCRJ9C|XN--30RR7Y|XN--3BST00M|XN--3DS443G|XN--3E0B707E|XN--3HCRJ9C|XN--3OQ18VL8PN36A|XN--3PXU8K|XN--42C2D9A|XN--45BR5CYL|XN--45BRJ9C|XN--45Q11C|XN--4GBRIM|XN--54B7FTA0CC|XN--55QW42G|XN--55QX5D|XN--5SU34J936BGSG|XN--5TZM5G|XN--6FRZ82G|XN--6QQ986B3XL|XN--80ADXHKS|XN--80AO21A|XN--80AQECDR1A|XN--80ASEHDB|XN--80ASWG|XN--8Y0A063A|XN--90A3AC|XN--90AE|XN--90AIS|XN--9DBQ2A|XN--9ET52U|XN--9KRT00A|XN--B4W605FERD|XN--BCK1B9A5DRE4C|XN--C1AVG|XN--C2BR7G|XN--CCK2B3B|XN--CG4BKI|XN--CLCHC0EA0B2G2A9GCD|XN--CZR694B|XN--CZRS0T|XN--CZRU2D|XN--D1ACJ3B|XN--D1ALF|XN--E1A4C|XN--ECKVDTC9D|XN--EFVY88H|XN--FCT429K|XN--FHBEI|XN--FIQ228C5HS|XN--FIQ64B|XN--FIQS8S|XN--FIQZ9S|XN--FJQ720A|XN--FLW351E|XN--FPCRJ9C3D|XN--FZC2C9E2C|XN--FZYS8D69UVGM|XN--G2XX48C|XN--GCKR3F0F|XN--GECRJ9C|XN--GK3AT1E|XN--H2BREG3EVE|XN--H2BRJ9C|XN--H2BRJ9C8C|XN--HXT814E|XN--I1B6B1A6A2E|XN--IMR513N|XN--IO0A7I|XN--J1AEF|XN--J1AMH|XN--J6W193G|XN--JLQ61U9W7B|XN--JVR189M|XN--KCRX77D1X4A|XN--KPRW13D|XN--KPRY57D|XN--KPU716F|XN--KPUT3I|XN--L1ACC|XN--LGBBAT1AD8J|XN--MGB9AWBF|XN--MGBA3A3EJT|XN--MGBA3A4F16A|XN--MGBA7C0BBN0A|XN--MGBAAKC7DVF|XN--MGBAAM7A8H|XN--MGBAB2BD|XN--MGBAH1A3HJKRD|XN--MGBAI9AZGQP6J|XN--MGBAYH7GPA|XN--MGBBH1A|XN--MGBBH1A71E|XN--MGBC0A9AZCG|XN--MGBCA7DZDO|XN--MGBCPQ6GPA1A|XN--MGBERP4A5D4AR|XN--MGBGU82A|XN--MGBI4ECEXP|XN--MGBPL2FH|XN--MGBT3DHD|XN--MGBTX2B|XN--MGBX4CD0AB|XN--MIX891F|XN--MK1BU44C|XN--MXTQ1M|XN--NGBC5AZD|XN--NGBE9E0A|XN--NGBRX|XN--NODE|XN--NQV7F|XN--NQV7FS00EMA|XN--NYQY26A|XN--O3CW4H|XN--OGBPF8FL|XN--OTU796D|XN--P1ACF|XN--P1AI|XN--PBT977C|XN--PGBS0DH|XN--PSSY2U|XN--Q7CE6A|XN--Q9JYB4C|XN--QCKA1PMC|XN--QXA6A|XN--QXAM|XN--RHQV96G|XN--ROVU88B|XN--RVC1E0AM3E|XN--S9BRJ9C|XN--SES554G|XN--T60B56A|XN--TCKWE|XN--TIQ49XQYJ|XN--UNUP4Y|XN--VERMGENSBERATER-CTB|XN--VERMGENSBERATUNG-PWB|XN--VHQUV|XN--VUQ861B|XN--W4R85EL8FHU5DNRA|XN--W4RS40L|XN--WGBH1C|XN--WGBL6A|XN--XHQ521B|XN--XKC2AL3HYE2A|XN--XKC2DL3A5EE0H|XN--Y9A3AQ|XN--YFRO4I67O|XN--YGBI2AMMX|XN--ZFR164B|XXX|XYZ|YACHTS|YAHOO|YAMAXUN|YANDEX|YE|YODOBASHI|YOGA|YOKOHAMA|YOU|YOUTUBE|YT|YUN|ZA|ZAPPOS|ZARA|ZERO|ZIP|ZM|ZONE|ZUERICH|ZW|TEST)";

    var tlds = /*#__PURE__*/Object.defineProperty({
    	TLDs: TLDs
    }, '__esModule', {value: true});

    var dictionary = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.openingParenthesis = "([\"'{";
    exports.closingParenthesis = ")]\"'}";
    exports.parenthesis = exports.openingParenthesis
        .split("")
        .map(function (x, i) { return "" + x + exports.closingParenthesis.charAt(i); });
    exports.htmlAttributes = [
        "src",
        "data",
        "href",
        "cite",
        "formaction",
        "icon",
        "manifest",
        "poster",
        "codebase",
        "background",
        "profile",
        "usemap",
        "itemtype",
        "action",
        "longdesc",
        "classid",
        "archive"
    ];
    exports.nonLatinAlphabetRanges = "\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5\\u1CF6\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6E5\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC";
    exports.TLDs = tlds.TLDs;
    });

    function applyOption(string, props, option) {
        // conditional
        if (typeof option === "function") {
            return option(string, props);
        }
        // all
        else {
            return option;
        }
    }
    function transform(input, options) {
        var protocol = "";
        var truncation = Infinity;
        var attributes = {};
        var truncateFromTheMiddle = false;
        // special transformation
        if (options && options.specialTransform) {
            for (var index = 0; index < options.specialTransform.length; index++) {
                var transformer = options.specialTransform[index];
                if (transformer.test.test(input.string)) {
                    return transformer.transform(input.string, input);
                }
            }
        }
        // exclude
        if (options && options.exclude) {
            if (applyOption(input.string, input, options.exclude))
                return input.string;
        }
        // protocol
        if (options && options.protocol) {
            protocol = applyOption(input.string, input, options.protocol);
        }
        if (input.protocol) {
            protocol = "";
        }
        else if (!protocol) {
            protocol = input.isEmail
                ? "mailto:"
                : input.isFile
                    ? "file:///"
                    : "http://";
        }
        // truncation
        if (options && options.truncate) {
            truncation = applyOption(input.string, input, options.truncate);
        }
        if (options && options.middleTruncation) {
            truncateFromTheMiddle = applyOption(input.string, input, options.middleTruncation);
        }
        // attributes
        if (options && options.attributes) {
            attributes = applyOption(input.string, input, options.attributes);
        }
        return "<a " + Object.keys(attributes)
            .map(function (key) {
            return attributes[key] === true ? key : key + "=\"" + attributes[key] + "\" ";
        })
            .join(" ") + "href=\"" + protocol + input.string + "\">" + (input.string.length > truncation
            ? truncateFromTheMiddle
                ? input.string.substring(0, Math.floor(truncation / 2)) +
                    "…" +
                    input.string.substring(input.string.length - Math.ceil(truncation / 2), input.string.length)
                : input.string.substring(0, truncation) + "…"
            : input.string) + "</a>";
    }
    var transform_2 = transform;

    var transform_1 = /*#__PURE__*/Object.defineProperty({
    	transform: transform_2
    }, '__esModule', {value: true});

    var regex = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var email_address = "([a-z0-9!#$%&'*+=?^_`{|}~-]+(\\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*)";
    var domainWithTLD = "([a-z0-9]+(-+[a-z0-9]+)*\\.)+(" + dictionary.TLDs + ")";
    var domainWithAnyTLD = "([a-z0-9]+(-+[a-z0-9]+)*\\.)+([a-z0-9][a-z0-9-]{0," + (Math.max.apply(commonjsGlobal, dictionary.TLDs.split("|").map(function (x) { return x.length; })) - 2) + "}[a-z0-9])";
    var allowedInPath = "a-zA-Z\\d\\-._~\\!$&*+,;=:@%'\"\\[\\]()";
    var path = "(((\\/(([" + allowedInPath + "]+(\\/[" + allowedInPath + "]*)*))?)?)((\\?([" + allowedInPath + "\\/?]*))?)((\\#([" + allowedInPath + "\\/?]*))?))?";
    var ipv4 = "((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
    var ipv6 = "\\[(([a-f0-9:]+:+)+[a-f0-9]+)\\]";
    var port = "(:(\\d{1,5}))?";
    var protocol = "(https?:|ftps?:)\\/\\/";
    var confirmedByProtocol = "(" + protocol + ")\\S+";
    var additionalSlashes = "(([\\/]?))+";
    var fqdn = "(((" + protocol + ")?(" + domainWithTLD + "|" + ipv4 + "|(" + protocol + ")(" + ipv6 + "|" + domainWithAnyTLD + "))(?!@\\w)" + port + ")|(" + confirmedByProtocol + "))";
    var nonLatinMatches = fqdn + "((((\\/(([" + allowedInPath + "]+(\\/[" + allowedInPath + dictionary.nonLatinAlphabetRanges + "]*)*))?)?)((\\?([" + allowedInPath + "\\/?]*))?)((\\#([" + allowedInPath + "\\/?]*))?))?\\b((([" + allowedInPath + "\\/" + dictionary.nonLatinAlphabetRanges + "][a-zA-Z\\d\\-_~+=\\/" + dictionary.nonLatinAlphabetRanges + "]+)?))+)";
    exports.email = "\\b(mailto:)?" + email_address + "@(" + domainWithTLD + "|" + ipv4 + ")\\b";
    exports.url = "(" + nonLatinMatches + ")|(\\b" + fqdn + path + "\\b" + additionalSlashes + ")";
    exports.file = "(file:\\/\\/\\/)([a-z]+:(\\/|\\\\)+)?([\\w.]+([\\/\\\\]?)+)+";
    exports.final = "(" + exports.url + ")|(" + exports.email + ")|(" + exports.file + ")";
    exports.finalRegex = new RegExp(exports.final, "gi");
    // for validation purposes
    exports.ipRegex = new RegExp("^(" + ipv4 + "|" + ipv6 + ")$", "i");
    exports.emailRegex = new RegExp("^(" + exports.email + ")$", "i");
    exports.fileRegex = new RegExp("^(" + exports.file + ")$", "i");
    exports.urlRegex = new RegExp("^(" + exports.url + ")$", "i");
    // identifying parts of the link
    var iidxes = {
        isURL: 0,
        isEmail: 0,
        isFile: 0,
        file: {
            fileName: 0,
            protocol: 0,
        },
        email: {
            protocol: 0,
            local: 0,
            host: 0,
        },
        url: {
            ipv4: 0,
            ipv6: 0,
            ipv4Confirmation: 0,
            byProtocol: 0,
            port: 0,
            // three places where protocol can appear
            protocol1: 0,
            protocol2: 0,
            protocol3: 0,
            protocolWithDomain: 0,
            path: 0,
            // sometimes path might be split into two parts
            secondPartOfPath: 0,
            query: 0,
            fragment: 0,
        },
    };
    exports.iidxes = iidxes;
    var testers = [
        "file:///some/file/path/filename.pdf",
        "mailto:e+_mail.me@sub.domain.com",
        "http://sub.domain.co.uk:3000/p/a/t/h_(asd)/h?q=abc123#dfdf",
        "http://www.\u0639\u0631\u0628\u064A.com",
        "http://127.0.0.1:3000/p/a/t_(asd)/h?q=abc123#dfdf",
        "http://[2a00:1450:4025:401::67]/k/something",
        "a.org/abc/\u10D8_\u10D2\u10D2",
    ].join(" ");
    var result = null;
    var i = 0;
    while ((result = exports.finalRegex.exec(testers)) !== null) {
        if (i === 0) {
            iidxes.isFile = result.lastIndexOf(result[0]);
            iidxes.file.fileName = result.indexOf("filename.pdf");
            iidxes.file.protocol = result.indexOf("file:///");
        }
        if (i === 1) {
            iidxes.isEmail = result.lastIndexOf(result[0]);
            iidxes.email.protocol = result.indexOf("mailto:");
            iidxes.email.local = result.indexOf("e+_mail.me");
            iidxes.email.host = result.indexOf("sub.domain.com");
        }
        if (i === 2) {
            iidxes.isURL = result.lastIndexOf(result[0]);
            iidxes.url.protocol1 = result.indexOf("http://");
            iidxes.url.protocolWithDomain = result.indexOf("http://sub.domain.co.uk:3000");
            iidxes.url.port = result.indexOf("3000");
            iidxes.url.path = result.indexOf("/p/a/t/h_(asd)/h");
            iidxes.url.query = result.indexOf("q=abc123");
            iidxes.url.fragment = result.indexOf("dfdf");
        }
        if (i === 3) {
            iidxes.url.byProtocol = result.lastIndexOf("http://www.عربي.com");
            iidxes.url.protocol2 = result.lastIndexOf("http://");
        }
        if (i === 4) {
            iidxes.url.ipv4 = result.indexOf("127.0.0.1");
            iidxes.url.ipv4Confirmation = result.indexOf("0.");
        }
        if (i === 5) {
            iidxes.url.ipv6 = result.indexOf("2a00:1450:4025:401::67");
            iidxes.url.protocol3 = result.lastIndexOf("http://");
        }
        if (i === 6) {
            iidxes.url.secondPartOfPath = result.indexOf("გგ");
        }
        i++;
    }
    });

    function checkParenthesis(opening, closing, target, nextChar) {
        if (nextChar !== closing) {
            return false;
        }
        if (target.split(opening).length - target.split(closing).length === 1 ||
            (opening === closing && target.split(opening).length % 2 === 0)) {
            return true;
        }
    }
    var checkParenthesis_1 = checkParenthesis;
    var maximumAttrLength = dictionary.htmlAttributes.sort(function (a, b) { return b.length - a.length; })[0].length;
    function isInsideAttribute(prevFragment) {
        return (/\s[a-z0-9-]+=('|")$/i.test(prevFragment) ||
            /: ?url\(('|")?$/i.test(prevFragment));
    }
    var isInsideAttribute_1 = isInsideAttribute;
    function isInsideAnchorTag(target, fullInput, targetEnd) {
        var escapedTarget = target.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        var regex = new RegExp("(?=(<a))(?!([\\s\\S]*)(<\\/a>)(" + escapedTarget + "))[\\s\\S]*?(" + escapedTarget + ")(?!\"|')", "gi");
        var result = null;
        while ((result = regex.exec(fullInput)) !== null) {
            var end = result.index + result[0].length;
            if (end === targetEnd) {
                return true;
            }
        }
        return false;
    }
    var isInsideAnchorTag_1 = isInsideAnchorTag;

    var utils = /*#__PURE__*/Object.defineProperty({
    	checkParenthesis: checkParenthesis_1,
    	maximumAttrLength: maximumAttrLength,
    	isInsideAttribute: isInsideAttribute_1,
    	isInsideAnchorTag: isInsideAnchorTag_1
    }, '__esModule', {value: true});

    var list = function (input) {
        var found = [];
        var result = null;
        var _loop_1 = function () {
            var start = result.index;
            var end = start + result[0].length;
            var string = result[0];
            // ### trailing slashes problem
            /**
             * This is a quick and dirty fix for a problem that could be probably fixed with
             * slight modification in the regex.
             * The problem is that the library doesn't count the trailing slashes as part
             * of the URL, unless there were multiple trailing slashes.
             */
            if (input.charAt(end) === "/") {
                string = string + input.charAt(end);
                end++;
            }
            // ### Parenthesis problem
            /**
                    As we're using the \b to tokenize the URL, sometimes the parenthesis are part of the URL
                    and sometimes they are actually the last part, this makes the tokenization stops just
                    before them.
                    To fix this, we calculate how many parenthesis are open and how many are closed inside
                    the URL and based on the number we should be able to know whether the aforementioned
                    parenthesis character is part of the URL or not
                */
            if (dictionary.closingParenthesis.indexOf(input.charAt(end)) > -1) {
                dictionary.parenthesis.forEach(function (str) {
                    var opening = str.charAt(0);
                    var closing = str.charAt(1);
                    if (utils.checkParenthesis(opening, closing, string, input.charAt(end))) {
                        string = string + input.charAt(end);
                        end++;
                    }
                });
            }
            // ### HTML problem 1
            /**
                    checking whether the token is already inside an HTML element by seeing if it's
                    preceded by an HTML attribute that would hold a url (e.g. scr, cite ...etc)
                */
            if (['""', "''", "()"].indexOf(input.charAt(start - 1) + input.charAt(end)) !== -1) {
                if (utils.isInsideAttribute(input.substring(start - utils.maximumAttrLength - 15, start))) {
                    return "continue";
                }
            }
            // ### HTML problem 2
            /**
                    Checking whether the token is the content of an actual anchor
                    e.g. <a href="https://something.com">click to go to something.com and have fun</a>
                */
            if (input.substring(end, input.length).indexOf("</a>") > -1 &&
                input.substring(0, start).indexOf("<a") > -1 &&
                utils.isInsideAnchorTag(string, input, end)) {
                return "continue";
            }
            if (result[regex.iidxes.isURL]) {
                var path = (result[regex.iidxes.url.path] || "") +
                    (result[regex.iidxes.url.secondPartOfPath] || "") || undefined;
                var protocol = result[regex.iidxes.url.protocol1] ||
                    result[regex.iidxes.url.protocol2] ||
                    result[regex.iidxes.url.protocol3];
                found.push({
                    start: start,
                    end: end,
                    string: string,
                    isURL: true,
                    protocol: protocol,
                    port: result[regex.iidxes.url.port],
                    ipv4: result[regex.iidxes.url.ipv4Confirmation]
                        ? result[regex.iidxes.url.ipv4]
                        : undefined,
                    ipv6: result[regex.iidxes.url.ipv6],
                    host: result[regex.iidxes.url.byProtocol]
                        ? undefined
                        : (result[regex.iidxes.url.protocolWithDomain] || "").substr((protocol || "").length),
                    confirmedByProtocol: !!result[regex.iidxes.url.byProtocol],
                    path: result[regex.iidxes.url.byProtocol] ? undefined : path,
                    query: result[regex.iidxes.url.query] || undefined,
                    fragment: result[regex.iidxes.url.fragment] || undefined,
                });
            }
            else if (result[regex.iidxes.isFile]) {
                var filePath = string.substr(8);
                found.push({
                    start: start,
                    end: end,
                    string: string,
                    isFile: true,
                    protocol: result[regex.iidxes.file.protocol],
                    filename: result[regex.iidxes.file.fileName],
                    filePath: filePath,
                    fileDirectory: filePath.substr(0, filePath.length - result[regex.iidxes.file.fileName].length),
                });
            }
            else if (result[regex.iidxes.isEmail]) {
                found.push({
                    start: start,
                    end: end,
                    string: string,
                    isEmail: true,
                    local: result[regex.iidxes.email.local],
                    protocol: result[regex.iidxes.email.protocol],
                    host: result[regex.iidxes.email.host],
                });
            }
            else {
                found.push({
                    start: start,
                    end: end,
                    string: string,
                });
            }
        };
        while ((result = regex.finalRegex.exec(input)) !== null) {
            _loop_1();
        }
        return found;
    };
    var anchorme = function (arg) {
        var _a = typeof arg === "string"
            ? { input: arg, options: undefined, extensions: undefined }
            : arg, input = _a.input, options = _a.options, extensions = _a.extensions;
        if (extensions) {
            for (var index = 0; index < extensions.length; index++) {
                var extension = extensions[index];
                input = input.replace(extension.test, extension.transform);
            }
        }
        var found = list(input);
        var newStr = "";
        // the following code isn't very intuitive nor human readable
        // but faster than others
        for (var index = 0; index < found.length; index++) {
            newStr =
                (newStr
                    ? newStr
                    : index === 0
                        ? input.substring(0, found[index].start)
                        : "") +
                    transform_1.transform(found[index], options) +
                    (found[index + 1]
                        ? input.substring(found[index].end, found[index + 1].start)
                        : input.substring(found[index].end));
        }
        return newStr ? newStr : input;
    };
    anchorme.list = function (input) {
        return list(input);
    };
    anchorme.validate = {
        ip: function (input) { return regex.ipRegex.test(input); },
        email: function (input) { return regex.emailRegex.test(input); },
        file: function (input) { return regex.fileRegex.test(input); },
        url: function (input) { return regex.urlRegex.test(input) || regex.ipRegex.test(input); },
    };
    var _default = anchorme;

    /* src/Subject.svelte generated by Svelte v3.44.1 */
    const file$1 = "src/Subject.svelte";

    // (13:4) <ModalHeader          >
    function create_default_slot_11(ctx) {
    	let t_value = (/*subject*/ ctx[0].stroom1 || /*subject*/ ctx[0].stroom2
    	? 'Pauze'
    	: 'Grote pauze') + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t_value !== (t_value = (/*subject*/ ctx[0].stroom1 || /*subject*/ ctx[0].stroom2
    			? 'Pauze'
    			: 'Grote pauze') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(13:4) <ModalHeader          >",
    		ctx
    	});

    	return block;
    }

    // (18:4) <ModalBody>
    function create_default_slot_10(ctx) {
    	let t0;

    	let t1_value = new Date(/*subjects*/ ctx[1][/*subjects*/ ctx[1].indexOf(/*subject*/ ctx[0]) - 1]
    		? /*subjects*/ ctx[1][/*subjects*/ ctx[1].indexOf(/*subject*/ ctx[0]) - 1].end
    		: /*subject*/ ctx[0].stroom1 || /*subject*/ ctx[0].stroom2
    			? /*subject*/ ctx[0].start - 900000
    			: /*subject*/ ctx[0].start - 1800000).toLocaleTimeString().substring(0, 5) + "";

    	let t1;
    	let t2;
    	let br;
    	let t3;
    	let t4_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "";
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("Deze pauze begint om ");
    			t1 = text(t1_value);
    			t2 = text(", ");
    			br = element("br");
    			t3 = text("\r\n        En eindigt om ");
    			t4 = text(t4_value);
    			add_location(br, file$1, 26, 31, 945);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subjects, subject*/ 3 && t1_value !== (t1_value = new Date(/*subjects*/ ctx[1][/*subjects*/ ctx[1].indexOf(/*subject*/ ctx[0]) - 1]
    				? /*subjects*/ ctx[1][/*subjects*/ ctx[1].indexOf(/*subject*/ ctx[0]) - 1].end
    				: /*subject*/ ctx[0].stroom1 || /*subject*/ ctx[0].stroom2
    					? /*subject*/ ctx[0].start - 900000
    					: /*subject*/ ctx[0].start - 1800000).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*subject*/ 1 && t4_value !== (t4_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(18:4) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Modal isOpen={pauzeOpen} toggle={togglePauze} destroyOnHide={false}>
    function create_default_slot_9(ctx) {
    	let modalheader;
    	let t;
    	let modalbody;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t = space();
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope, subject*/ 65) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope, subject, subjects*/ 67) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(12:0) <Modal isOpen={pauzeOpen} toggle={togglePauze} destroyOnHide={false}>",
    		ctx
    	});

    	return block;
    }

    // (35:71) 
    function create_if_block_10(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Pauze";
    			attr_dev(li, "class", "list-group-item");
    			add_location(li, file$1, 35, 4, 1383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*togglePauze*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(35:71) ",
    		ctx
    	});

    	return block;
    }

    // (33:0) {#if (((subject.grotePauze1 || subject.grotePauze2) && !subject.minirooster) || subject.miniroosterPauze1 || subject.miniroosterPauze2)}
    function create_if_block_9(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Grote pauze";
    			attr_dev(li, "class", "list-group-item");
    			add_location(li, file$1, 33, 4, 1237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*togglePauze*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(33:0) {#if (((subject.grotePauze1 || subject.grotePauze2) && !subject.minirooster) || subject.miniroosterPauze1 || subject.miniroosterPauze2)}",
    		ctx
    	});

    	return block;
    }

    // (39:4) <Badge pill color="primary">
    function create_default_slot_8(ctx) {
    	let t_value = /*subject*/ ctx[0].classhour + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t_value !== (t_value = /*subject*/ ctx[0].classhour + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(39:4) <Badge pill color=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#if subject.homework && !subject.toets}
    function create_if_block_8(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(41:4) {#if subject.homework && !subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (42:8) <Badge pill color="info">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Huiswerk");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(42:8) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (44:4) {#if subject.toets}
    function create_if_block_7(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(44:4) {#if subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (45:8) <Badge pill color="info">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Toets");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(45:8) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:8) <Badge pill color="primary">
    function create_default_slot_5(ctx) {
    	let t_value = /*subject*/ ctx[0].classhour + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t_value !== (t_value = /*subject*/ ctx[0].classhour + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(50:8) <Badge pill color=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:8) {#if subject.homework && !subject.toets}
    function create_if_block_6(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(52:8) {#if subject.homework && !subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (53:12) <Badge pill color="info">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Huiswerk");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(53:12) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (55:8) {#if subject.toets}
    function create_if_block_5(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "info",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(55:8) {#if subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (56:12) <Badge pill color="info">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Toets");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(56:12) <Badge pill color=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:4) <ModalHeader>
    function create_default_slot_2$1(ctx) {
    	let badge;
    	let t0;
    	let t1_value = /*subject*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*subject*/ ctx[0].homework && !/*subject*/ ctx[0].toets && create_if_block_6(ctx);
    	let if_block1 = /*subject*/ ctx[0].toets && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const badge_changes = {};

    			if (dirty & /*$$scope, subject*/ 65) {
    				badge_changes.$$scope = { dirty, ctx };
    			}

    			badge.$set(badge_changes);
    			if ((!current || dirty & /*subject*/ 1) && t1_value !== (t1_value = /*subject*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (/*subject*/ ctx[0].homework && !/*subject*/ ctx[0].toets) {
    				if (if_block0) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*subject*/ ctx[0].toets) {
    				if (if_block1) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(49:4) <ModalHeader>",
    		ctx
    	});

    	return block;
    }

    // (66:8) {#if subject.location}
    function create_if_block_4(ctx) {
    	let t0;
    	let t1_value = /*subject*/ ctx[0].location + "";
    	let t1;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("Het vak is te vinden in lokaal ");
    			t1 = text(t1_value);
    			br = element("br");
    			add_location(br, file$1, 65, 79, 2564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t1_value !== (t1_value = /*subject*/ ctx[0].location + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(66:8) {#if subject.location}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if subject.docent}
    function create_if_block_3(ctx) {
    	let t0;
    	let t1_value = /*subject*/ ctx[0].docent + "";
    	let t1;
    	let t2;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("De docent is ");
    			t1 = text(t1_value);
    			t2 = text(".");
    			br = element("br");
    			add_location(br, file$1, 67, 58, 2648);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t1_value !== (t1_value = /*subject*/ ctx[0].docent + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(68:8) {#if subject.docent}",
    		ctx
    	});

    	return block;
    }

    // (70:129) 
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Dit vak heeft geen opgegeven huiswerk.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(70:129) ",
    		ctx
    	});

    	return block;
    }

    // (70:8) {#if subject.homework && !subject.toets}
    function create_if_block_1(ctx) {
    	let t;
    	let br;
    	let html_tag;
    	let raw_value = _default(/*subject*/ ctx[0].homework) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			t = text("Het huiswerk is: ");
    			br = element("br");
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			add_location(br, file$1, 69, 65, 2795);
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && raw_value !== (raw_value = _default(/*subject*/ ctx[0].homework) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(70:8) {#if subject.homework && !subject.toets}",
    		ctx
    	});

    	return block;
    }

    // (70:172) {#if subject.toets && subject.homework}
    function create_if_block$1(ctx) {
    	let t;
    	let br;
    	let html_tag;
    	let raw_value = _default(/*subject*/ ctx[0].homework) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			t = text("De beschrijving van de toets is: ");
    			br = element("br");
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			add_location(br, file$1, 69, 244, 2974);
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && raw_value !== (raw_value = _default(/*subject*/ ctx[0].homework) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(70:172) {#if subject.toets && subject.homework}",
    		ctx
    	});

    	return block;
    }

    // (59:4) <ModalBody>
    function create_default_slot_1$1(ctx) {
    	let t0_value = (/*subject*/ ctx[0].description
    	? `Het vak ${/*subject*/ ctx[0].description}`
    	: 'Dit vak') + "";

    	let t0;
    	let t1;
    	let t2_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "";
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let t5_value = new Date(/*subject*/ ctx[0].end).toLocaleTimeString().substring(0, 5) + "";
    	let t5;
    	let t6;
    	let br1;
    	let t7;
    	let t8;
    	let t9;
    	let t10_value = (/*subject*/ ctx[0].toets ? 'een' : 'geen') + "";
    	let t10;
    	let t11;
    	let br2;
    	let t12;
    	let if_block2_anchor;
    	let if_block3_anchor;
    	let if_block0 = /*subject*/ ctx[0].location && create_if_block_4(ctx);
    	let if_block1 = /*subject*/ ctx[0].docent && create_if_block_3(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*subject*/ ctx[0].homework && !/*subject*/ ctx[0].toets) return create_if_block_1;
    		if (!/*subject*/ ctx[0].toets) return create_if_block_2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type && current_block_type(ctx);
    	let if_block3 = /*subject*/ ctx[0].toets && /*subject*/ ctx[0].homework && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" begint\r\n        om ");
    			t2 = text(t2_value);
    			t3 = text(",\r\n        ");
    			br0 = element("br");
    			t4 = text("\r\n        En eindigt om ");
    			t5 = text(t5_value);
    			t6 = text(".");
    			br1 = element("br");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = text("\r\n        Dit vak heeft ");
    			t10 = text(t10_value);
    			t11 = text(" toets.");
    			br2 = element("br");
    			t12 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			add_location(br0, file$1, 61, 8, 2358);
    			add_location(br1, file$1, 64, 30, 2477);
    			add_location(br2, file$1, 68, 61, 2722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subject*/ 1 && t0_value !== (t0_value = (/*subject*/ ctx[0].description
    			? `Het vak ${/*subject*/ ctx[0].description}`
    			: 'Dit vak') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*subject*/ 1 && t2_value !== (t2_value = new Date(/*subject*/ ctx[0].start).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*subject*/ 1 && t5_value !== (t5_value = new Date(/*subject*/ ctx[0].end).toLocaleTimeString().substring(0, 5) + "")) set_data_dev(t5, t5_value);

    			if (/*subject*/ ctx[0].location) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(t8.parentNode, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*subject*/ ctx[0].docent) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(t9.parentNode, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*subject*/ 1 && t10_value !== (t10_value = (/*subject*/ ctx[0].toets ? 'een' : 'geen') + "")) set_data_dev(t10, t10_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type && current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			}

    			if (/*subject*/ ctx[0].toets && /*subject*/ ctx[0].homework) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t7);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t12);

    			if (if_block2) {
    				if_block2.d(detaching);
    			}

    			if (detaching) detach_dev(if_block2_anchor);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(59:4) <ModalBody>",
    		ctx
    	});

    	return block;
    }

    // (48:0) <Modal {isOpen} {toggle} destroyOnHide={false}>
    function create_default_slot$3(ctx) {
    	let modalheader;
    	let t;
    	let modalbody;
    	let current;

    	modalheader = new ModalHeader({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modalbody = new ModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modalheader.$$.fragment);
    			t = space();
    			create_component(modalbody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modalbody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modalheader_changes = {};

    			if (dirty & /*$$scope, subject*/ 65) {
    				modalheader_changes.$$scope = { dirty, ctx };
    			}

    			modalheader.$set(modalheader_changes);
    			const modalbody_changes = {};

    			if (dirty & /*$$scope, subject*/ 65) {
    				modalbody_changes.$$scope = { dirty, ctx };
    			}

    			modalbody.$set(modalbody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalheader.$$.fragment, local);
    			transition_in(modalbody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalheader.$$.fragment, local);
    			transition_out(modalbody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(modalbody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(48:0) <Modal {isOpen} {toggle} destroyOnHide={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let modal0;
    	let t0;
    	let t1;
    	let li;
    	let badge;
    	let t2;
    	let t3_value = /*subject*/ ctx[0].title + "";
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let modal1;
    	let current;
    	let mounted;
    	let dispose;

    	modal0 = new Modal({
    			props: {
    				isOpen: /*pauzeOpen*/ ctx[2],
    				toggle: /*togglePauze*/ ctx[4],
    				destroyOnHide: false,
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if ((/*subject*/ ctx[0].grotePauze1 || /*subject*/ ctx[0].grotePauze2) && !/*subject*/ ctx[0].minirooster || /*subject*/ ctx[0].miniroosterPauze1 || /*subject*/ ctx[0].miniroosterPauze2) return create_if_block_9;
    		if ((/*subject*/ ctx[0].stroom1 || /*subject*/ ctx[0].stroom2) && !/*subject*/ ctx[0].minirooster) return create_if_block_10;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);

    	badge = new Badge({
    			props: {
    				pill: true,
    				color: "primary",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*subject*/ ctx[0].homework && !/*subject*/ ctx[0].toets && create_if_block_8(ctx);
    	let if_block2 = /*subject*/ ctx[0].toets && create_if_block_7(ctx);

    	modal1 = new Modal({
    			props: {
    				isOpen: /*isOpen*/ ctx[3],
    				toggle: /*toggle*/ ctx[5],
    				destroyOnHide: false,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			li = element("li");
    			create_component(badge.$$.fragment);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			create_component(modal1.$$.fragment);
    			attr_dev(li, "class", "list-group-item");
    			add_location(li, file$1, 37, 0, 1453);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, li, anchor);
    			mount_component(badge, li, null);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    			if (if_block1) if_block1.m(li, null);
    			append_dev(li, t5);
    			if (if_block2) if_block2.m(li, null);
    			insert_dev(target, t6, anchor);
    			mount_component(modal1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*toggle*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};
    			if (dirty & /*pauzeOpen*/ 4) modal0_changes.isOpen = /*pauzeOpen*/ ctx[2];

    			if (dirty & /*$$scope, subject, subjects*/ 67) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			}

    			const badge_changes = {};

    			if (dirty & /*$$scope, subject*/ 65) {
    				badge_changes.$$scope = { dirty, ctx };
    			}

    			badge.$set(badge_changes);
    			if ((!current || dirty & /*subject*/ 1) && t3_value !== (t3_value = /*subject*/ ctx[0].title + "")) set_data_dev(t3, t3_value);

    			if (/*subject*/ ctx[0].homework && !/*subject*/ ctx[0].toets) {
    				if (if_block1) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(li, t5);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*subject*/ ctx[0].toets) {
    				if (if_block2) {
    					if (dirty & /*subject*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(li, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			const modal1_changes = {};
    			if (dirty & /*isOpen*/ 8) modal1_changes.isOpen = /*isOpen*/ ctx[3];

    			if (dirty & /*$$scope, subject*/ 65) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(badge.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(modal1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(badge.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(modal1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);

    			if (if_block0) {
    				if_block0.d(detaching);
    			}

    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(li);
    			destroy_component(badge);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t6);
    			destroy_component(modal1, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subject', slots, []);
    	let pauzeOpen = false;
    	let togglePauze = () => $$invalidate(2, pauzeOpen = !pauzeOpen);
    	let isOpen = false;
    	const toggle = () => $$invalidate(3, isOpen = !isOpen);
    	let { subject } = $$props;
    	let { subjects } = $$props;
    	const writable_props = ['subject', 'subjects'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subject> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('subject' in $$props) $$invalidate(0, subject = $$props.subject);
    		if ('subjects' in $$props) $$invalidate(1, subjects = $$props.subjects);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		ModalHeader,
    		ModalBody,
    		Badge,
    		anchorme: _default,
    		pauzeOpen,
    		togglePauze,
    		isOpen,
    		toggle,
    		subject,
    		subjects
    	});

    	$$self.$inject_state = $$props => {
    		if ('pauzeOpen' in $$props) $$invalidate(2, pauzeOpen = $$props.pauzeOpen);
    		if ('togglePauze' in $$props) $$invalidate(4, togglePauze = $$props.togglePauze);
    		if ('isOpen' in $$props) $$invalidate(3, isOpen = $$props.isOpen);
    		if ('subject' in $$props) $$invalidate(0, subject = $$props.subject);
    		if ('subjects' in $$props) $$invalidate(1, subjects = $$props.subjects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [subject, subjects, pauzeOpen, isOpen, togglePauze, toggle];
    }

    class Subject extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { subject: 0, subjects: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subject",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*subject*/ ctx[0] === undefined && !('subject' in props)) {
    			console.warn("<Subject> was created without expected prop 'subject'");
    		}

    		if (/*subjects*/ ctx[1] === undefined && !('subjects' in props)) {
    			console.warn("<Subject> was created without expected prop 'subjects'");
    		}
    	}

    	get subject() {
    		throw new Error("<Subject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subject(value) {
    		throw new Error("<Subject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subjects() {
    		throw new Error("<Subject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subjects(value) {
    		throw new Error("<Subject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Day.svelte generated by Svelte v3.44.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (29:16) {#each day.subjects as subject}
    function create_each_block_1(ctx) {
    	let subject;
    	let current;

    	subject = new Subject({
    			props: {
    				subject: /*subject*/ ctx[4],
    				subjects: /*day*/ ctx[0].subjects
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(subject.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subject, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const subject_changes = {};
    			if (dirty & /*day*/ 1) subject_changes.subject = /*subject*/ ctx[4];
    			if (dirty & /*day*/ 1) subject_changes.subjects = /*day*/ ctx[0].subjects;
    			subject.$set(subject_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subject.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subject.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(subject, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(29:16) {#each day.subjects as subject}",
    		ctx
    	});

    	return block;
    }

    // (7:0) <AccordionItem                  active={new Date(time).toLocaleDateString() ==                      new Date().toLocaleDateString()}                  class="list-group"                  header={new Date(day.day)                      .toLocaleString('nl-NL', {                          weekday: 'long',                          year: 'numeric',                          month: 'long',                          day: 'numeric',                      })                      .charAt(0)                      .toUpperCase() +                      new Date(day.day)                          .toLocaleString('nl-NL', {                              weekday: 'long',                              year: 'numeric',                              month: 'long',                              day: 'numeric',                          })                          .slice(1)}              >
    function create_default_slot$2(ctx) {
    	let t;
    	let current;
    	let each_value_1 = /*day*/ ctx[0].subjects;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*day*/ 1) {
    				each_value_1 = /*day*/ ctx[0].subjects;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(7:0) <AccordionItem                  active={new Date(time).toLocaleDateString() ==                      new Date().toLocaleDateString()}                  class=\\\"list-group\\\"                  header={new Date(day.day)                      .toLocaleString('nl-NL', {                          weekday: 'long',                          year: 'numeric',                          month: 'long',                          day: 'numeric',                      })                      .charAt(0)                      .toUpperCase() +                      new Date(day.day)                          .toLocaleString('nl-NL', {                              weekday: 'long',                              year: 'numeric',                              month: 'long',                              day: 'numeric',                          })                          .slice(1)}              >",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#each [day.day] as time}
    function create_each_block$1(ctx) {
    	let accordionitem;
    	let current;

    	accordionitem = new AccordionItem({
    			props: {
    				active: new Date(/*time*/ ctx[1]).toLocaleDateString() == new Date().toLocaleDateString(),
    				class: "list-group",
    				header: new Date(/*day*/ ctx[0].day).toLocaleString('nl-NL', {
    					weekday: 'long',
    					year: 'numeric',
    					month: 'long',
    					day: 'numeric'
    				}).charAt(0).toUpperCase() + new Date(/*day*/ ctx[0].day).toLocaleString('nl-NL', {
    					weekday: 'long',
    					year: 'numeric',
    					month: 'long',
    					day: 'numeric'
    				}).slice(1),
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(accordionitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordionitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordionitem_changes = {};
    			if (dirty & /*day*/ 1) accordionitem_changes.active = new Date(/*time*/ ctx[1]).toLocaleDateString() == new Date().toLocaleDateString();

    			if (dirty & /*day*/ 1) accordionitem_changes.header = new Date(/*day*/ ctx[0].day).toLocaleString('nl-NL', {
    				weekday: 'long',
    				year: 'numeric',
    				month: 'long',
    				day: 'numeric'
    			}).charAt(0).toUpperCase() + new Date(/*day*/ ctx[0].day).toLocaleString('nl-NL', {
    				weekday: 'long',
    				year: 'numeric',
    				month: 'long',
    				day: 'numeric'
    			}).slice(1);

    			if (dirty & /*$$scope, day*/ 129) {
    				accordionitem_changes.$$scope = { dirty, ctx };
    			}

    			accordionitem.$set(accordionitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordionitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordionitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordionitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(6:0) {#each [day.day] as time}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = [/*day*/ ctx[0].day];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 1; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Date, day*/ 1) {
    				each_value = [/*day*/ ctx[0].day];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < 1; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = 1; i < 1; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Day', slots, []);
    	let { day = {} } = $$props;
    	const writable_props = ['day'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Day> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('day' in $$props) $$invalidate(0, day = $$props.day);
    	};

    	$$self.$capture_state = () => ({ day, Subject, AccordionItem });

    	$$self.$inject_state = $$props => {
    		if ('day' in $$props) $$invalidate(0, day = $$props.day);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [day];
    }

    class Day extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { day: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Day",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get day() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set day(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Home.svelte generated by Svelte v3.44.1 */
    const file = "src/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (133:2) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let div0;
    	let span;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file, 135, 8, 5213);
    			attr_dev(div0, "class", "spinner-grow text-primary");
    			attr_dev(div0, "role", "status");
    			add_location(div0, file, 134, 6, 5150);
    			attr_dev(div1, "class", "text-center");
    			add_location(div1, file, 133, 4, 5117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(133:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (129:2) {#if days}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*days*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*days*/ 1) {
    				each_value = /*days*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(129:2) {#if days}",
    		ctx
    	});

    	return block;
    }

    // (130:4) {#each days as day}
    function create_each_block(ctx) {
    	let day;
    	let current;

    	day = new Day({
    			props: { day: /*day*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(day.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(day, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const day_changes = {};
    			if (dirty & /*days*/ 1) day_changes.day = /*day*/ ctx[1];
    			day.$set(day_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(day.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(day.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(day, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(130:4) {#each days as day}",
    		ctx
    	});

    	return block;
    }

    // (128:0) <Accordion>
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*days*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(128:0) <Accordion>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let link;
    	let t;
    	let accordion;
    	let current;

    	link = new Link({
    			props: {
    				to: "login",
    				class: "login",
    				style: { visibility: 'hidden' }
    			},
    			$$inline: true
    		});

    	accordion = new Accordion({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    			t = space();
    			create_component(accordion.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const accordion_changes = {};

    			if (dirty & /*$$scope, days*/ 17) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let days = [];

    	onMount(async () => {
    		// if (
    		//     !localStorage.getItem('username') ||
    		//     !localStorage.getItem('password')
    		// )
    		//     document.querySelector('.login').click();
    		$$invalidate(0, days = JSON.parse(localStorage.getItem('days')));

    		if (!navigator.onLine) return;

    		let res = await fetch('https://hoogeland-pauzes.glitch.me/get', {
    			headers: new Headers({ 'content-type': 'application/json' }),
    			mode: 'cors',
    			method: 'POST',
    			body: JSON.stringify({ username: 'hv1d' })
    		});

    		let text = await res.text();

    		if (text == 'failed') {
    			location.reload();

    			//   document.querySelector('.login').click();
    			return;
    		}

    		let parsing = JSON.parse(text);

    		parsing.map(day => {
    			day.subjects.map(subject => {
    				let subjects = day.subjects;
    				let lesuur = parseInt(subject.classhour);
    				let location = parseInt(subject.location);
    				let stroom1locatie = location == 7 || location == 8 || subject.description == 'lichamelijke opvoeding' || location >= 104 && location <= 127 || location >= 228 && location <= 258;
    				let stroom2locatie = location >= 51 && location <= 88 || location >= 201 && location <= 227 || location >= 301 && location <= 330;
    				let stroom1tijd = lesuur == 4 || lesuur == 8;
    				let stroom2tijd = lesuur == 5 || lesuur == 9;
    				let stroom1 = stroom1tijd && stroom1locatie;
    				let stroom2 = stroom2tijd && stroom2locatie && !subject.dontAllowStroom2;
    				let grotePauze1 = stroom1locatie && lesuur == 6;
    				let grotePauze2 = stroom2locatie && lesuur == 7 && !subject.dontAllowStroom2;
    				let start = new Date(subject.start);
    				let end = new Date(subject.end);
    				let minirooster = start.getMinutes() == end.getMinutes() && start.getHours() + 1 == end.getHours() || 60 * start.getHours() + start.getMinutes() + 30 == 60 * end.getHours() + end.getMinutes();
    				let minirooster1locatie = location >= 51 && location <= 88 || location >= 104 && location <= 127 || location >= 228 && location <= 258;
    				let minirooster2locatie = subject.description == 'lichamelijke opvoeding' || location >= 201 && location <= 227 || location >= 301 && location <= 330;
    				let miniroosterPauze1 = lesuur == 6 && minirooster1locatie && minirooster;
    				let miniroosterPauze2 = lesuur == 7 && minirooster2locatie && minirooster && !subject.dontAllowStroom2;
    				if (stroom1 && !minirooster) subject.start += 900000; else if (grotePauze1 && !minirooster) subject.start += 1800000; else if (stroom2 && !minirooster) subjects[subjects.indexOf(subject) - 1].end -= 900000; else if (grotePauze2 && !minirooster) subjects[subjects.indexOf(subject) - 1].end -= 1800000; else if (minirooster && (miniroosterPauze1 || miniroosterPauze2) && new Date(subject.end).getMinutes() == new Date(subject.start).getMinutes()) subject.start += 1800000; else if (minirooster && (miniroosterPauze1 || miniroosterPauze2) && new Date(subjects[subjects.indexOf(subject) - 1].end).getMinutes() == new Date(subjects[subjects.indexOf(subject) - 1].start).getMinutes()) subjects[subjects.indexOf(subject) - 1].end -= 1800000;
    				subject.stroom1 = stroom1;
    				subject.stroom2 = stroom2;
    				subject.grotePauze1 = grotePauze1;
    				subject.grotePauze2 = grotePauze2;
    				subject.minirooster = minirooster;
    				subject.miniroosterPauze1 = miniroosterPauze1;
    				subject.miniroosterPauze2 = miniroosterPauze2;
    				if (((grotePauze1 || stroom1) && !minirooster || miniroosterPauze1) && subjects[subjects.indexOf(subject) + 1]) subjects[subjects.indexOf(subject) + 1].dontAllowStroom2 = true;
    				if (!subject.dontAllowStroom2 && lesuur == 8 && subjects[subjects.indexOf(subject) + 1] == null && !minirooster) subject.end -= 900000;
    				return subject;
    			});

    			day.subjects.forEach(subject => {
    				subject.dontAllowStroom2 = undefined;
    			});

    			return day;
    		});

    		localStorage.setItem('days', JSON.stringify(parsing));
    		$$invalidate(0, days = null);
    		$$invalidate(0, days = parsing);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Link, Accordion, Day, days });

    	$$self.$inject_state = $$props => {
    		if ('days' in $$props) $$invalidate(0, days = $$props.days);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [days];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */

    // (12:4) <Route path="/">
    function create_default_slot_2(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(12:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:4) <Route path="/index.html">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(15:4) <Route path=\\\"/index.html\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/index.html",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(11:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	window.addEventListener('load', () => {
    		document.querySelector('body').style.visibility = 'visible';
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Home, Router, Route });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }

    return app;

})();
//# sourceMappingURL=bundle.js.map
