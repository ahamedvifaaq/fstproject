import React,{useState,useEffect} from "react";
import './Courses.css';
export default function Courses() { 
    const [courses, setCourses] = useState([]);
    useEffect(() => {
            fetch(`http://localhost:5000/api/courses`)
            .then(response => response.json())
            .then(data =>{ console.log(data); setCourses(data)})
            .catch(error => console.error("Error fetching courses:", error));
    }, []);
    return (
        <div className="courses-page">
            <h1>My Courses</h1>
            <div className="courses-grid">
                {courses.map(course => (
                    <div key={course._id} className="course-card">
                        <h2>{course.title}</h2>
                        <p>{course.description}</p>
                        <p>Difficulty: {course.difficulty}</p>
                        <p>price: ${course.price}</p>
                        
                    </div>
                ))}
            </div>
        </div>
    );
}
