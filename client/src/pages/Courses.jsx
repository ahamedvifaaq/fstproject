import React,{useState,useEffect} from "react";
import './Courses.css';
import Sidebar from "../components/sidebar";
export default function Courses() { 
    const [showSidebar,setShowSidebar]=useState(false);
    const [courses, setCourses] = useState([{_id:"69adbf0c0372a72251d090a7",title:"python for beginners",description:"learn python from scratch",difficulty:"beginner",price:9.99},{_id:"69adbf0c0372a72251d090a8",title:"javascript for beginners",description:"learn javascript from scratch",difficulty:"beginner",price:9.99},{_id:"69adbf0c0372a72251d090a9",title:"react for beginners",description:"learn react from scratch",difficulty:"beginner",price:9.99}]);
    useEffect(() => {
            fetch(`http://localhost:5000/api/courses`)
            .then(response => response.json())
            .then(data =>{ console.log(data); setCourses(data)})
            .catch(error => console.error("Error fetching courses:", error));
    }, []);
    return (
        
        <div className="courses-page">
             <Sidebar title={"All Coureses"} styles={"red"} />
            <h1 style={{marginLeft:10}}></h1>
            <div className="courses-grid">
                {courses.map(course => (
                    <div key={course._id} className="course-card">
                        <div className="content">
                        <h2>{course.title}</h2>
                        <p>{course.description}</p>
                        <p>Difficulty: {course.difficulty}</p>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <p>price: ${course.price}</p>
                        <button style={{marginLeft: "8px",
    padding: "6px 14px",
    backgroundColor:" #3b82f6",
    border: "none",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer"}}>start</button></div>
                        </div>
                        
                    </div>
                ))}
            </div>
        </div>
        
    );
}
