import { useParams } from "react-router-dom";
import "./Error.css";
import { useHistory } from "react-router-dom";

export function Error({ status }) {
  const params = useParams();
  const history = useHistory();
  const statusCode = status || (["400", "401", "403", "404", "408", "500"].includes(params.status) ? params.status : "404");
  let errorDescription;

  switch (statusCode) {
    case "400":
      errorDescription = "Bad Request";
      break;
    case "401":
      errorDescription = "Unauthorized";
      break;
    case "403":
      errorDescription = "Forbidden";
      break;
    case "404":
      errorDescription = "Not Found";
      break;
    case "408":
      errorDescription = "Request Timeout";
      break;
    case "500":
      errorDescription = "Internal Serval Error";
      break;
    default:
      errorDescription = "Unknown";
  }

  return (
    <div className="errorPage">
      <h1 className="errorTitle1">Error {statusCode}</h1>
      <h1 className="errorTitle2">{errorDescription}</h1>
      <img src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif" />
      <button onClick={() => history.push("/")}>Go to Home</button>
    </div>
  )

}
