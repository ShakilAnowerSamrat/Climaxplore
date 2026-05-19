export const WorldMapSVG = () => (
  <svg
    viewBox="0 0 1000 500"
    className="absolute inset-0 w-full h-full opacity-90 pointer-events-none"
    style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
  >
    {/* Continents and major countries */}
    {/* North America */}
    <path
      d="M150 120 L280 110 L290 140 L320 130 L340 160 L300 180 L280 200 L250 190 L200 200 L180 180 L150 160 Z"
      fill="rgba(34, 197, 94, 0.4)"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2"
    />
    {/* South America */}
    <path
      d="M250 220 L280 210 L290 240 L300 280 L290 320 L270 340 L250 330 L240 300 L245 260 Z"
      fill="rgba(34, 197, 94, 0.4)"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2"
    />
    {/* Europe */}
    <path
      d="M480 100 L520 95 L530 110 L525 130 L510 140 L490 135 L475 120 Z"
      fill="rgba(34, 197, 94, 0.4)"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2"
    />
    {/* Africa */}
    <path
      d="M470 150 L520 145 L540 170 L545 200 L540 240 L520 270 L500 280 L480 270 L470 240 L475 200 L470 170 Z"
      fill="rgba(34, 197, 94, 0.4)"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2"
    />
    {/* Asia */}
    <path
      d="M550 90 L700 85 L720 110 L740 130 L750 160 L730 180 L700 170 L680 150 L650 140 L620 130 L580 120 L550 110 Z"
      fill="rgba(34, 197, 94, 0.4)"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2"
    />
    {/* Australia */}
    <path
      d="M720 280 L780 275 L790 290 L785 305 L770 310 L750 305 L730 295 Z"
      fill="rgba(34, 197, 94, 0.4)"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2"
    />

    {/* Major country labels */}
    <text
      x="220"
      y="160"
      fontSize="12"
      fill="rgba(34, 197, 94, 0.8)"
      fontWeight="500"
    >
      USA
    </text>
    <text
      x="265"
      y="280"
      fontSize="12"
      fill="rgba(34, 197, 94, 0.8)"
      fontWeight="500"
    >
      Brazil
    </text>
    <text
      x="500"
      y="120"
      fontSize="12"
      fill="rgba(34, 197, 94, 0.8)"
      fontWeight="500"
    >
      Europe
    </text>
    <text
      x="500"
      y="220"
      fontSize="12"
      fill="rgba(34, 197, 94, 0.8)"
      fontWeight="500"
    >
      Africa
    </text>
    <text
      x="650"
      y="130"
      fontSize="12"
      fill="rgba(34, 197, 94, 0.8)"
      fontWeight="500"
    >
      Asia
    </text>
    <text
      x="750"
      y="295"
      fontSize="12"
      fill="rgba(34, 197, 94, 0.8)"
      fontWeight="500"
    >
      Australia
    </text>

    {/* Ocean areas */}
    <circle
      cx="100"
      cy="200"
      r="30"
      fill="rgba(59, 130, 246, 0.2)"
      stroke="rgba(59, 130, 246, 0.4)"
      strokeWidth="1"
      strokeDasharray="3,3"
    />
    <circle
      cx="400"
      cy="250"
      r="40"
      fill="rgba(59, 130, 246, 0.2)"
      stroke="rgba(59, 130, 246, 0.4)"
      strokeWidth="1"
      strokeDasharray="3,3"
    />
    <circle
      cx="850"
      cy="200"
      r="35"
      fill="rgba(59, 130, 246, 0.2)"
      stroke="rgba(59, 130, 246, 0.4)"
      strokeWidth="1"
      strokeDasharray="3,3"
    />

    {/* Ocean labels */}
    <text
      x="100"
      y="205"
      fontSize="10"
      fill="rgba(59, 130, 246, 0.7)"
      textAnchor="middle"
    >
      Atlantic
    </text>
    <text
      x="400"
      y="255"
      fontSize="10"
      fill="rgba(59, 130, 246, 0.7)"
      textAnchor="middle"
    >
      Atlantic
    </text>
    <text
      x="850"
      y="205"
      fontSize="10"
      fill="rgba(59, 130, 246, 0.7)"
      textAnchor="middle"
    >
      Pacific
    </text>

    {/* Latitude/Longitude grid lines */}
    <g
      stroke="rgba(107, 114, 128, 0.2)"
      strokeWidth="0.5"
      strokeDasharray="2,2"
    >
      {/* Latitude lines */}
      <line x1="0" y1="125" x2="1000" y2="125" /> {/* 60°N */}
      <line x1="0" y1="167" x2="1000" y2="167" /> {/* 30°N */}
      <line x1="0" y1="250" x2="1000" y2="250" /> {/* Equator */}
      <line x1="0" y1="333" x2="1000" y2="333" /> {/* 30°S */}
      <line x1="0" y1="375" x2="1000" y2="375" /> {/* 60°S */}
      {/* Longitude lines */}
      <line x1="167" y1="0" x2="167" y2="500" /> {/* 120°W */}
      <line x1="333" y1="0" x2="333" y2="500" /> {/* 60°W */}
      <line x1="500" y1="0" x2="500" y2="500" /> {/* 0° */}
      <line x1="667" y1="0" x2="667" y2="500" /> {/* 60°E */}
      <line x1="833" y1="0" x2="833" y2="500" /> {/* 120°E */}
    </g>

    {/* Coordinate labels */}
    <g fontSize="8" fill="rgba(107, 114, 128, 0.6)">
      <text x="10" y="130">
        60°N
      </text>
      <text x="10" y="172">
        30°N
      </text>
      <text x="10" y="255">
        0°
      </text>
      <text x="10" y="338">
        30°S
      </text>
      <text x="10" y="380">
        60°S
      </text>

      <text x="165" y="15">
        120°W
      </text>
      <text x="330" y="15">
        60°W
      </text>
      <text x="495" y="15">
        0°
      </text>
      <text x="662" y="15">
        60°E
      </text>
      <text x="828" y="15">
        120°E
      </text>
    </g>
  </svg>
);