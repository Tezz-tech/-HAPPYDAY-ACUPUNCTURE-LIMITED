import { NotFoundBody } from '../components/layout/NotFoundBody.jsx';
import { seoMeta } from '../lib/seo.js';

export function meta() {
  return [...seoMeta({ title: 'Page not found | Happyday Acupuncture', description: 'This page could not be found.', path: '/404' }), { name: 'robots', content: 'noindex' }];
}

export default function NotFound() {
  return <NotFoundBody />;
}
