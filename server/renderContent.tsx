import { renderToString } from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { ChunkExtractor } from '@loadable/server';
import path from 'path';
import { Provider } from 'react-redux';
import { AnyAction, CombinedState, Store } from 'redux';
import { ApplicationState } from '../redux/reducers';

function renderContentLoadable(
  App: () => JSX.Element,
  context: any,
  location: any,
  store: Store<CombinedState<ApplicationState>, AnyAction>
) {
  let webStats = path.resolve(__dirname, '../build/loadable-stats.json');

  if (process.env.NODE_ENV === 'development') {
    webStats = path.resolve(__dirname, '../dev/stats.json');
  }
  const extractor = new ChunkExtractor({ statsFile: webStats });
  const jsx = extractor.collectChunks(
    <div id="app">
      <Provider store={store}>
        <StaticRouter location={location} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    </div>
  );

  const html = renderToString(jsx);
  const scriptTags = extractor.getScriptTags();
  const linkTags = extractor.getLinkTags();
  const styleTags = extractor.getStyleTags();

  return {
    html,
    scriptTags,
    linkTags,
    styleTags,
  };
}

function renderReduxState(preloadedState: any) {
  return `<script>
    // WARNING: See the following for security issues around embedding JSON in HTML:
    // https://redux.js.org/recipes/server-rendering/#security-considerations
    window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
      /</g,
      '\\u003c'
    )}
  </script>`;
}

export { renderContentLoadable, renderReduxState };
