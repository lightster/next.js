import { DangerouslyUnwrapParams } from 'next/server'

import { getSentinelValue } from '../../../../../../../getSentinelValue'

export default async function Page({
  params,
  children,
}: {
  params: Promise<{ lowcard: string; highcard: string }>
  children: React.ReactNode
}) {
  const syncParams = params as unknown as DangerouslyUnwrapParams<typeof params>
  return (
    <section>
      <p>
        This Layout does key checking of the params prop in a server component
        without awaiting first
      </p>
      <div>
        page lowcard:{' '}
        <span id="param-has-lowcard">
          {'' + Reflect.has(syncParams, 'lowcard')}
        </span>
      </div>
      <div>
        page highcard:{' '}
        <span id="param-has-highcard">
          {'' + Reflect.has(syncParams, 'highcard')}
        </span>
      </div>
      <div>
        page foo:{' '}
        <span id="param-has-foo">{'' + Reflect.has(syncParams, 'foo')}</span>
      </div>
      <span id="page">{getSentinelValue()}</span>
      {children}
    </section>
  )
}
