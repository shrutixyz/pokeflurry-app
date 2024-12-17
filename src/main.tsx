import { App } from './app/components/app.js';
import './createPost.js';

import { Devvit, useState } from '@devvit/public-api';

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: 'initialData';
      data: { username: string; currentCounter: number };
    }
  | {
      type: 'setCounter';
      data: { newCounter: number };
    }
  | {
      type: 'updateCounter';
      data: { currentCounter: number };
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({name: 'Pokeflurry', height: 'tall', render: App})


export default Devvit;
