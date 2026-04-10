import React,{useState,useEffect} from "react";
import './Courses.css';
import Sidebar from "../components/sidebar";
import { useNavigate} from "react-router-dom";
export default function Courses() { 
    const [showSidebar,setShowSidebar]=useState(false);
    const [courses, setCourses] = useState([]);
    
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch(`http://localhost:5000/api/courses`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
    if (res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
    return res.json();
  })
        .then(data =>{ console.log(data.courses); setCourses(data.courses);localStorage.setItem("role",data.role)})
        .catch(error => console.error("Error fetching courses:", error));
    }, []);
    const startCourse = (courseId) => {
        
        console.log("Starting course with ID:", courseId);
        navigate(`/course/${courseId}/modules`);

        // Implement the logic to start the course, e.g., navigate to the course page
        
       
    }
    return (
        <div className="courses-page">
             <Sidebar title={"All Courses"} styles={"red"} />
             
             <div className="courses-container">
                 <div className="createcourse">
                     <h1>Explore Courses</h1>
                     {localStorage.getItem("role")==="instructor" && (
                         <button className="btn-primary" type="button" onClick={() => navigate(`/addcourse/${localStorage.getItem("userId")}`)}>
                             + Create New Course
                         </button>
                     )}
                 </div>

                 <div className="courses-grid">
                     {courses.map(course => (
                         <div key={course._id} className="course-card">
                             <div className="course-image-container">
                                 {/* Use placeholder image if none exists */}
                                 <img src={course.imageUrl || "/assets/course-placeholder.png"} alt={course.title} />
                                 <span className={`difficulty-badge ${course.difficulty || 'beginner'}`}>
                                     {course.difficulty || 'beginner'}
                                 </span>
                             </div>
                             
                             <div className="content">
                                 <h2>{course.title}</h2>
                                 <p className="description">{course.description || "No description provided."}</p>
                                 
                                 <div className="card-footer">
                                     <span className={`price ${course.price === 0 ? 'free' : ''}`}>
                                         {course.price === 0 ? 'Free' : `$${course.price}`}
                                     </span>
                                     <button className="btn-start" onClick={()=>startCourse(course._id)}>
                                         Start Learning -&gt;
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
}
