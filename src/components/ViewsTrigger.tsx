'use client';

import { useEffect } from 'react';
import { incrementArticleViews } from '@/app/articles/actions';

interface ViewsTriggerProps {
  articleId: string;
}

export default function ViewsTrigger({ articleId }: ViewsTriggerProps) {
  useEffect(() => {
    // Appel de la Server Action pour incrémenter de façon unique la vue
    incrementArticleViews(articleId);
  }, [articleId]);

  return null;
}
