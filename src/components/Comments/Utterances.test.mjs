import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {afterEach, beforeEach, mock, test} from 'node:test';
import {JSDOM} from 'jsdom';
import React, {act} from 'react';
import {renderToString} from 'react-dom/server';

const require = createRequire(import.meta.url);
const {default: Utterances} = require('./Utterances.tsx');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://oceanbase.github.io/docs/guide',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {value: dom.window.navigator, configurable: true});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const {createRoot} = await import('react-dom/client');
const {Helmet, HelmetProvider} = require('react-helmet-async');
const animationFrames = new Map();
let nextAnimationFrame = 0;
globalThis.requestAnimationFrame = (callback) => {
  const id = ++nextAnimationFrame;
  animationFrames.set(id, callback);
  return id;
};
globalThis.cancelAnimationFrame = (id) => animationFrames.delete(id);

let container;
let root;
const defaults = {
  pathname: '/docs/guide',
  issueNumber: 42,
  historicalIssues: [],
  colorMode: 'light',
  canonicalUrl: 'https://oceanbase.github.io/docs/guide',
};

beforeEach(() => {
  window.history.replaceState({key: 'router-entry'}, '', '/docs/guide');
  window.localStorage.clear();
  document.head.replaceChildren();
  document.title = 'Guide';
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = defaults.canonicalUrl;
  document.head.append(canonical);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  mock.restoreAll();
  animationFrames.clear();
  document.body.replaceChildren();
});

async function render(props = {}, strict = false, deferMetadata = false) {
  const options = {...defaults, ...props};
  options.canonicalUrl = props.canonicalUrl ?? `https://oceanbase.github.io${options.pathname}`;
  const pageUrl = new URL(window.location.href);
  pageUrl.pathname = options.pathname;
  window.history.replaceState(window.history.state, '', pageUrl);
  if (!deferMetadata) document.querySelector('link[rel="canonical"]').href = options.canonicalUrl;
  const component = React.createElement(Utterances, options);
  await act(async () => {
    root.render(strict ? React.createElement(React.StrictMode, null, component) : component);
  });
}

function commentsFrame() {
  const frame = container.querySelector('iframe');
  assert.ok(frame, 'the comments component should own an utterances iframe');
  return frame;
}

function frameParameters() {
  return new URL(commentsFrame().src).searchParams;
}

function recordMessages(frame) {
  const messages = [];
  frame.contentWindow.postMessage = (...args) => messages.push(args);
  return messages;
}

async function resize(frame, height = 400, origin = 'https://utteranc.es', source = frame.contentWindow) {
  await act(async () => {
    window.dispatchEvent(new window.MessageEvent('message', {
      origin,
      source,
      data: {type: 'resize', height},
    }));
  });
}

test('known pages use the official iframe endpoint with only their explicit issue number', async () => {
  await render();
  const frame = commentsFrame();
  const url = new URL(frame.src);
  assert.equal(`${url.origin}${url.pathname}`, 'https://utteranc.es/utterances.html');
  assert.equal(url.searchParams.get('repo'), 'oceanbase/oceanbase.github.io');
  assert.equal(url.searchParams.get('issue-number'), '42');
  assert.equal(url.searchParams.has('issue-term'), false);
  assert.equal(url.searchParams.get('theme'), 'github-light');
  assert.equal(container.querySelector('script'), null);
});

test('new pages use pathname matching without an issue number', async () => {
  await render({pathname: '/docs/new-page', issueNumber: undefined});
  const params = frameParameters();
  assert.equal(params.get('issue-term'), 'pathname');
  assert.equal(params.get('pathname'), 'docs/new-page');
  assert.equal(params.has('issue-number'), false);
});

test('pathname metadata follows the official root and extension normalization', async () => {
  await render({pathname: '/', issueNumber: undefined});
  assert.equal(frameParameters().get('pathname'), 'index');
  await render({pathname: '/docs/guide.html', issueNumber: undefined});
  assert.equal(frameParameters().get('pathname'), 'docs/guide');
});

test('route changes remove the old iframe and reset its measured height', async () => {
  await render();
  const previous = commentsFrame();
  await resize(previous, 900);
  await render({pathname: '/docs/next', issueNumber: 43});
  assert.equal(previous.isConnected, false);
  assert.equal(container.querySelectorAll('iframe').length, 1);
  assert.equal(frameParameters().get('issue-number'), '43');
  assert.equal(commentsFrame().parentElement.style.height, '250px');
});

test('distinct new-page paths recreate the iframe without an issue number', async () => {
  await render({pathname: '/docs/new-one', issueNumber: undefined});
  const previous = commentsFrame();
  await render({pathname: '/docs/new-two', issueNumber: undefined});
  assert.equal(previous.isConnected, false);
  assert.notEqual(commentsFrame(), previous);
  assert.equal(frameParameters().get('pathname'), 'docs/new-two');
});

test('stale iframe messages cannot resize the current discussion', async () => {
  await render();
  const previous = commentsFrame();
  const previousWindow = previous.contentWindow;
  await render({pathname: '/docs/next', issueNumber: 43});
  await resize(previous, 999, 'https://utteranc.es', previousWindow);
  assert.equal(commentsFrame().parentElement.style.height, '250px');
});

test('repeated navigation and unmount leave no loader scripts or global styles', async () => {
  const existingStyle = document.createElement('style');
  existingStyle.textContent = 'body { color: black; }';
  document.head.append(existingStyle);
  const outside = document.createElement('iframe');
  document.body.append(outside);
  await render({}, true);
  await render({pathname: '/docs/next', issueNumber: 43}, true);
  const ownedFrame = commentsFrame();
  const ownedWindow = ownedFrame.contentWindow;
  const ownedContainer = ownedFrame.parentElement;
  await act(async () => root.unmount());
  root = undefined;
  await resize(ownedFrame, 999, 'https://utteranc.es', ownedWindow);
  assert.equal(ownedFrame.isConnected, false);
  assert.equal(ownedContainer.style.height, '250px');
  assert.equal(outside.isConnected, true);
  assert.equal(document.querySelectorAll('script').length, 0);
  assert.deepEqual([...document.querySelectorAll('style')], [existingStyle]);
});

test('StrictMode leaves one iframe and keeps it during ordinary rerenders', async () => {
  await render({}, true);
  const frame = commentsFrame();
  await render({}, true);
  assert.equal(container.querySelectorAll('iframe').length, 1);
  assert.equal(commentsFrame(), frame);
});

test('the iframe loads eagerly with visible area before the first resize', async () => {
  await render();
  const frame = commentsFrame();
  assert.equal(frame.getAttribute('loading'), 'eager');
  assert.equal(frame.parentElement.style.height, '250px');
  assert.equal(frame.style.height, '100%');
  assert.equal(frame.style.minWidth, '100%');
});

test('only valid resize messages from the owned utterances iframe change height', async () => {
  await render();
  const frame = commentsFrame();
  await resize(frame, 600, 'https://example.com');
  const outside = document.createElement('iframe');
  document.body.append(outside);
  await resize(outside, 600);
  for (const height of [0, -20, NaN, Infinity, '600']) await resize(frame, height);
  assert.equal(frame.parentElement.style.height, '250px');
  await resize(frame, 600);
  assert.equal(frame.parentElement.style.height, '600px');
});

test('theme changes message the current iframe without replacing it or its URL', async () => {
  await render();
  const frame = commentsFrame();
  const source = frame.src;
  const messages = recordMessages(frame);
  await render({colorMode: 'dark'});
  assert.deepEqual(messages.at(-1), [
    {type: 'set-theme', theme: 'github-dark'}, 'https://utteranc.es',
  ]);
  await render({colorMode: 'light'});
  assert.deepEqual(messages.at(-1), [
    {type: 'set-theme', theme: 'github-light'}, 'https://utteranc.es',
  ]);
  assert.equal(commentsFrame(), frame);
  assert.equal(frame.src, source);
});

test('a loading iframe receives the latest theme when its UI becomes ready', async () => {
  await render();
  const frame = commentsFrame();
  const messages = recordMessages(frame);
  await render({colorMode: 'dark'});
  messages.length = 0;
  await resize(frame);
  assert.deepEqual(messages, [[
    {type: 'set-theme', theme: 'github-dark'}, 'https://utteranc.es',
  ]]);
});

test('repeated resize events do not reapply an unchanged theme', async () => {
  await render();
  const frame = commentsFrame();
  const messages = recordMessages(frame);
  await resize(frame);
  await resize(frame, 500);
  assert.equal(messages.length, 1);
  await render({colorMode: 'dark'});
  assert.equal(messages.length, 2);
  await resize(frame, 600);
  assert.equal(messages.length, 2);
});

test('the initial theme is included in the iframe URL', async () => {
  await render({colorMode: 'dark'});
  assert.equal(frameParameters().get('theme'), 'github-dark');
});

test('historical discussions remain explicit links separate from the primary issue', async () => {
  await render({issueNumber: 144, historicalIssues: [153]});
  const link = container.querySelector('a');
  assert.ok(link);
  assert.equal(link.href, 'https://github.com/oceanbase/oceanbase.github.io/issues/153');
  assert.match(link.textContent, /历史评论.*#153/);
  assert.equal(frameParameters().get('issue-number'), '144');
  await render({pathname: '/docs/next', issueNumber: 43});
  assert.equal(container.querySelector('a'), null);
});

test('iframe metadata includes canonical URL, origin, title and Open Graph title', async () => {
  const canonical = document.querySelector('link[rel="canonical"]');
  canonical.href = 'https://oceanbase.github.io/docs/canonical';
  const ogTitle = document.createElement('meta');
  ogTitle.setAttribute('property', 'og:title');
  ogTitle.content = 'Open Graph Guide';
  document.head.append(ogTitle);
  await render({canonicalUrl: canonical.href});
  const params = frameParameters();
  assert.equal(params.get('url'), canonical.href);
  assert.equal(params.get('origin'), 'https://oceanbase.github.io');
  assert.equal(params.get('title'), 'Guide');
  assert.equal(params.get('og:title'), 'Open Graph Guide');
});

test('long descriptions are truncated using the official encoded-length limit', async () => {
  const description = document.createElement('meta');
  description.name = 'description';
  description.content = '文'.repeat(500);
  document.head.append(description);
  await render();
  assert.equal(frameParameters().get('description'), '文'.repeat(111));
});

test('OAuth callback is stored, forwarded, and removed without losing URL or router state', async () => {
  window.history.replaceState({key: 'preserved'}, '', '/docs/guide?keep=hello%20world&utterances=test-session#section');
  await render({}, true);
  assert.equal(window.localStorage.getItem('utterances-session'), 'test-session');
  assert.equal(frameParameters().get('session'), 'test-session');
  const pageUrl = new URL(window.location.href);
  assert.equal(pageUrl.searchParams.get('keep'), 'hello world');
  assert.equal(pageUrl.searchParams.has('utterances'), false);
  assert.equal(pageUrl.hash, '#section');
  assert.deepEqual(window.history.state, {key: 'preserved'});
  assert.equal(frameParameters().get('url'), defaults.canonicalUrl);
});

test('an existing utterances session is forwarded on later page loads', async () => {
  window.localStorage.setItem('utterances-session', 'stored-test-session');
  await render();
  assert.equal(frameParameters().get('session'), 'stored-test-session');
});

test('blocked localStorage still forwards callback and strips it under StrictMode', async () => {
  mock.method(window.Storage.prototype, 'getItem', () => { throw new Error('Storage blocked'); });
  mock.method(window.Storage.prototype, 'setItem', () => { throw new Error('Storage blocked'); });
  window.history.replaceState(null, '', '/docs/guide?utterances=callback-test-session&keep=1#anchor');
  await render({}, true);
  assert.equal(frameParameters().get('session'), 'callback-test-session');
  assert.equal(new URL(window.location.href).searchParams.has('utterances'), false);
  assert.equal(window.location.hash, '#anchor');
});

test('blocked localStorage without a callback does not prevent anonymous comments', async () => {
  mock.method(window.Storage.prototype, 'getItem', () => { throw new Error('Storage blocked'); });
  await render();
  assert.equal(frameParameters().get('session'), '');
});

test('navigation waits for the actual deferred Helmet commit before freezing page metadata', async () => {
  const pageA = {pathname: '/docs/guide', title: 'Page A', description: 'Description A'};
  const pageB = {pathname: '/docs/next', title: 'Page B', description: 'Description B'};
  const canonical = document.querySelector('link[rel="canonical"]');
  canonical.href = `https://oceanbase.github.io${pageA.pathname}`;
  canonical.setAttribute('data-rh', 'true');
  document.title = pageA.title;

  const tree = (page) => {
    const canonicalUrl = `https://oceanbase.github.io${page.pathname}`;
    return React.createElement(HelmetProvider, null,
      React.createElement(Helmet, null,
        React.createElement('title', null, page.title),
        React.createElement('link', {rel: 'canonical', href: canonicalUrl}),
        React.createElement('meta', {name: 'description', content: page.description}),
        React.createElement('meta', {property: 'og:title', content: page.title}),
      ),
      React.createElement(Utterances, {...defaults, ...page, canonicalUrl}),
    );
  };
  const flushHelmet = async () => {
    await act(async () => {
      const callbacks = [...animationFrames.values()];
      animationFrames.clear();
      callbacks.forEach((callback) => callback(0));
      await Promise.resolve();
    });
  };

  await act(async () => root.render(tree(pageA)));
  await flushHelmet();
  window.history.replaceState(null, '', pageB.pathname);
  await act(async () => root.render(tree(pageB)));
  assert.ok(animationFrames.size > 0, 'the real Helmet update should still be deferred');
  assert.equal(document.title, pageA.title);
  assert.equal(document.querySelector('link[rel="canonical"]').href, `https://oceanbase.github.io${pageA.pathname}`);
  assert.equal(container.querySelector('iframe'), null, 'do not create an iframe with previous-page metadata');

  await flushHelmet();
  const params = frameParameters();
  assert.equal(params.get('url'), `https://oceanbase.github.io${pageB.pathname}`);
  assert.equal(params.get('title'), pageB.title);
  assert.equal(params.get('description'), pageB.description);
  assert.equal(params.get('og:title'), pageB.title);
});

test('unmount cancels a pending metadata observation before it can consume an OAuth callback', async () => {
  window.history.replaceState(null, '', '/docs/next?utterances=pending-test-session');
  await render({pathname: '/docs/next'}, false, true);
  assert.equal(container.querySelector('iframe'), null);
  await act(async () => root.unmount());
  root = undefined;
  document.querySelector('link[rel="canonical"]').href = 'https://oceanbase.github.io/docs/next';
  await act(async () => { await Promise.resolve(); });
  assert.equal(new URL(window.location.href).searchParams.get('utterances'), 'pending-test-session');
});

test('server rendering does not access browser globals or emit a script or iframe', () => {
  const browserWindow = globalThis.window;
  const browserDocument = globalThis.document;
  try {
    delete globalThis.window;
    delete globalThis.document;
    const html = renderToString(React.createElement(Utterances, defaults));
    assert.equal(html.includes('<script'), false);
    assert.equal(html.includes('<iframe'), false);
  } finally {
    globalThis.window = browserWindow;
    globalThis.document = browserDocument;
  }
});
