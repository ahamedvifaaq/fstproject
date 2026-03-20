import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Module.css';

export default function Modules() {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [open,setOpen]=useState(false);
    const navigate=useNavigate();
    const [activateLesson,setActiveLesson]=useState(null);
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
     <div className="timeline-page">

      {modules.map((module, index) => (

        <div key={index} className="module-block">

          <div
            className="module-title"
            onClick={() =>
              setOpen(open=== index ? null : index)
            }
          ><span className="arrow">{open === index ? '▼' : '▶'}</span>
             {module.title}
          </div>

          {open === index && (

            <div className="lesson-list">

              {[...new Map(module.lessons.map(l => [String(l.lessonId?._id || l.lessonId), l])).values()].map((lesson, i) => (

                <div
                  key={i}
                  className="lesson-row"
                  onClick={() =>
                    openLesson(lesson.lessonId._id)
                  }
                >
                  <div className="circle"></div>
                  <div className='lesson-content'>
                      <span className='lesson-title'>{lesson.title}</span>
                      <span>{lesson.videoLength}</span>
                  </div>
                </div>

              ))}

            </div>

          )}

        </div>

      ))}

    </div> 
)}

    
