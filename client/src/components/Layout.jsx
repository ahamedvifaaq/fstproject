import Sidebar from "../components/sidebar.jsx";

export default function Layout({children}) {
  return (
    <div style={{display:"flex"}}>

      <Sidebar />

      <div style={{marginLeft:"220px", width:"100%"}}>
        {children}
      </div>

    </div>
  );
}