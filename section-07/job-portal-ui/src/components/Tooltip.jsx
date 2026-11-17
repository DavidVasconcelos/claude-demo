import { useId } from "react";

export const Tooltip = ({ text, children }) => {
  const id = useId();

  return (
    <span className="group/tooltip relative inline-block">
      {children({ "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-3 w-64 max-w-[90vw] -translate-x-1/2 translate-y-1 rounded-xl border border-gray-700/50 bg-gray-800/95 p-3 text-center text-xs leading-relaxed text-gray-300 opacity-0 shadow-xl backdrop-blur transition-all duration-300 group-hover/tooltip:visible group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100"
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600/20 to-purple-600/20"></span>
        <span className="relative">{text}</span>
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-gray-700/50 bg-gray-800"></span>
      </span>
    </span>
  );
};
