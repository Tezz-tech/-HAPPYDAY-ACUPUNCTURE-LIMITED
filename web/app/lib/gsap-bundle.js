// GSAP and its free plugins, registered once. Loaded after first paint (see hooks/useGsap.js),
// so the 160 KB first-load JavaScript budget (CLAUDE.md) is spent on the page, not on animation.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
