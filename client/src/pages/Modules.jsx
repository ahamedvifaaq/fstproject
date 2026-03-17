import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Module.css';

export default function Modules() {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [open,setOpen]=useState(false);
    const navigate=useNavigate();
    useEffect(() => {
        console.log("Fetching modules for course ID:", courseId);
                fetch(`http://localhost:5000/api/course/${courseId}/modules`)
                .then(response => response.json())
                .then(data =>{ console.log(data); setModules(Array.isArray(data) ? data : []); })
                .catch(error => console.error("Error fetching modules:", error));
        }, []);

        const openLesson=(lessonId)=>{
          navigate(`/lesson/${lessonId}`)
        }
  return (
     <div className="modules-page">

      

      {modules.map((module, index) => (

        <div key={index} className="module">

          <div
            className="module-header"
            onClick={() =>
              setOpen(open=== index ? null : index)
            }
          ><span className="arrow">{open === index ? '▼' : '▶'}</span>
             {module.title}
          </div>

          {open === index && (

            <div className="lessons">

              {[...new Map(module.lessons.map(l => [String(l.lessonId?._id || l.lessonId), l])).values()].map((lesson, i) => (

                <div
                  key={i}
                  className="lesson"
                  onClick={() =>
                    openLesson(lesson.lessonId._id)
                  }
                >
                  ▶ {lesson.title}
                </div>

              ))}

            </div>

          )}

        </div>

      ))}

    </div> 
)}

    
