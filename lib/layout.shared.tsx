import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'AWFixer Help',
      url: '/help',
    },
    links: [
      {
        text: 'Back to Main Site',
        url: '/',
        active: 'none',
      },
    ],
  };
}
