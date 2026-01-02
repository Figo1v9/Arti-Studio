import { useMedia } from 'react-use';

export function useIsMobile(breakpoint: number = 768) {
  return useMedia(`(max-width: ${breakpoint}px)`, false);
}
