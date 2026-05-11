import Link from "next/link";
import MenuButton from "./MenuButton";

export default function Nav() {
  return (
    <div className="nav-container" id="nav">
      <div className="nav-left" id="home">
        <Link href="/" className="home-btn">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/home-default.svg" className="icon default" alt="Home icon" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/home-hover.svg" className="icon hover" alt="Home icon" />
        </Link>
      </div>

      <div className="nav-right" id="tab">
        <MenuButton />
      </div>
    </div>
  );
}
