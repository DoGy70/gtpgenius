"use client";
import { useState } from "react";
import { BsMoonFill, BsSunFill } from "react-icons/bs";

const themes = {
  winter: "winter",
  dracula: "dracula",
};

function ThemeToggle() {
  const [theme, setTheme] = useState(themes.winter);

  function toggleTheme() {
    const newTheme = theme === themes.winter ? themes.dracula : themes.winter;
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  }

  return (
    <button onClick={toggleTheme} className="btn btn-outline btn-sm">
      {theme === themes.dracula ? (
        <BsSunFill className="h-4 w-4" />
      ) : (
        <BsMoonFill className="h-4 w-4" />
      )}
    </button>
  );
}
export default ThemeToggle;
