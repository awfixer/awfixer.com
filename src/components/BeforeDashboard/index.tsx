import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

const BeforeDashboard: React.FC = () => {
  return (
    <div className="mb-6">
      <Banner className="[&_h4]:m-0" type="success">
        <h4>Welcome to AWFixer and Friends!</h4>
      </Banner>
      Here&apos;s what to do next:
      <ul className="mb-2 list-decimal [&_li]:w-full">
        <li>
          <a
            href="/"
            target="_blank"
            className="transition-opacity hover:opacity-85"
            rel="noopener noreferrer"
          >
            Visit your website
          </a>
          {' to see your content and start managing your site.'}
        </li>
        <li>
          If you created this repo using Payload Cloud, head over to GitHub and clone it to your
          local machine. It will be under the <i>GitHub Scope</i> that you selected when creating
          this project.
        </li>
        <li>
          {'Modify your '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
            className="transition-opacity hover:opacity-85"
          >
            collections
          </a>
          {' and add more '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
            className="transition-opacity hover:opacity-85"
          >
            fields
          </a>
          {' as needed. If you are new to Payload, we also recommend you check out the '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
            className="transition-opacity hover:opacity-85"
          >
            Getting Started
          </a>
          {' docs.'}
        </li>
        <li>
          Commit and push your changes to the repository to trigger a redeployment of your project.
        </li>
      </ul>
      {'Pro Tip: This block is a '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
        className="transition-opacity hover:opacity-85"
      >
        custom component
      </a>
      , you can remove it at any time by updating your <strong>payload.config</strong>.
    </div>
  )
}

export default BeforeDashboard
