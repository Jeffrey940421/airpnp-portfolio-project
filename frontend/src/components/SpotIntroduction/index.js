export function SpotIntroduction({text}) {
  return (
    <div className="introduction">
      <h2>About This Place</h2>
      <p style={{"white-space": "pre-line"}}>{text}</p>
    </div>
  )
}
