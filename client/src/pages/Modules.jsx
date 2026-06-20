import React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import CourseReviews from '../components/CourseReviews';
import { FaTrash } from 'react-icons/fa';
import './Module.css';

export default function Modules() {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
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
        .then(data => {
            // Backend now returns { modules, isOwner }; fall back to array for safety
            if (Array.isArray(data)) {
                setModules(data);
            } else {
                setModules(Array.isArray(data.modules) ? data.modules : []);
                setIsOwner(!!data.isOwner);
            }
        })
        .catch(error => console.error("Error fetching modules:", error));

        const currentRole = localStorage.getItem("role");

        // Auto-enroll only students when they visit a course
        if (token && currentRole !== "instructor" && currentRole !== "admin") {
            fetch(`http://localhost:5000/api/course/${courseId}/enroll`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(console.error);
        }

        // Fetch completed lessons for ANY logged-in user so completion shows for everyone
        if (token) {
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

    // Flatten lessons in display order to find the next one to learn
    const orderedLessons = useMemo(() => {
        const list = [];
        modules.forEach((m, mi) => {
            const seen = new Set();
            (m.lessons || []).forEach(l => {
                const id = String(l.lessonId?._id || l.lessonId);
                if (seen.has(id)) return;
                seen.add(id);
                list.push({ id, moduleIndex: mi });
            });
        });
        return list;
    }, [modules]);

    // The current lesson = first lesson not yet completed (null if all done)
    const currentLesson = useMemo(
        () => orderedLessons.find(l => !completedLessons.includes(l.id)) || null,
        [orderedLessons, completedLessons]
    );
    const notStarted = completedLessons.length === 0;

    // Auto-expand the module holding the next lesson (or the first module) once data loads
    const autoOpenedRef = useRef(false);
    useEffect(() => {
        if (!autoOpenedRef.current && modules.length > 0) {
            setOpen(currentLesson ? currentLesson.moduleIndex : 0);
            autoOpenedRef.current = true;
        }
    }, [modules, currentLesson]);

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
      {isOwner && (
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
             
             {isOwner && (
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
                const isCurrent = !isOwner && currentLesson && lessonIdString === currentLesson.id;

                return (
                <li
                  key={i}
                  className={`${isCurrent ? 'current-lesson' : ''} ${isCompleted ? 'completed-lesson' : ''}`.trim()}
                  onClick={() => openLesson(lesson.lessonId, module.title)}
                  style={{cursor: 'pointer'}}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    {isCompleted ? (
                      <span className="lesson-check">✓</span>
                    ) : (
                      <div style={{width: isCurrent ? 12 : 8, height: isCurrent ? 12 : 8, borderRadius: '50%', background: isCurrent ? '#a855f7' : '#cbd5e1'}}></div>
                    )}
                    <span className='lesson-title' style={{fontWeight: isCurrent ? 800 : 600, fontSize: isCurrent ? '1.15rem' : '1rem', color: isCompleted ? '#4ade80' : '#fff'}}>{lesson.title}</span>
                    {isCompleted && <span className="completed-badge">✓ Completed</span>}
                    {isCurrent && (
                      <span className="continue-badge">
                        ▶ {notStarted ? 'Start here' : 'Continue'}
                      </span>
                    )}
                  </div>
                  <span style={{color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '15px'}}>
                    {lesson.videoLength}s
                    {isOwner && (
                      <span onClick={(e) => handleDeleteLesson(e, module._id, lessonIdString)} title="Delete Lesson" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', transition: 'background-color 0.15s ease'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}><FaTrash size={14} /></span>
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

      <CourseReviews courseId={courseId} />
    </div>
)}

    
