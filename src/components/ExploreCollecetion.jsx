import "./ExploreCollection.css";
import { withPublicUrl } from "../utils/assetPath";

export default function ExploreCollection() {
  return (
    <section className="explore-collection">
      <img
        src={withPublicUrl("images/bannernewasaga.jpeg")}
        alt="Explore Collection"
        className="explore-image"
      />

     
    </section>
  );
}

