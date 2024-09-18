'use client'

import type { DangerouslyUnwrapSearchParams } from 'next/server'

import { getSentinelValue } from '../../../../getSentinelValue'

type AnySearchParams = { [key: string]: string | string[] | undefined }

export default function Page({
  searchParams,
}: {
  searchParams: Promise<AnySearchParams>
}) {
  const castedSearchParams =
    searchParams as unknown as DangerouslyUnwrapSearchParams<
      typeof searchParams
    >
  return (
    <>
      <p>This page access a search param synchonrously</p>
      <p>The `use` is inside a Suspense boundary</p>
      <p>With PPR we expect the page to have a partially static page</p>
      <p>Without PPR we expect the page to be dynamic</p>
      <Component searchParams={castedSearchParams} />
      <ComponentTwo />
    </>
  )
}

function Component({ searchParams }: { searchParams: AnySearchParams }) {
  const copied = { ...searchParams }
  return (
    <>
      <div>
        <p>This component clones search params and then prints</p>
        <ul>
          {Object.keys(copied).map((k) => {
            return (
              <li key={k}>
                {k}:{' '}
                <span data-value={true} id={'value-' + k}>
                  {copied[k]}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <span id="page">{getSentinelValue()}</span>
    </>
  )
}

function ComponentTwo() {
  return null
}
