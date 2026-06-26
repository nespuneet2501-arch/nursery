import React from "react";

interface PlantAddaLogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

export const PlantAddaLogo: React.FC<PlantAddaLogoProps> = ({
  className = "",
  size = 48,
  showTagline = true,
}) => {
  return (
    <svg
      id="plantadda-logo"
      viewBox="0 0 500 450"
      width={size}
      height={size * 0.9}
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="yellowRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4CAF50" />
          <stop offset="30%" stopColor="#81C784" />
          <stop offset="60%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>

        <linearGradient id="greenLeafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="50%" stopColor="#4CAF50" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>

        <linearGradient id="redPotGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="50%" stopColor="#D32F2F" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Main Circular Arc */}
      <path
        d="M 115 325 A 175 175 0 1 1 385 325"
        fill="none"
        stroke="url(#yellowRingGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        filter="url(#subtleShadow)"
      />

      {/* Sprout Leaves (Back/Left) */}
      <path
        d="M 235 195 C 150 170 170 110 210 95 C 235 120 235 160 235 195 Z"
        fill="url(#greenLeafGrad)"
      />
      <path
        d="M 225 140 Q 195 130 185 150"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Sprout Leaves (Back/Right) */}
      <path
        d="M 265 195 C 350 170 330 110 290 95 C 265 120 265 160 265 195 Z"
        fill="url(#greenLeafGrad)"
      />
      <path
        d="M 275 140 Q 305 130 315 150"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Sprout Leaves (Center Top) */}
      <path
        d="M 250 195 C 210 140 215 75 250 45 C 285 75 290 140 250 195 Z"
        fill="url(#greenLeafGrad)"
      />
      <path
        d="M 250 55 Q 240 100 250 160"
        fill="none"
        stroke="#1B5E20"
        strokeWidth="2"
        opacity="0.3"
      />
      <path
        d="M 250 45 C 235 80 240 115 248 135"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Red Terracotta Pot */}
      <g filter="url(#subtleShadow)">
        {/* Pot Rim */}
        <path
          d="M 205 180 L 295 180 C 298 180 300 182 300 185 L 300 195 C 300 198 298 200 295 200 L 205 200 C 202 200 200 198 200 195 L 200 182 C 200 180 202 180 205 180 Z"
          fill="url(#redPotGrad)"
        />
        {/* Pot Base */}
        <path
          d="M 212 200 L 222 258 C 223 264 228 268 234 268 L 266 268 C 272 268 277 264 278 258 L 288 200 Z"
          fill="url(#redPotGrad)"
        />
        {/* Pot Rim Shine */}
        <line
          x1="205"
          y1="185"
          x2="295"
          y2="185"
          stroke="#FFCDD2"
          strokeWidth="1.5"
          opacity="0.4"
          strokeLinecap="round"
        />
      </g>

      {/* Yellow Roster Sign "NURSERY" */}
      <g filter="url(#subtleShadow)">
        {/* Pointer block */}
        <path
          d="M 335 195 L 435 195 C 445 195 455 205 455 215 C 455 220 455 220 460 223 L 472 230 L 460 237 C 455 240 455 240 455 245 L 455 250 C 455 260 445 270 435 270 L 335 270 C 325 270 315 260 315 250 L 315 215 C 315 205 325 195 335 195 Z"
          fill="#FFEB3B"
          stroke="#D32F2F"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Sign Text */}
        <text
          x="385"
          y="245"
          fill="#1B5E20"
          fontSize="24"
          fontWeight="900"
          fontFamily="'Inter', system-ui, sans-serif"
          letterSpacing="1"
          textAnchor="middle"
        >
          NURSERY
        </text>
        {/* Mini Leaf on Roster Sign */}
        <path
          d="M 370 195 C 365 175 385 165 395 170 C 390 185 380 195 370 195 Z"
          fill="#4CAF50"
          stroke="#1B5E20"
          strokeWidth="1"
        />
      </g>

      {/* Main Text: "Plant'Adda" */}
      <g filter="url(#subtleShadow)">
        {/* "Plant" in Forest Green */}
        <text
          x="48"
          y="318"
          fill="#1B5E20"
          fontSize="90"
          fontWeight="900"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          letterSpacing="-3"
        >
          Plant
        </text>

        {/* Leaf Apostrophe */}
        <path
          d="M 270 248 C 265 228 285 218 295 223 C 290 238 280 248 270 248 Z"
          fill="#4CAF50"
        />

        {/* "Adda" in Crimson Red */}
        <text
          x="280"
          y="318"
          fill="#B71C1C"
          fontSize="90"
          fontWeight="900"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          letterSpacing="-3"
        >
          Adda
        </text>
      </g>

      {/* Green Swoosh Underline */}
      <path
        d="M 50 330 C 150 310 350 310 450 330 C 300 350 200 350 50 330 Z"
        fill="#4CAF50"
      />

      {/* Tagline */}
      {showTagline && (
        <text
          x="250"
          y="368"
          fill="#1B5E20"
          fontSize="19"
          fontWeight="800"
          fontFamily="'Inter', system-ui, sans-serif"
          letterSpacing="0.5"
          textAnchor="middle"
        >
          — Your Green Companion —
        </text>
      )}

      {/* Bottom Pair of Decorative Leaves */}
      <g filter="url(#subtleShadow)">
        {/* Left Leaf */}
        <path
          d="M 240 375 C 160 380 160 445 240 445 C 240 445 250 420 240 375 Z"
          fill="url(#greenLeafGrad)"
        />
        <path
          d="M 195 412 Q 220 405 235 390"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Right Leaf */}
        <path
          d="M 260 375 C 340 380 340 445 260 445 C 260 445 250 420 260 375 Z"
          fill="url(#greenLeafGrad)"
        />
        <path
          d="M 305 412 Q 280 405 265 390"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>
    </svg>
  );
};
