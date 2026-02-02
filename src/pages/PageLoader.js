import "./PageLoader.css";
import loaderImg from "./assets/AashakaLoader.gif";

export default function PageLoader() {
  return (
    <div className="page-loader">
      <img
        src={loaderImg}
        alt="Aashaka Loader"
        className="loader-image"
      />
    </div>
  );
}
