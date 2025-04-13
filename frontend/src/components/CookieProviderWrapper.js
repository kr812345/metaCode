'use client';

import { CookiesProvider } from 'react-cookie';

export default function CookieProviderWrapper({ children }) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
