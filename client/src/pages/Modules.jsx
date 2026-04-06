import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Module.css';

export default function Modules() {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [open,setOpen]=useState(false);
    const navigate=useNavigate();
    const [overlay,setOverlay]=useState(false);
    const [moverlay,setMoverlay]=useState(false);
    const[lessoninfo,setLessonInfo]=useState({title:"",videoLength:"",language:"",timeline:[],moduleId:"",courseId:courseId,audioUrl:""});
    const [activateLesson,setActiveLesson]=useState(null);
    const[moduleinfo,setmoduleInfo]=useState({title:"",courseId:courseId});
    useEffect(() => {
        console.log("Fetching modules for course ID:", courseId);
        const token = localStorage.getItem("accessToken");
        fetch(`http://localhost:5000/api/course/${courseId}/modules`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response =>{ if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
    return response.json(); })
        .then(data =>{ console.log(data); setModules(Array.isArray(data) ? data : []); })
        .catch(error => console.error("Error fetching modules:", error));
    }, []);

        const openLesson=(lessonId,title)=>{
          console.log("Opening lesson with ID:", lessonId);
          navigate(`/lesson/${lessonId}/${title}`)
        }
        const addlesson=(moduleId)=>{
          console.log("Adding lesson to module ID:", moduleId);
        }
        const summit=()=>{
          console.log("Submitting new lesson");
          navigate(`/createlesson/${courseId}/${lessoninfo.moduleId}/${lessoninfo.title}/${lessoninfo.language}`);
          setOverlay(false);
        }
        const addmodule=()=>{ 
          console.log("Submitting new module");
          const token = localStorage.getItem("accessToken");
          fetch(`http://localhost:5000/api/addmodule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({courseId: courseId, title: moduleinfo.title})
          })
          .then(response => response.json())
          .then(data => {
            console.log("Module added:", data);
            setModules([...modules, { title: moduleinfo.title, lessons: [] }]);
            setMoverlay(false);
            navigate(`/course/${courseId}/modules`);
          })
          .catch(error => console.error("Error adding module:", error));
        }
  return (
     <div className="timeline-page">
      {localStorage.getItem("role") === "instructor" && (
        <div className='addmodule'>
          <button className='btn' onClick={() => setMoverlay(true)}>Add Module</button>
        </div>
      )}
      <div className='overlay' style={{display: overlay ? 'block' : 'none'}}>
        <div className='overlay-content'>
          <h2>Add Lesson</h2>
          <input 
            type="text" 
            placeholder="Lesson Title" 
            value={lessoninfo.title}
            onChange={(e) => setLessonInfo({...lessoninfo, title: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Language (e.g., English, Spanish)" 
            value={lessoninfo.language}
            onChange={(e) => setLessonInfo({...lessoninfo, language: e.target.value})}
          />
          
          <button onClick={summit}>Submit</button>
        </div>
      </div>
      
     
      <div className='overlay' style={{display: moverlay ? 'block' : 'none'}}>
        <div className='overlay-content'>
          <h2>Add Module</h2>
          <input 
            type="text" 
            placeholder="module Title" 
            value={moduleinfo.title}
            onChange={(e) => setmoduleInfo({...moduleinfo, title: e.target.value})}
          />  
          <button onClick={() => { addmodule(); setMoverlay(false); }}>Submit</button>
        </div>
      </div>

      {modules.map((module, index) => (

        <div key={index} className="module-block">

          <div
            className="module-title"
            onClick={() =>
              setOpen(open=== index ? null : index)
            }
          ><span className="arrow">{open === index ? '▼' : '▶'}</span>
             {module.title}
             
              <span style={{marginLeft: "20px",color:"gray"}}>{module.lessons.length==0?"No":module.lessons.length} Lessons</span>
             {localStorage.getItem("role") === "instructor" && (
                <button style={{marginLeft: "20px",padding: "4px 10px",backgroundColor:" #3b82f6",border: "none",borderRadius:"4px",color:"white"}} onClick={() =>{setOverlay(true); setLessonInfo({...lessoninfo, moduleId: module._id});}}>add lesson</button>
             )}
          </div>

          {open === index && (

            <div className="lesson-list">

              {[...new Map(module.lessons.map(l => [String(l.lessonId?._id || l.lessonId), l])).values()].map((lesson, i) => (
                console.log("Rendering lesson:", lesson),
                <div
                  key={i}
                  className="lesson-row"
                  onClick={() =>
                    openLesson(lesson.lessonId ,module.title)
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

    
