import { getExpectedRequestStore } from '../../client/components/request-async-storage.external'

import type { DraftModeProvider } from '../../server/async-storage/draft-mode-provider'

import { staticGenerationAsyncStorage } from '../../client/components/static-generation-async-storage.external'
import { trackDynamicDataAccessed } from '../app-render/dynamic-rendering'

/**
 * In this version of Next.js `draftMode()` returns a Promise however you can still reference the properties of the underlying draftMode object
 * synchronously to faciliate migration. The `DangerouslyUnwrapDraftMode` type is added to your code by a codemod that attempts to automatically
 * updates callsites to reflect the new Promise return type. There are some cases where `draftMode()` cannot be automatically converted, namely
 * when it is used inside a synchronous function and we can't be sure the function can be made async automtically. In these cases we add an
 * explicit type case to `DangerouslyUnwrapDraftMode` to enable typescript to allow for the synchronous usage only where it is actually necessary.
 *
 * You should should update these callsites to either be async functions where the `draftMode()` value can be awaited or you should call `draftMode()`
 * from outside and await the return value before passing it into this function.
 *
 * You can find instances that require manual migration by searching for `DangerouslyUnwrapDraftMode` in your codebase or by search for a comment that
 * starts with:
 *
 * ```
 * // TODO [sync-draftMode-usage]
 * ```
 * In a future version of Next.js `draftMode()` will only return a Promise and you will not be able to access the underlying draftMode object directly
 * without awaiting the return value first. When this change happens the type `DangerouslyUnwrapDraftMode` will be updated to reflect that is it no longer
 * usable.
 *
 * This type is marked deprecated to help identify it as target for refactoring away.
 *
 * @deprecated
 */
export type DangerouslyUnwrapDraftMode = DraftMode

export function draftMode(): Promise<DraftMode> {
  const callingExpression = 'draftMode'
  const requestStore = getExpectedRequestStore(callingExpression)

  if (process.env.NODE_ENV === 'development') {
    const staticGenerationStore = staticGenerationAsyncStorage.getStore()
    const route = staticGenerationStore?.route
    return createExoticDraftModeWithDevWarnings(requestStore.draftMode, route)
  } else {
    return createExoticDraftMode(requestStore.draftMode)
  }
}

interface CacheLifetime {}
const CachedDraftModes = new WeakMap<CacheLifetime, Promise<DraftMode>>()

function createExoticDraftMode(
  underlyingProvider: DraftModeProvider
): Promise<DraftMode> {
  const cachedDraftMode = CachedDraftModes.get(underlyingProvider)
  if (cachedDraftMode) {
    return cachedDraftMode
  }

  const underlying = new DraftMode(underlyingProvider)
  const promise = Promise.resolve(underlying)
  CachedDraftModes.set(underlyingProvider, promise)

  Object.defineProperty(promise, 'isEnabled', {
    get() {
      return underlying.isEnabled
    },
    set(newValue) {
      Object.defineProperty(promise, 'isEnabled', {
        value: newValue,
        writable: true,
        enumerable: true,
      })
    },
    enumerable: true,
    configurable: true,
  })
  ;(promise as any).enable = underlying.enable.bind(underlying)
  ;(promise as any).disable = underlying.disable.bind(underlying)

  return promise
}

function createExoticDraftModeWithDevWarnings(
  underlyingProvider: DraftModeProvider,
  route: undefined | string
): Promise<DraftMode> {
  const cachedDraftMode = CachedDraftModes.get(underlyingProvider)
  if (cachedDraftMode) {
    return cachedDraftMode
  }

  const underlying = new DraftMode(underlyingProvider)
  const promise = Promise.resolve(underlying)
  CachedDraftModes.set(underlyingProvider, promise)

  Object.defineProperty(promise, 'isEnabled', {
    get() {
      const expression = 'draftMode().isEnabled'
      warnForSyncAccess(route, expression)
      return underlying.isEnabled
    },
    set(newValue) {
      Object.defineProperty(promise, 'isEnabled', {
        value: newValue,
        writable: true,
        enumerable: true,
      })
    },
    enumerable: true,
    configurable: true,
  })

  Object.defineProperty(promise, 'enable', {
    value: function get() {
      const expression = 'draftMode().enable()'
      warnForSyncAccess(route, expression)
      return underlying.enable.apply(underlying, arguments as any)
    },
  })

  Object.defineProperty(promise, 'disable', {
    value: function get() {
      const expression = 'draftMode().disable()'
      warnForSyncAccess(route, expression)
      return underlying.disable.apply(underlying, arguments as any)
    },
  })

  return promise
}

class DraftMode {
  /**
   * @internal - this declaration is stripped via `tsc --stripInternal`
   */
  private readonly _provider: DraftModeProvider

  constructor(provider: DraftModeProvider) {
    this._provider = provider
  }
  get isEnabled() {
    return this._provider.isEnabled
  }
  public enable() {
    const store = staticGenerationAsyncStorage.getStore()
    if (store) {
      // We we have a store we want to track dynamic data access to ensure we
      // don't statically generate routes that manipulate draft mode.
      trackDynamicDataAccessed(store, 'draftMode().enable()')
    }
    return this._provider.enable()
  }
  public disable() {
    const store = staticGenerationAsyncStorage.getStore()
    if (store) {
      // We we have a store we want to track dynamic data access to ensure we
      // don't statically generate routes that manipulate draft mode.
      trackDynamicDataAccessed(store, 'draftMode().disable()')
    }
    return this._provider.disable()
  }
}

function warnForSyncAccess(route: undefined | string, expression: string) {
  const prefix = route ? ` In route ${route} a ` : 'A '
  console.error(
    `${prefix}\`draftMode()\` property was accessed directly with \`${expression}\`. \`draftMode()\` now returns a Promise and the return value should be awaited before accessing properties of the underlying draftMode object. In this version of Next.js direct access to \`${expression}\` is still supported to faciliate migration but in a future version you will be required to await the result. If this \`draftMode()\` use is inside an async function await the return value before accessing attempting iteration. If this use is inside a synchronous function then convert the function to async or await the call from outside this function and pass the result in.`
  )
}
