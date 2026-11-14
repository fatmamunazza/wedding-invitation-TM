import { assets, assetUrl, settings, weddingDetails } from '../data/index.js';

export function WelcomePage({ invalid = false }) {
  return <main className="welcome-page" style={{ '--body-font': settings.typography.body, '--script-font': settings.typography.script }}>
    <picture className="welcome-page__background" aria-hidden="true">
      <source media="(min-aspect-ratio: 1/1)" srcSet={assetUrl(assets.pinkBackgroundDesktop)} />
      <img src={assetUrl(assets.pinkBackground)} alt="" />
    </picture>
    <section className="welcome-page__copy" aria-labelledby="welcome-title">
      <img className="welcome-page__crest" src={assetUrl(assets.crest)} alt="MT wedding crest" />
      <p className="welcome-page__greeting">Assalamu Alaikum</p>
      <h1 id="welcome-title">{invalid ? 'Invitation not found' : weddingDetails.shortNames}</h1>
      <span className="welcome-page__divider" aria-hidden="true">✧</span>
      <p>{invalid ? 'Please check the invitation link shared with you, or ask the family for a new link.' : 'With love and gratitude, we welcome you to our wedding.'}</p>
      {!invalid && <p className="welcome-page__hint">Please open your personal invitation link to view the celebration details.</p>}
      {invalid && <a href={import.meta.env.BASE_URL}>Back to welcome</a>}
    </section>
  </main>;
}
