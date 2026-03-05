import { Link } from "react-router";

function Services() {
  return (
    <div className="services-page">
      <h1 className="nav-brand mb-4">Szolgáltatások</h1>

      <ul className="services-buttons">
       <Link to="/fodraszok" className="btn service-btn ">Fodrászok</Link>
        <Link to="/kozmetikusok" className="btn service-btn ">Kozmetikusok</Link>
        <Link to="/mukormosok" className="btn service-btn ">Műkörmösök</Link>
      </ul>
      
    </div>
  );
}

export default Services;