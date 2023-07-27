import "./Loader.css";

export function Loader({ text }) {
  return (
    <>
      <div className="spinLoader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loaderText" style={{"white-space": "pre-line"}}>{text}</p>
    </>
  )
}
