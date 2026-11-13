/**
 * Tour Configuration
 * 
 * This file contains tour step definitions for driver.js
 * Personalized and sweet descriptions for a birthday celebration
 */

/**
 * Welcome Tour - Shown on home page
 */
export const WELCOME_TOUR_STEPS = [
  {
    element: 'body',
    popover: {
      title: '👋 Hey there!',
      description: 'Thanks so much for coming and spending time with me today! I\'m so excited to show you all the sweet memories I\'ve put together for you. This is going to be fun!',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.music-player-toggle',
    popover: {
      title: '🎵 Got some music',
      description: 'Want some good vibes? Click here to open the music player and jam while you explore!',
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    element: '.theme-toggle',
    popover: {
      title: '🌙 Night mode ready',
      description: 'Not a morning person? Switch to dark mode whenever you like for a cozy experience.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
];

/**
 * Birthday celebration page tour
 */
export const BIRTHDAY_CELEBRATION_TOUR_STEPS = [
  {
    element: '.instructions',
    popover: {
      title: '🎈 A little birthday surprise',
      description: 'Pop these balloons by tapping or clicking them. Miss one? Press any key to pop the next balloon.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.balloon-field',
    popover: {
      title: '✨ Pop all three',
      description: 'Each balloon reveals a little more of the birthday surprise. Once they are all popped, the cake is ready!',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
];

/**
 * User Selection Page Tour
 */
export const USER_SELECTION_TOUR_STEPS = [
  {
    element: '.selection-title',
    popover: {
      title: '🎭 Choose your profile',
      description: 'Pick the profile that feels right for today. Each one has its own little note waiting.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.users',
    popover: {
      title: '✨ Pick one',
      description: 'Click on any profile here to make this experience feel a little more personal.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.proceed-button',
    popover: {
      title: '🚀 Ready?',
      description: 'Once a profile is selected, use this button to continue to the next part.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
];

/**
 * Greeting Page Tour
 */
export const GREETING_TOUR_STEPS = [
  {
    element: '.greeting-card',
    popover: {
      title: '💌 A little pause first',
      description: 'This card gives each person their own small greeting moment before everything opens up.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.profile-orbit',
    popover: {
      title: '✨ This one is yours',
      description: 'The selected profile stays here so the greeting feels personal before the memories begin.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.continue-button',
    popover: {
      title: '✨ Ready for the reveal?',
      description: 'When you are ready, click here and let the moment unfold on its own.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
];

/**
 * Timeline Page Tour
 */
export const TIMELINE_TOUR_STEPS = [
  {
    element: '.memory-header',
    popover: {
      title: '🌟 These are your moments',
      description: 'Welcome to the timeline! All the memories, photos, and conversations are right here, collected over time just for you.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.special-section',
    popover: {
      title: '💖 These marked something special',
      description: 'These moments meant something extra to me. Each one has its own beautiful story and maybe a little wisdom to share!',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.timeline-shell',
    popover: {
      title: '📜 The full journey',
      description: 'Scroll through and soak it all in! All the memories I\'ve saved laid out in order, waiting for you to explore.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.timeline-card',
    popover: {
      title: '💭 Memories with meaning',
      description: 'Each card here holds a memory - the story, the vibes, the photos, and the conversations. Take your time with each one!',
      side: 'right' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.back-button',
    popover: {
      title: '⬅️ Go back anytime',
      description: 'Click here whenever you want to go back and explore a different era!',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
];

/**
 * Alternative tour steps - Music Player focused
 */
export const MUSIC_PLAYER_TOUR_STEPS = [
  {
    element: '.music-player-toggle',
    popover: {
      title: '🎵 Let\'s get the music going',
      description: 'Click to expand and start playing your favorite songs!',
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    element: '.play-button',
    popover: {
      title: '▶️ Hit play',
      description: 'Start or pause the song anytime.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.controls button:first-child',
    popover: {
      title: '⏮️ Go back',
      description: 'Want to hear the previous track again?',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '.controls button:last-child',
    popover: {
      title: '⏭️ Next up',
      description: 'Skip to the next song when you\'re ready.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '.timeline',
    popover: {
      title: '⏱️ Jump ahead',
      description: 'Drag to skip to any part of the song you want.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '.volume',
    popover: {
      title: '🔊 Volume control',
      description: 'Make it loud or keep it chill - your choice!',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
];
