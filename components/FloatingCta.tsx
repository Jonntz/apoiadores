'use client';

import { useEffect, useState } from 'react';
import { Arrow } from './Arrow';
import { SIGNUP_FORM_ID } from './SupporterForm';
import styles from './FloatingCta.module.css';

/**
 * Mobile-only sticky CTA. Appears once the hero has scrolled away and hides
 * again over the signup form, where it would cover the fields it points at.
 *
 * Uses IntersectionObserver rather than a scroll handler: the browser does the
 * work off the main thread and the callback only fires on the two crossings.
 */
export function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('topo');
    const formCard = document.getElementById(SIGNUP_FORM_ID);
    if (!hero || !formCard) return;

    const state = { heroGone: false, atForm: false };
    const sync = () => setVisible(state.heroGone && !state.atForm);

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry) state.heroGone = !entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );

    // Watches the form card, not the whole section: the section is ~1000px tall,
    // so keying off it hid the button for most of the page. The negative bottom
    // margin keeps the button up until the card is properly in view, rather than
    // dropping it the instant the card's top edge appears.
    const formObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry) state.atForm = entry.isIntersecting;
        sync();
      },
      { threshold: 0, rootMargin: '0px 0px -35% 0px' },
    );

    heroObserver.observe(hero);
    formObserver.observe(formCard);
    return () => {
      heroObserver.disconnect();
      formObserver.disconnect();
    };
  }, []);

  return (
    <a
      className={`${styles.cta} ${visible ? styles.visible : ''}`}
      href="#cadastro"
      // Keeps it out of the tab order and off screen readers while hidden.
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
    >
      Junte-se à militância digital do Matheusinho
      {Arrow}
    </a>
  );
}
