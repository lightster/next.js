// eslint-disable-next-line import/no-extraneous-dependencies
export {
  renderToReadableStream,
  decodeReply,
  decodeAction,
  decodeFormState,
} from 'react-server-dom-webpack/server.edge'

// eslint-disable-next-line import/no-extraneous-dependencies
export { prerender } from 'react-server-dom-webpack/static.edge'

import LayoutRouter from '../../client/components/layout-router'
import RenderFromTemplateContext from '../../client/components/render-from-template-context'
import { staticGenerationAsyncStorage } from '../../client/components/static-generation-async-storage.external'
import { requestAsyncStorage } from '../../client/components/request-async-storage.external'
import { prerenderAsyncStorage } from './prerender-async-storage.external'
import { actionAsyncStorage } from '../../client/components/action-async-storage.external'
import { ClientPageRoot } from '../../client/components/client-page'
import { ClientSegmentRoot } from '../../client/components/client-segment'
import {
  createServerSearchParamsForServerPage,
  createServerSearchParamsForClientPage,
  createServerSearchParamsForMetadata,
} from '../request/search-params'
import {
  createServerParamsForServerSegment,
  createServerParamsForClientSegment,
  createServerParamsForMetadata,
} from '../request/params'
import * as serverHooks from '../../client/components/hooks-server-context'
import { NotFoundBoundary } from '../../client/components/not-found-boundary'
import { patchFetch as _patchFetch } from '../lib/patch-fetch'
// not being used but needs to be included in the client manifest for /_not-found
import '../../client/components/error-boundary'

import {
  preloadStyle,
  preloadFont,
  preconnect,
} from '../../server/app-render/rsc/preloads'
import { Postpone } from '../../server/app-render/rsc/postpone'
import { taintObjectReference } from '../../server/app-render/rsc/taint'

// patchFetch makes use of APIs such as `React.unstable_postpone` which are only available
// in the experimental channel of React, so export it from here so that it comes from the bundled runtime
function patchFetch() {
  return _patchFetch({
    staticGenerationAsyncStorage,
    requestAsyncStorage,
    prerenderAsyncStorage,
  })
}

export {
  LayoutRouter,
  RenderFromTemplateContext,
  staticGenerationAsyncStorage,
  requestAsyncStorage,
  actionAsyncStorage,
  createServerSearchParamsForServerPage,
  createServerSearchParamsForClientPage,
  createServerSearchParamsForMetadata,
  createServerParamsForServerSegment,
  createServerParamsForClientSegment,
  createServerParamsForMetadata,
  serverHooks,
  preloadStyle,
  preloadFont,
  preconnect,
  Postpone,
  taintObjectReference,
  ClientPageRoot,
  ClientSegmentRoot,
  NotFoundBoundary,
  patchFetch,
}
