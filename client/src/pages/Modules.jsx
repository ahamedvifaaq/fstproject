import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


export default function Modules() {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);

    useEffect(() => {
        console.log("Fetching modules for course ID:", courseId);
                fetch(`http://localhost:5000/api/course/${courseId}/modules`)
                .then(response => response.json())
                .then(data =>{ console.log(data); setModules(data)})
                .catch(error => console.error("Error fetching modules:", error));
        }, []);
  return (
    <div style={{padding:20 ,backgroundColor:"#f0f0f0",minHeight:"100vh"}}>
        <h1>Modules for Course ID: {courseId}</h1>
        <ul>
            {modules.map(module => (
                <li key={module._id}>{module.title}</li>
            ))}
        </ul>
        
      
    </div>
  )
}
