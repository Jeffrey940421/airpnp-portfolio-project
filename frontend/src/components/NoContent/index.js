import noResultIcon from "../../assets/logo/noResultIcon.svg";
import "./NoContent.css";

export function NoContent({ text }) {
  return (
    <div className="textBox">
      <img className="noResult" src={noResultIcon} />
      <p>{text}</p>
    </div>
  )
}
