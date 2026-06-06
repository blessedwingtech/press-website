'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteArticleAction } from '@/app/journalist/actions';

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Supprimer définitivement cet article ?')) {
      startTransition(() => {
        deleteArticleAction(articleId);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded font-bold transition-colors text-[11px] cursor-pointer disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
      {isPending ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}