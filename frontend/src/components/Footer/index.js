import "./Footer.css";

export function Footer() {
  return (
    <footer>
      <span>© 2023 Airbnb, Inc.</span>
      <div className="socialMedia">
        <span>Contact Us</span>
        <i className="fa-brands fa-square-facebook" />
        <i className="fa-brands fa-square-twitter" />
        <i className="fa-brands fa-square-instagram" />
        <a href="https://github.com/Jeffrey940421/airpnp-portfolio-project">
          <i className="fa-brands fa-square-github" />
        </a>
      </div>
    </footer>
  )
}
