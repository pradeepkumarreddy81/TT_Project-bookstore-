import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) {
      document.title = `${title} | The Bookstore Atelier`;
    }
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
