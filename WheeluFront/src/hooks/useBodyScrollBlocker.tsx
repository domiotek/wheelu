import { useRef } from 'react';

/**
 * Blocks scrolling of the whole page (body element).
 * Usefull, when you want to scroll something directly above page like modals without
 * scrolling whole page along with it.
 *
 * Usage:
 * const [blockScroll, allowScroll] = useBodyScrollBlocker();
 */
export default () => {
    const scrollBlocked = useRef<boolean>(false);

    const blockScroll = () => {
        if (scrollBlocked.current) return;
        document.body.style.paddingRight = `${window.innerWidth - document.body.clientWidth}px`;
        document.body.style.overflow = "hidden";

        scrollBlocked.current = true;
    };

    const allowScroll = () => {
        if (!scrollBlocked.current) return;

        document.body.style.paddingRight = "";
        document.body.style.overflow = "";

        scrollBlocked.current = false;
    };

  return [blockScroll, allowScroll];
};