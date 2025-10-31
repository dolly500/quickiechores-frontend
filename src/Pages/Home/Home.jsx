import { useState } from "react";
import Header from "../../Components/Header/Header";
import ExploreMenu from "../../Components/ExploreMenu/ExploreMenu";
import ServiceDisplay from "../../Components/ServiceDisplay/ServiceDisplay";
// import FeatureServices from "../../Components/Feature/FeatureServices";
import DIYSection from "../DiySection/DiySection";
import Allposts from "../../Pages/Posts/AllPosts";
import MostBookedChores from "../../Components/MostBookedService/MostBookedService";
import Reviews from '../../Pages/Reviews'

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div>
      <style>{`
        /* Apply only on desktop (1024px and above) */
        @media (min-width: 1024px) {
          .home-container {
            width: 80%;
            margin: 0 auto;
          }
        }
      `}</style>

      <div className="home-container">
        <Header />
        <ExploreMenu category={category} setCategory={setCategory} />
        <ServiceDisplay category={category} />
        {/* <FeatureServices category={category} /> */}
        <MostBookedChores category={category} />
        <DIYSection category={category} />
        <Reviews category={category} />
        <Allposts category={category} />
      </div>
    </div>
  );
};

export default Home;
