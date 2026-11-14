import { useEffect } from 'react';
import { invitationMetadata, metadataTags } from '../data/sharing.js';

export function InvitationMetadata({ guest }) {
  useEffect(() => {
    const meta = invitationMetadata(guest, location.origin);
    document.title = meta.title;
    for (const [attribute, name, content] of metadataTags(meta)) {
      let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, name); document.head.append(tag); }
      tag.setAttribute('content', content);
    }
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = meta.url;
  }, [guest]);
  return null;
}
