const svgClass = 'h-full w-full text-neutral-950';
const stroke = 'currentColor';
const commonProps = {
  fill: 'none',
  stroke,
  strokeWidth: '1.8',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function RoomScene() {
  return (
    <svg viewBox="0 0 360 220" className={svgClass} role="img" aria-label="空房間、窗戶、桌子與椅子的黑白線框分鏡">
      <rect x="28" y="22" width="304" height="176" rx="4" {...commonProps} />
      <path d="M28 164h304M72 164V48h94v116M72 91h94M119 48v116" {...commonProps} />
      <path d="M202 135h92M214 135v38M282 135v38M218 173h60" {...commonProps} />
      <path d="M97 178v-35h44v35M91 178h56M103 143l-8-16h52l-8 16" {...commonProps} />
      <path d="M190 52h95M190 68h73M190 84h96" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function HallwayScene() {
  return (
    <svg viewBox="0 0 360 220" className={svgClass} role="img" aria-label="走廊、門與牆上相框的黑白線框分鏡">
      <path d="M42 30h276v166H42zM97 196l32-166M263 196 231 30M129 30h102v166H129z" {...commonProps} />
      <path d="M74 82h35v48H74zM252 70h45v68h-45zM151 72h58v124h-58z" {...commonProps} />
      <path d="M197 137h3M151 106h58M173 72v124M67 154h226M91 48h31M238 49h34" {...commonProps} />
      <path d="M58 44h52M54 58h42M267 159h35M250 174h51" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function StreetScene() {
  return (
    <svg viewBox="0 0 360 220" className={svgClass} role="img" aria-label="雨中街道、路燈與遠方建築的黑白線框分鏡">
      <path d="M24 158h312M55 158 26 196M305 158l30 38M82 196h196" {...commonProps} />
      <path d="M72 72h52v86H72zM124 96h47v62h-47zM229 83h59v75h-59zM288 111h34v47h-34z" {...commonProps} />
      <path d="M194 158V61M178 61h32M184 73c7-15 20-15 27 0" {...commonProps} />
      <path d="M47 35 34 62M92 28 78 58M143 35l-13 29M239 31l-16 34M301 37l-13 30M214 95l-12 26M323 81l-13 28M164 124l-10 20" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M84 92h12M105 112h10M241 104h12M267 123h9M139 118h13" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function WindowScene() {
  return (
    <svg viewBox="0 0 360 220" className={svgClass} role="img" aria-label="安靜窗邊、光線與空椅子的黑白線框分鏡">
      <path d="M34 34h292v154H34zM82 52h112v98H82zM138 52v98M82 101h112" {...commonProps} />
      <path d="M194 52 292 188M170 101l79 87M82 150l52 38" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
      <path d="M231 171v-42h50v42M222 171h68M238 129l-9-18h60l-8 18M242 171v23M276 171v23" {...commonProps} />
      <path d="M62 188h250M213 73h70M223 91h54M48 62h18M48 80h18" {...commonProps} />
    </svg>
  );
}

export const sceneByStage = {
  起: RoomScene,
  承: HallwayScene,
  轉: StreetScene,
  合: WindowScene,
};
