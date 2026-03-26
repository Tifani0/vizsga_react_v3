import { Link } from "react-router";

function Services() {
  return (
  <>
  
      <h1 className="nav-brand mb-4">Szolgáltatások</h1>
    <div className="">
      <div className="">

    <div className=" service-col">
    <Link to="/fodraszok" className=" service-btn"> Fodrászok </Link>
    </div>
    <div className="  service-col">
  <Link to="/kozmetikusok" className="service-btn "> Kozmetikusok </Link>
      
    </div>
    <div className="  service-col">
  <Link to="/mukormosok" className="service-btn "> Műkörmösök </Link>
    </div>
      </div>
    </div>

  </>

  
  );
}

export default Services;