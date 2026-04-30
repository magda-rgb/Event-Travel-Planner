import { useEffect, useState } from 'react';

function readInitialTheme() {
  if (typeof window === 'undefined') return false;

  const storedTheme = window.localStorage.getItem('theme');
  if (storedTheme === 'dark') return true;
  if (storedTheme === 'light') return false;

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function useThemeToggle() {
  const [themeOn, setThemeOn] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeOn);
    window.localStorage.setItem('theme', themeOn ? 'dark' : 'light');
  }, [themeOn]);

  function toggleTheme() {
    setThemeOn((prev) => !prev);
  }

  return { themeOn, toggleTheme, setThemeOn };
}
