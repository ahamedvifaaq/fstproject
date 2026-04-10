import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import './Module.css';

export default function Modules() {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [open,setOpen]=useState(false);
    const navigate=useNavigate();
    const [overlay,setOverlay]=useState(false);
    const [moverlay,setMoverlay]=useState(false);
    const[lessoninfo,setLessonInfo]=useState({title:"",videoLength:"",language:"javascript",timeline:[],moduleId:"",courseId:courseId,audioUrl:""});
    const [activateLesson,setActiveLesson]=useState(null);
    const[moduleinfo,setmoduleInfo]=useState({title:"",courseId:courseId});
    // const LANGUAGES = ["javascript", "python", "cpp", "java"];
    const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "r",
  "scala",
  "sql",
  "shell",
  "pascal",
  "perl",
  "lua",
  "haskell",
  "clojure",
  "fsharp",
  "vb",
  "objective-c"
];
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        // Fetch Modules
        fetch(`http://localhost:5000/api/course/${courseId}/modules`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => { 
            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                throw new Error("Unauthorized");
            }
            return response.json(); 
        })
        .then(data => setModules(Array.isArray(data) ? data : []))
        .catch(error => console.error("Error fetching modules:", error));

        if (token && localStorage.getItem("role") !== "instructor") {
            // Auto-enroll when student visits course
            fetch(`http://localhost:5000/api/course/${courseId}/enroll`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(console.error);

            // Fetch User profile to get completed lessons
            fetch(`http://localhost:5000/api/user/profilepage`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(userData => {
                if(userData.enrolledCourses) {
                    const currentEnrollment = userData.enrolledCourses.find(ec => String(ec.courseId?._id || ec.courseId) === String(courseId));
                    if(currentEnrollment && currentEnrollment.completedLessons) {
                        // Support both raw string arrays and populated object arrays
                        const completedIds = currentEnrollment.completedLessons.map(cl => String(cl._id || cl));
                        setCompletedLessons(completedIds);
                    }
                }
            })
            .catch(err => console.error("Could not fetch user profile", err));
        }
    }, [courseId]);

        const openLesson=(lessonId,title)=>{
          console.log("Opening lesson with ID:", lessonId);
          navigate(`/lesson/${lessonId}/${title}`)
        }
        const addlesson=(moduleId)=>{
          console.log("Adding lesson to module ID:", moduleId);
        }
        const summit=()=>{
          if(!lessoninfo.title) {
            alert("Please enter a lesson title");
            return;
          }
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
            setModules([...modules, { _id: data.moduleId, title: moduleinfo.title, lessons: [] }]);
            setMoverlay(false);
          })
          .catch(error => console.error("Error adding module:", error));
        }

        const handleDeleteModule = async (moduleId) => {
            if(!window.confirm("Are you sure you want to permanently delete this module?")) return;
            const token = localStorage.getItem("accessToken");
            try {
                const res = await fetch(`http://localhost:5000/api/deletemodule/${courseId}/${moduleId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(res.ok) {
                    setModules(modules.filter(m => String(m._id) !== String(moduleId)));
                }
            } catch(e) { console.error(e); }
        };

        const handleDeleteLesson = async (e, moduleId, lessonId) => {
            e.stopPropagation();
            if(!window.confirm("Are you sure you want to permanently delete this lesson?")) return;
            const token = localStorage.getItem("accessToken");
            try {
                const res = await fetch(`http://localhost:5000/api/deletelesson/${courseId}/${moduleId}/${lessonId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(res.ok) {
                    const newModules = [...modules];
                    const targetModule = newModules.find(m => String(m._id) === String(moduleId));
                    if(targetModule) {
                        targetModule.lessons = targetModule.lessons.filter(l => String(l.lessonId?._id || l.lessonId) !== String(lessonId));
                        setModules(newModules);
                    }
                }
            } catch(e) { console.error(e); }
        };

  return (
     <div className="modules-page">
      <Sidebar title="Modules" styles={"#a855f7"} />
      {localStorage.getItem("role") === "instructor" && (
        <div className='module-header'>
          <h1>Course Modules</h1>
          <button onClick={() => setMoverlay(true)}>Add Module</button>
        </div>
      )}
      <div className='overlay' onClick={() => setOverlay(false)}  style={{display: overlay ? 'flex' : 'none'}}>
        <div className='overlay-content'  onClick={(e) => e.stopPropagation()} >
          <h2>Add Lesson</h2>
          <input 
            type="text" 
            placeholder="Lesson Title" 
            value={lessoninfo.title}
            onChange={(e) => setLessonInfo({...lessoninfo, title: e.target.value})}
          />
          <select onChange={(e) => setLessonInfo({...lessoninfo, language: e.target.value})} value={lessoninfo.language}> 
        {LANGUAGES.map((lang) => (
          <option key={lang}>{lang}</option>
        ))}
      </select>
          {/* <input 
            type="text" 
            placeholder="Language (e.g., English, Spanish)" 
            value={lessoninfo.language}
            onChange={(e) => setLessonInfo({...lessoninfo, language: e.target.value})}
          /> */}
          
          <button onClick={summit}>Submit</button>
        </div>
      </div>
      
     
      <div className='overlay' onClick={() => setMoverlay(false)}  style={{display: moverlay ? 'flex' : 'none'}}>
        <div className='overlay-content'  onClick={(e) => e.stopPropagation()} >
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

      <div className="module-list">
      {modules.map((module, index) => (

        <div key={index} className="module-item">

          <div
            className="module-title"
            onClick={() =>
              setOpen(open === index ? null : index)
            }
          >
             <span className="arrow">{open === index ? '▼' : '▶'}</span>
             <span>{module.title}</span>
             <span className="lesson-count">{module.lessons.length === 0 ? "No" : module.lessons.length} Lessons</span>
             
             {localStorage.getItem("role") === "instructor" && (
                <div className="action-buttons">
                  <button style={{padding: "6px 12px", backgroundColor: "#3b82f6", border: "none", borderRadius: "6px", color: "white", fontSize: "0.85rem"}} onClick={(e) =>{e.stopPropagation(); setOverlay(true); setLessonInfo({...lessoninfo, moduleId: module._id, title: "", language: "javascript"});}}>Add Lesson</button>
                  <button style={{padding: "6px 12px", backgroundColor: "#ef4444", border: "none", borderRadius: "6px", color: "white", fontSize: "0.85rem", cursor: "pointer"}} onClick={(e) => {e.stopPropagation(); handleDeleteModule(module._id);}}>🗑 Delete</button>
                </div>
             )}
          </div>

          {open === index && (
            <div className="module-list">
              <ul>
              {[...new Map(module.lessons.map(l => [String(l.lessonId?._id || l.lessonId), l])).values()].map((lesson, i) => {
                const lessonIdString = String(lesson.lessonId?._id || lesson.lessonId);
                const isCompleted = completedLessons.includes(lessonIdString);
                
                return (
                <li
                  key={i}
                  onClick={() => openLesson(lesson.lessonId, module.title)}
                  style={{cursor: 'pointer'}}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{width: 8, height: 8, borderRadius: '50%', background: isCompleted ? '#4ade80' : '#cbd5e1'}}></div>
                    <span className='lesson-title' style={{fontWeight: 600, color: isCompleted ? '#4ade80' : '#fff'}}>{lesson.title}</span>
                    {isCompleted && <span style={{color: '#4ade80', fontSize: '1.2rem', marginLeft: '5px'}}>✓</span>}
                  </div>
                  <span style={{color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '15px'}}>
                    {lesson.videoLength}s
                    {localStorage.getItem("role") === "instructor" && (
                      <span onClick={(e) => handleDeleteLesson(e, module._id, lessonIdString)} style={{color: '#ef4444', fontSize: '1.2rem', cursor:'pointer'}} title="Delete Lesson">🗑</span>
                    )}
                  </span>
                </li>
              )})}
              </ul>
            </div>
          )}

        </div>

      ))}
      </div>
    </div> 
)}

    
