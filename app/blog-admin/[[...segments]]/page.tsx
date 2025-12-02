import { RenderAdmin } from '@payloadcms/next/views'
import { importConfig } from 'payload'
import React from 'react'

type Args = {
  params: {
    segments: string[]
  }
  searchParams: {
    [key: string]: string | string[]
  }
}

const Page = async ({ params, searchParams }: Args) => {
  const { segments = [] } = params

  const config = await importConfig('@/payload.config.ts')

  return RenderAdmin({
    config,
    importMap: config.admin.importMap,
    params: {
      segments,
    },
    searchParams,
  })
}

export default Page
