import { useEffect } from 'react';

export function usePageTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} | Breed`;
    return () => { document.title = prev; };
  }, [title]);
}
