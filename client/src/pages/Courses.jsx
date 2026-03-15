import React,{useState,useEffect} from "react";
import './Courses.css';
import Sidebar from "../components/sidebar";
import { useNavigate} from "react-router-dom";
export default function Courses() { 
    const [showSidebar,setShowSidebar]=useState(false);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
            fetch(`http://localhost:5000/api/courses`)

            .then(response => response.json())
            .then(data =>{ console.log(data); setCourses(data)})
            .catch(error => console.error("Error fetching courses:", error));
    }, []);
    const startCourse = (courseId) => {
        
        console.log("Starting course with ID:", courseId);
        navigate(`/course/${courseId}/modules`);

        // Implement the logic to start the course, e.g., navigate to the course page
        
       
    }
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
                        <button onClick={()=>startCourse(course._id)} style={{marginLeft: "8px",
    padding: "6px 14px",
    backgroundColor:" #3b82f6",
    border: "none",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer"
    }}>start</button></div>
                        </div>
                        
                    </div>
                ))}
            </div>
        </div>
        
    );
}
